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
      stats: {
        id: "stats-id",
        playerId: "player-id",
        strength: 10,
        defense: 10,
        energy: 100,
      },
    });
  });
});
