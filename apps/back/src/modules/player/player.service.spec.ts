import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { PlayerService } from "./player.service";
import { PlayerRepository } from "./repository/player.repository";

describe("PlayerService", () => {
  let service: PlayerService;
  let repository: PlayerRepository;

  const playerMock = {
    id: "player-id",
    telegramId: "12345",
    username: "hero",
    createdAt: new Date(),
    meditationStartedAt: null,
    stats: {
      id: "stats-id",
      playerId: "player-id",
      strength: 10,
      defense: 10,
      energy: 100,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlayerService,
        {
          provide: PlayerRepository,
          useValue: {
            findOrCreateByTelegramId: jest.fn().mockResolvedValue(playerMock),
            findById: jest.fn().mockResolvedValue(playerMock),
            setMeditationStartedAt: jest
              .fn()
              .mockImplementation((id, startedAt) =>
                Promise.resolve({
                  ...playerMock,
                  meditationStartedAt: startedAt,
                }),
              ),
            claimMeditation: jest
              .fn()
              .mockImplementation(
                (id, energyReward, strengthReward, defenseReward) =>
                  Promise.resolve({
                    ...playerMock,
                    meditationStartedAt: null,
                    stats: {
                      ...playerMock.stats,
                      energy: playerMock.stats.energy + energyReward,
                      strength: playerMock.stats.strength + strengthReward,
                      defense: playerMock.stats.defense + defenseReward,
                    },
                  }),
              ),
            upgradeStats: jest.fn().mockImplementation((id, update) =>
              Promise.resolve({
                ...playerMock,
                stats: {
                  ...playerMock.stats,
                  strength: playerMock.stats.strength + (update.strength ?? 0),
                  defense: playerMock.stats.defense + (update.defense ?? 0),
                  energy: playerMock.stats.energy + (update.energy ?? 0),
                },
              }),
            ),
            findLeaderboard: jest.fn().mockResolvedValue([playerMock]),
          },
        },
      ],
    }).compile();

    service = module.get<PlayerService>(PlayerService);
    repository = module.get<PlayerRepository>(PlayerRepository);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should return a mapped player DTO", async () => {
    const result = await service.findOrCreateByTelegramId("12345", "hero");

    expect(repository.findOrCreateByTelegramId).toHaveBeenCalledWith(
      "12345",
      "hero",
    );
    expect(result).toEqual({
      id: "player-id",
      telegramId: "12345",
      username: "hero",
      createdAt: playerMock.createdAt,
      meditationStartedAt: null,
      stats: {
        id: "stats-id",
        playerId: "player-id",
        strength: 10,
        defense: 10,
        energy: 100,
      },
    });
  });

  it("should get profile by id", async () => {
    const result = await service.getProfile("player-id");

    expect(repository.findById).toHaveBeenCalledWith("player-id");
    expect(result.id).toBe("player-id");
  });

  it("should start meditation when no session is active", async () => {
    const startedAt = new Date("2026-04-09T12:00:00.000Z");
    jest.useFakeTimers().setSystemTime(startedAt);

    const result = await service.startMeditation("player-id");

    expect(repository.findById).toHaveBeenCalledWith("player-id");
    expect(repository.setMeditationStartedAt).toHaveBeenCalledWith(
      "player-id",
      startedAt,
    );
    expect(result.meditationStartedAt).toEqual(startedAt);

    jest.useRealTimers();
  });

  it("should prevent starting meditation when an active session exists", async () => {
    (repository.findById as jest.Mock).mockResolvedValueOnce({
      ...playerMock,
      meditationStartedAt: new Date("2026-04-09T11:00:00.000Z"),
    });

    await expect(service.startMeditation("player-id")).rejects.toThrow(
      BadRequestException,
    );
  });

  it("should throw NotFoundException when the player does not exist", async () => {
    (repository.findById as jest.Mock).mockResolvedValueOnce(null);

    await expect(service.startMeditation("missing-id")).rejects.toThrow(
      NotFoundException,
    );
  });

  it("should claim meditation and reward stats based on elapsed time", async () => {
    const startedAt = new Date("2026-04-09T11:00:00.000Z");
    (repository.findById as jest.Mock).mockResolvedValueOnce({
      ...playerMock,
      meditationStartedAt: startedAt,
    });

    jest.useFakeTimers().setSystemTime(new Date("2026-04-09T12:30:00.000Z"));

    const result = await service.claimMeditation("player-id");

    expect(repository.findById).toHaveBeenCalledWith("player-id");
    expect(repository.claimMeditation).toHaveBeenCalledWith(
      "player-id",
      50,
      1,
      1,
    );
    expect(result.meditationStartedAt).toBeNull();
    expect(result.stats).toEqual({
      id: "stats-id",
      playerId: "player-id",
      strength: 11,
      defense: 11,
      energy: 150,
    });

    jest.useRealTimers();
  });

  it("should upgrade player strength when energy is sufficient", async () => {
    const result = await service.upgradeStats("player-id", {
      stat: "strength",
      points: 2,
    });

    expect(repository.findById).toHaveBeenCalledWith("player-id");
    expect(repository.upgradeStats).toHaveBeenCalledWith("player-id", {
      strength: 2,
      energy: -20,
    });
    expect(result.stats).toEqual({
      id: "stats-id",
      playerId: "player-id",
      strength: 12,
      defense: 10,
      energy: 80,
    });
  });

  it("should return leaderboard entries", async () => {
    const result = await service.getLeaderboard(1, 10);

    expect(repository.findLeaderboard).toHaveBeenCalledWith(1, 10);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("player-id");
  });

  it("should prevent meditation claim when no session is active", async () => {
    (repository.findById as jest.Mock).mockResolvedValueOnce({
      ...playerMock,
      meditationStartedAt: null,
    });

    await expect(service.claimMeditation("player-id")).rejects.toThrow(
      BadRequestException,
    );
  });
});
