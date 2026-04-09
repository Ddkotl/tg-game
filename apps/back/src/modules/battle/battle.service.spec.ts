import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { PlayerRepository } from "../player/repository/player.repository";
import { BattleRepository } from "./battle.repository";
import { BattleService } from "./battle.service";

describe("BattleService", () => {
  let service: BattleService;
  let playerRepository: PlayerRepository;
  let battleRepository: BattleRepository;

  const attackerMock = {
    id: "attacker-id",
    telegramId: "12345",
    username: "hero",
    createdAt: new Date(),
    meditationStartedAt: null,
    stats: {
      id: "stats-id",
      playerId: "attacker-id",
      strength: 20,
      defense: 5,
      energy: 30,
    },
  };

  const defenderMock = {
    id: "defender-id",
    telegramId: "67890",
    username: "villain",
    createdAt: new Date(),
    meditationStartedAt: null,
    stats: {
      id: "stats-id-2",
      playerId: "defender-id",
      strength: 8,
      defense: 15,
      energy: 20,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BattleService,
        {
          provide: BattleRepository,
          useValue: {
            logBattle: jest.fn().mockResolvedValue({
              id: "log-id",
              attackerId: "attacker-id",
              defenderId: "defender-id",
              result: "attacker",
              createdAt: new Date(),
            }),
          },
        },
        {
          provide: PlayerRepository,
          useValue: {
            findById: jest
              .fn()
              .mockImplementation((id) =>
                Promise.resolve(id === "attacker-id" ? attackerMock : defenderMock),
              ),
          },
        },
      ],
    }).compile();

    service = module.get<BattleService>(BattleService);
    playerRepository = module.get<PlayerRepository>(PlayerRepository);
    battleRepository = module.get<BattleRepository>(BattleRepository);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should record an attacker win", async () => {
    const result = await service.attack("attacker-id", "defender-id");

    expect(playerRepository.findById).toHaveBeenCalledWith("attacker-id");
    expect(playerRepository.findById).toHaveBeenCalledWith("defender-id");
    expect(battleRepository.logBattle).toHaveBeenCalledWith({
      attackerId: "attacker-id",
      defenderId: "defender-id",
      result: "attacker",
    });
    expect(result.winner).toBe("attacker");
  });

  it("should prevent self attacks", async () => {
    await expect(service.attack("attacker-id", "attacker-id")).rejects.toThrow(
      BadRequestException,
    );
  });

  it("should throw if defender not found", async () => {
    (playerRepository.findById as jest.Mock).mockResolvedValueOnce(attackerMock);
    (playerRepository.findById as jest.Mock).mockResolvedValueOnce(null);

    await expect(service.attack("attacker-id", "missing-id")).rejects.toThrow(
      NotFoundException,
    );
  });
});
