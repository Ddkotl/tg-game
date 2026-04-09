import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "../../prisma/prisma.service";
import { PlayerRepository } from "./player.repository";

describe("PlayerRepository", () => {
  let repository: PlayerRepository;
  let prismaService: PrismaService;

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
        PlayerRepository,
        {
          provide: PrismaService,
          useValue: {
            player: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    repository = module.get<PlayerRepository>(PlayerRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it("should be defined", () => {
    expect(repository).toBeDefined();
  });

  it("should find player by telegramId", async () => {
    (prismaService.player.findUnique as jest.Mock).mockResolvedValue(
      playerMock,
    );

    const result = await repository.findByTelegramId("12345");

    expect(prismaService.player.findUnique).toHaveBeenCalledWith({
      where: { telegramId: "12345" },
      include: { stats: true },
    });
    expect(result).toEqual(playerMock);
  });

  it("should find player by id", async () => {
    (prismaService.player.findUnique as jest.Mock).mockResolvedValue(
      playerMock,
    );

    const result = await repository.findById("player-id");

    expect(prismaService.player.findUnique).toHaveBeenCalledWith({
      where: { id: "player-id" },
      include: { stats: true },
    });
    expect(result).toEqual(playerMock);
  });

  it("should create a new player with stats", async () => {
    (prismaService.player.create as jest.Mock).mockResolvedValue(playerMock);

    const result = await repository.create({
      telegramId: "12345",
      username: "hero",
    });

    expect(prismaService.player.create).toHaveBeenCalledWith({
      data: {
        telegramId: "12345",
        username: "hero",
        stats: {
          create: {},
        },
      },
      include: { stats: true },
    });
    expect(result).toEqual(playerMock);
  });

  it("should find existing player in findOrCreateByTelegramId", async () => {
    (prismaService.player.findUnique as jest.Mock).mockResolvedValue(
      playerMock,
    );

    const result = await repository.findOrCreateByTelegramId("12345", "hero");

    expect(prismaService.player.findUnique).toHaveBeenCalledWith({
      where: { telegramId: "12345" },
      include: { stats: true },
    });
    expect(prismaService.player.create).not.toHaveBeenCalled();
    expect(result).toEqual(playerMock);
  });

  it("should create new player in findOrCreateByTelegramId when not found", async () => {
    (prismaService.player.findUnique as jest.Mock).mockResolvedValue(null);
    (prismaService.player.create as jest.Mock).mockResolvedValue(playerMock);

    const result = await repository.findOrCreateByTelegramId("12345", "hero");

    expect(prismaService.player.findUnique).toHaveBeenCalledWith({
      where: { telegramId: "12345" },
      include: { stats: true },
    });
    expect(prismaService.player.create).toHaveBeenCalledWith({
      data: {
        telegramId: "12345",
        username: "hero",
        stats: {
          create: {},
        },
      },
      include: { stats: true },
    });
    expect(result).toEqual(playerMock);
  });

  it("should set meditation started at", async () => {
    const startedAt = new Date();
    (prismaService.player.update as jest.Mock).mockResolvedValue({
      ...playerMock,
      meditationStartedAt: startedAt,
    });

    const result = await repository.setMeditationStartedAt(
      "player-id",
      startedAt,
    );

    expect(prismaService.player.update).toHaveBeenCalledWith({
      where: { id: "player-id" },
      data: { meditationStartedAt: startedAt },
      include: { stats: true },
    });
    expect(result.meditationStartedAt).toEqual(startedAt);
  });

  it("should claim meditation rewards", async () => {
    (prismaService.player.update as jest.Mock).mockResolvedValue({
      ...playerMock,
      meditationStartedAt: null,
      stats: {
        ...playerMock.stats,
        energy: 150,
        strength: 11,
        defense: 11,
      },
    });

    const result = await repository.claimMeditation("player-id", 50, 1, 1);

    expect(prismaService.player.update).toHaveBeenCalledWith({
      where: { id: "player-id" },
      data: {
        meditationStartedAt: null,
        stats: {
          update: {
            energy: { increment: 50 },
            strength: { increment: 1 },
            defense: { increment: 1 },
          },
        },
      },
      include: { stats: true },
    });
    expect(result.meditationStartedAt).toBeNull();
    expect(result.stats?.energy).toBe(150);
    expect(result.stats?.strength).toBe(11);
    expect(result.stats?.defense).toBe(11);
  });

  it("should upgrade player stats", async () => {
    (prismaService.player.update as jest.Mock).mockResolvedValue({
      ...playerMock,
      stats: {
        ...playerMock.stats,
        strength: 15,
        defense: 10,
        energy: 80,
      },
    });

    const result = await repository.upgradeStats("player-id", {
      strength: 5,
      energy: -20,
    });

    expect(prismaService.player.update).toHaveBeenCalledWith({
      where: { id: "player-id" },
      data: {
        stats: {
          update: {
            strength: { increment: 5 },
            energy: { increment: -20 },
          },
        },
      },
      include: { stats: true },
    });
    expect(result.stats?.strength).toBe(15);
    expect(result.stats?.energy).toBe(80);
  });

  it("should find leaderboard with pagination", async () => {
    const players = [playerMock];
    (prismaService.player.findMany as jest.Mock).mockResolvedValue(players);

    const result = await repository.findLeaderboard(2, 10);

    expect(prismaService.player.findMany).toHaveBeenCalledWith({
      skip: 10,
      take: 10,
      orderBy: [
        { stats: { strength: "desc" } },
        { stats: { defense: "desc" } },
        { stats: { energy: "desc" } },
      ],
      include: { stats: true },
    });
    expect(result).toEqual(players);
  });
});
