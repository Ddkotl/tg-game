import {
  BadRequestException,
  InternalServerErrorException,
} from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { PlayerService } from "../player/player.service";
import { AuthService } from "./auth.service";

describe("AuthService", () => {
  let service: AuthService;
  let playerService: PlayerService;

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
        AuthService,
        {
          provide: PlayerService,
          useValue: {
            findOrCreateByTelegramId: jest.fn().mockResolvedValue(playerMock),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    playerService = module.get<PlayerService>(PlayerService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should authenticate valid Telegram initData", async () => {
    // Mock environment variable
    process.env.TELEGRAM_BOT_TOKEN = "test-token";

    // Create a valid initData string (simplified for testing)
    const initData = "auth_date=1640995200&id=12345&username=hero&hash=test";

    // Mock the hash verification to pass
    const originalParseInitData = service["parseInitData"];
    service["parseInitData"] = jest.fn().mockReturnValue({
      id: "12345",
      username: "hero",
      authDate: 1640995200,
    });

    const result = await service.authenticate(initData);

    expect(playerService.findOrCreateByTelegramId).toHaveBeenCalledWith(
      "12345",
      "hero",
    );
    expect(result).toEqual(playerMock);

    // Restore original method
    service["parseInitData"] = originalParseInitData;
  });

  it("should throw InternalServerErrorException when bot token is not configured", async () => {
    delete process.env.TELEGRAM_BOT_TOKEN;

    await expect(service.authenticate("some-data")).rejects.toThrow(
      InternalServerErrorException,
    );
  });

  it("should throw BadRequestException for invalid initData", async () => {
    process.env.TELEGRAM_BOT_TOKEN = "test-token";

    // Mock parseInitData to throw an error
    const originalParseInitData = service["parseInitData"];
    service["parseInitData"] = jest.fn().mockImplementation(() => {
      throw new BadRequestException("Invalid initData");
    });

    await expect(service.authenticate("invalid-data")).rejects.toThrow(
      BadRequestException,
    );

    // Restore original method
    service["parseInitData"] = originalParseInitData;
  });
});
