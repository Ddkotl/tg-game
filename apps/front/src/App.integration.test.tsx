import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import App from "./App";

// Mock server setup
const server = setupServer(
  // Mock auth endpoint
  http.post("http://localhost:3000/v1/auth/telegram", async () => {
    return HttpResponse.json({
      data: {
        id: "player-123",
        telegramId: "12345",
        username: "TestPlayer",
        createdAt: "2024-01-01T00:00:00.000Z",
        meditationStartedAt: null,
        stats: {
          id: "stats-123",
          playerId: "player-123",
          strength: 10,
          defense: 10,
          energy: 100,
        },
      },
      error: null,
    });
  }),

  // Mock profile endpoint
  http.get("http://localhost:3000/v1/player/player-123", async () => {
    return HttpResponse.json({
      data: {
        id: "player-123",
        telegramId: "12345",
        username: "TestPlayer",
        createdAt: "2024-01-01T00:00:00.000Z",
        meditationStartedAt: null,
        stats: {
          id: "stats-123",
          playerId: "player-123",
          strength: 10,
          defense: 10,
          energy: 100,
        },
      },
      error: null,
    });
  }),

  // Mock leaderboard endpoint
  http.get("http://localhost:3000/v1/player/leaderboard", async () => {
    return HttpResponse.json({
      data: [
        {
          id: "player-123",
          telegramId: "12345",
          username: "TestPlayer",
          createdAt: "2024-01-01T00:00:00.000Z",
          meditationStartedAt: null,
          stats: {
            id: "stats-123",
            playerId: "player-123",
            strength: 15,
            defense: 12,
            energy: 80,
          },
        },
      ],
      error: null,
    });
  }),

  // Mock meditation start endpoint
  http.post(
    "http://localhost:3000/v1/player/player-123/meditation/start",
    async () => {
      return HttpResponse.json({
        data: {
          id: "player-123",
          telegramId: "12345",
          username: "TestPlayer",
          createdAt: "2024-01-01T00:00:00.000Z",
          meditationStartedAt: "2024-01-09T12:00:00.000Z",
          stats: {
            id: "stats-123",
            playerId: "player-123",
            strength: 15,
            defense: 12,
            energy: 80,
          },
        },
        error: null,
      });
    },
  ),

  // Mock meditation claim endpoint
  http.post(
    "http://localhost:3000/v1/player/player-123/meditation/claim",
    async () => {
      return HttpResponse.json({
        data: {
          id: "player-123",
          telegramId: "12345",
          username: "TestPlayer",
          createdAt: "2024-01-01T00:00:00.000Z",
          meditationStartedAt: null,
          stats: {
            id: "stats-123",
            playerId: "player-123",
            strength: 16,
            defense: 13,
            energy: 130,
          },
        },
        error: null,
      });
    },
  ),

  // Mock upgrade stats endpoint
  http.post(
    "http://localhost:3000/v1/player/player-123/upgrade",
    async ({ request }) => {
      const body = (await request.json()) as any;
      return HttpResponse.json({
        data: {
          id: "player-123",
          telegramId: "12345",
          username: "TestPlayer",
          createdAt: "2024-01-01T00:00:00.000Z",
          meditationStartedAt: null,
          stats: {
            id: "stats-123",
            playerId: "player-123",
            strength: body.stat === "strength" ? 16 : 15,
            defense: body.stat === "defense" ? 13 : 12,
            energy: 110, // 130 - 20 cost
          },
        },
        error: null,
      });
    },
  ),

  // Mock attack endpoint
  http.post("http://localhost:3000/v1/battle/attack", async ({ request }) => {
    const body = (await request.json()) as any;
    return HttpResponse.json({
      data: {
        winner: "attacker",
        attackerId: body.attackerId,
        defenderId: body.defenderId,
      },
      error: null,
    });
  }),
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

describe("App", () => {
  beforeAll(() => server.listen());
  afterEach(() => {
    server.resetHandlers();
    queryClient.clear();
  });
  afterAll(() => server.close());

  it("renders the app title", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>,
    );

    expect(screen.getByText("TG RPG")).toBeInTheDocument();
  });

  it("allows user authentication", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>,
    );

    const textarea = screen.getByPlaceholderText(
      /Paste Telegram initData here/i,
    );
    const authButton = screen.getByRole("button", { name: /authenticate/i });

    fireEvent.change(textarea, {
      target: {
        value: "auth_date=1640995200&id=12345&username=TestPlayer&hash=test",
      },
    });
    fireEvent.click(authButton);

    await waitFor(() => {
      expect(screen.getByText("Logged in successfully.")).toBeInTheDocument();
    });

    expect(screen.getByText("Player ID: player-123")).toBeInTheDocument();
  });

  it("displays player profile after authentication", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>,
    );

    // Authenticate first
    const textarea = screen.getByPlaceholderText(
      /Paste Telegram initData here/i,
    );
    const authButton = screen.getByRole("button", { name: /authenticate/i });

    fireEvent.change(textarea, {
      target: {
        value: "auth_date=1640995200&id=12345&username=TestPlayer&hash=test",
      },
    });
    fireEvent.click(authButton);

    await waitFor(() => {
      expect(screen.getByText("Player ID: player-123")).toBeInTheDocument();
    });

    // Switch to profile page
    const profileButton = screen.getByRole("button", { name: /profile/i });
    fireEvent.click(profileButton);

    await waitFor(() => {
      expect(screen.getByText("Username:")).toBeInTheDocument();
      expect(screen.getByText("TestPlayer")).toBeInTheDocument();
      expect(screen.getByText("Strength: 10")).toBeInTheDocument();
      expect(screen.getByText("Defense: 10")).toBeInTheDocument();
      expect(screen.getByText("Energy: 100")).toBeInTheDocument();
    });
  });

  it("allows starting and claiming meditation", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>,
    );

    // Authenticate first
    const textarea = screen.getByPlaceholderText(
      /Paste Telegram initData here/i,
    );
    const authButton = screen.getByRole("button", { name: /authenticate/i });

    fireEvent.change(textarea, {
      target: {
        value: "auth_date=1640995200&id=12345&username=TestPlayer&hash=test",
      },
    });
    fireEvent.click(authButton);

    await waitFor(() => {
      expect(screen.getByText("Player ID: player-123")).toBeInTheDocument();
    });

    // Switch to meditation page
    const meditationButton = screen.getByRole("button", {
      name: /meditation/i,
    });
    fireEvent.click(meditationButton);

    // Start meditation
    const startButton = screen.getByRole("button", {
      name: /start meditation/i,
    });
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText("Meditation started.")).toBeInTheDocument();
    });

    // Claim meditation
    const claimButton = screen.getByRole("button", { name: /claim reward/i });
    fireEvent.click(claimButton);

    await waitFor(() => {
      expect(
        screen.getByText("Meditation claimed successfully."),
      ).toBeInTheDocument();
    });
  });

  it("allows upgrading stats", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>,
    );

    // Authenticate first
    const textarea = screen.getByPlaceholderText(
      /Paste Telegram initData here/i,
    );
    const authButton = screen.getByRole("button", { name: /authenticate/i });

    fireEvent.change(textarea, {
      target: {
        value: "auth_date=1640995200&id=12345&username=TestPlayer&hash=test",
      },
    });
    fireEvent.click(authButton);

    await waitFor(() => {
      expect(screen.getByText("Player ID: player-123")).toBeInTheDocument();
    });

    // Upgrade strength
    const pointsInput = screen.getByDisplayValue("1");
    const upgradeButton = screen.getByRole("button", { name: /upgrade/i });

    fireEvent.change(pointsInput, { target: { value: "2" } });
    fireEvent.click(upgradeButton);

    await waitFor(() => {
      expect(screen.getByText("Stats upgraded.")).toBeInTheDocument();
    });
  });

  it("allows attacking other players", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>,
    );

    // Authenticate first
    const textarea = screen.getByPlaceholderText(
      /Paste Telegram initData here/i,
    );
    const authButton = screen.getByRole("button", { name: /authenticate/i });

    fireEvent.change(textarea, {
      target: {
        value: "auth_date=1640995200&id=12345&username=TestPlayer&hash=test",
      },
    });
    fireEvent.click(authButton);

    await waitFor(() => {
      expect(screen.getByText("Player ID: player-123")).toBeInTheDocument();
    });

    // Switch to PvP page
    const pvpButton = screen.getByRole("button", { name: /pvp/i });
    fireEvent.click(pvpButton);

    // Enter target ID and attack
    const targetInput = screen.getByDisplayValue("");
    const attackButton = screen.getByRole("button", { name: /attack/i });

    fireEvent.change(targetInput, { target: { value: "defender-456" } });
    fireEvent.click(attackButton);

    await waitFor(() => {
      expect(screen.getByText("Attack recorded.")).toBeInTheDocument();
    });
  });

  it("displays leaderboard", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>,
    );

    // Authenticate first
    const textarea = screen.getByPlaceholderText(
      /Paste Telegram initData here/i,
    );
    const authButton = screen.getByRole("button", { name: /authenticate/i });

    fireEvent.change(textarea, {
      target: {
        value: "auth_date=1640995200&id=12345&username=TestPlayer&hash=test",
      },
    });
    fireEvent.click(authButton);

    await waitFor(() => {
      expect(screen.getByText("Player ID: player-123")).toBeInTheDocument();
    });

    // Switch to leaderboard page
    const leaderboardButton = screen.getByRole("button", {
      name: /leaderboard/i,
    });
    fireEvent.click(leaderboardButton);

    await waitFor(() => {
      const leaderboardSection = screen.getByRole("heading", {
        name: /leaderboard/i,
      }).parentElement;
      expect(leaderboardSection).toHaveTextContent("TestPlayer");
      expect(leaderboardSection).toHaveTextContent("107 pts");
    });
  });
});
