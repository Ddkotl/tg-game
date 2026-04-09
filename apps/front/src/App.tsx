import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import {
  useAuthControllerAuthenticate,
  useBattleControllerAttack,
  usePlayerControllerClaimMeditation,
  usePlayerControllerGetLeaderboard,
  usePlayerControllerGetProfile,
  usePlayerControllerStartMeditation,
  usePlayerControllerUpgradeStats,
} from "./api/generated";
import "./App.css";

const queryClient = new QueryClient();

type PageKey = "profile" | "meditation" | "pvp" | "leaderboard";

function App() {
  const [playerId, setPlayerId] = useState("");
  const [initData, setInitData] = useState("");
  const [targetId, setTargetId] = useState("");
  const [upgradeStat, setUpgradeStat] = useState<"strength" | "defense">("strength");
  const [upgradePoints, setUpgradePoints] = useState(1);
  const [page, setPage] = useState<PageKey>("profile");
  const [message, setMessage] = useState("");

  const profileQuery = usePlayerControllerGetProfile(playerId, {
    query: { enabled: !!playerId },
  });

  const leaderboardQuery = usePlayerControllerGetLeaderboard(
    { page: 1, limit: 10 },
    { query: { enabled: page === "leaderboard" } },
  );

  const authMutation = useAuthControllerAuthenticate(
    {
      mutation: {
        onSuccess: (data) => {
          const player = data.data.data as any;
          if (player?.id) {
            setPlayerId(player.id);
            setMessage("Logged in successfully.");
          }
        },
        onError: () => {
          setMessage("Login failed. Check initData and try again.");
        },
      },
    },
    queryClient,
  );

  const startMeditationMutation = usePlayerControllerStartMeditation(
    {
      mutation: {
        onSuccess() {
          queryClient.invalidateQueries();
          setMessage("Meditation started.");
        },
        onError() {
          setMessage("Failed to start meditation.");
        },
      },
    },
    queryClient,
  );

  const claimMeditationMutation = usePlayerControllerClaimMeditation(
    {
      mutation: {
        onSuccess() {
          queryClient.invalidateQueries();
          setMessage("Meditation claimed successfully.");
        },
        onError() {
          setMessage("Claim failed. Ensure meditation is active.");
        },
      },
    },
    queryClient,
  );

  const upgradeStatsMutation = usePlayerControllerUpgradeStats(
    {
      mutation: {
        onSuccess() {
          queryClient.invalidateQueries();
          setMessage("Stats upgraded.");
        },
        onError() {
          setMessage("Upgrade failed. Check energy or input.");
        },
      },
    },
    queryClient,
  );

  const attackMutation = useBattleControllerAttack(
    {
      mutation: {
        onSuccess: () => {
          setMessage("Attack recorded.");
        },
        onError: () => {
          setMessage("Attack failed. Verify player IDs.");
        },
      },
    },
    queryClient,
  );

  const profile = profileQuery.data?.data.data as any;
  const leaderboard = (leaderboardQuery.data?.data.data as unknown as any[]) || [];

  const handleAuth = async () => {
    if (!initData.trim()) {
      setMessage("Please provide Telegram initData.");
      return;
    }
    await authMutation.mutateAsync({ data: { initData } });
  };

  const handleStartMeditation = async () => {
    if (!playerId) {
      setMessage("Login first.");
      return;
    }
    await startMeditationMutation.mutateAsync({ id: playerId });
  };

  const handleClaimMeditation = async () => {
    if (!playerId) {
      setMessage("Login first.");
      return;
    }
    await claimMeditationMutation.mutateAsync({ id: playerId });
  };

  const handleUpgrade = async () => {
    if (!playerId) {
      setMessage("Login first.");
      return;
    }

    await upgradeStatsMutation.mutateAsync({
      id: playerId,
      data: { stat: upgradeStat, points: upgradePoints },
    });
  };

  const handleAttack = async () => {
    if (!playerId || !targetId.trim()) {
      setMessage("Provide your player id and a target id.");
      return;
    }

    await attackMutation.mutateAsync({ data: { attackerId: playerId, defenderId: targetId } });
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="app-shell">
        <aside className="app-sidebar">
          <h1>TG RPG</h1>
          <nav>
            <button onClick={() => setPage("profile")} className={page === "profile" ? "active" : ""}>
              Profile
            </button>
            <button onClick={() => setPage("meditation")} className={page === "meditation" ? "active" : ""}>
              Meditation
            </button>
            <button onClick={() => setPage("pvp")} className={page === "pvp" ? "active" : ""}>
              PvP
            </button>
            <button onClick={() => setPage("leaderboard")} className={page === "leaderboard" ? "active" : ""}>
              Leaderboard
            </button>
          </nav>
          <section className="auth-panel">
            <h2>Telegram Login</h2>
            <textarea
              rows={4}
              value={initData}
              onChange={(event) => setInitData(event.target.value)}
              placeholder="Paste Telegram initData here"
            />
            <button onClick={handleAuth} disabled={authMutation.isPending}>
              Authenticate
            </button>
            {playerId ? <p className="meta">Player ID: {playerId}</p> : null}
          </section>
        </aside>

        <main className="app-main">
          <section className="status-panel">
            <p>{message}</p>
          </section>

          {page === "profile" && (
            <section>
              <h2>Profile</h2>
              {profileQuery.isLoading ? (
                <p>Loading profile...</p>
              ) : profile ? (
                <div className="card">
                  <p>
                    <strong>Username:</strong> {profile.username}
                  </p>
                  <p>
                    <strong>Created:</strong> {new Date(profile.createdAt).toLocaleString()}
                  </p>
                  <p>
                    <strong>Meditation active:</strong>{" "}
                    {profile.meditationStartedAt ? "yes" : "no"}
                  </p>
                  <h3>Stats</h3>
                  {profile.stats ? (
                    <ul>
                      <li>Strength: {profile.stats.strength}</li>
                      <li>Defense: {profile.stats.defense}</li>
                      <li>Energy: {profile.stats.energy}</li>
                    </ul>
                  ) : (
                    <p>No stats available.</p>
                  )}
                </div>
              ) : (
                <p>Authenticate to view profile.</p>
              )}
            </section>
          )}

          {page === "meditation" && (
            <section>
              <h2>Meditation</h2>
              <p>Start a meditation session and claim rewards later.</p>
              <div className="card actions">
                <button onClick={handleStartMeditation} disabled={!playerId || startMeditationMutation.isPending}>
                  Start Meditation
                </button>
                <button onClick={handleClaimMeditation} disabled={!playerId || claimMeditationMutation.isPending}>
                  Claim Reward
                </button>
              </div>
            </section>
          )}

          {page === "pvp" && (
            <section>
              <h2>PvP Combat</h2>
              <div className="card actions">
                <label>
                  Target player id
                  <input value={targetId} onChange={(event) => setTargetId(event.target.value)} />
                </label>
                <button onClick={handleAttack} disabled={!playerId || attackMutation.isPending}>
                  Attack
                </button>
              </div>
            </section>
          )}

          {page === "leaderboard" && (
            <section>
              <h2>Leaderboard</h2>
              {leaderboardQuery.isLoading ? (
                <p>Loading leaderboard...</p>
              ) : (
                <div className="leaderboard">
                  {leaderboard.map((item, index) => (
                    <div key={item.id} className="leaderboard-item">
                      <span>{index + 1}. {item.username}</span>
                      <span>{item.stats ? item.stats.strength + item.stats.defense + item.stats.energy : 0} pts</span>
                      <span>ID: {item.id}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          <section>
            <h2>Upgrade Stats</h2>
            <div className="card actions">
              <label>
                Stat
                <select value={upgradeStat} onChange={(event) => setUpgradeStat(event.target.value as "strength" | "defense")}>
                  <option value="strength">Strength</option>
                  <option value="defense">Defense</option>
                </select>
              </label>
              <label>
                Points
                <input
                  type="number"
                  min={1}
                  value={upgradePoints}
                  onChange={(event) => setUpgradePoints(Math.max(1, Number(event.target.value)))}
                />
              </label>
              <button onClick={handleUpgrade} disabled={!playerId || upgradeStatsMutation.isPending}>
                Upgrade
              </button>
            </div>
          </section>
        </main>
      </div>
    </QueryClientProvider>
  );
}

export default App;
