import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import * as request from "supertest";
import { PlayerDto } from "../player/dto/player.dto";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

describe("AuthController", () => {
  let app: INestApplication;
  let authService: AuthService;

  const playerMock: PlayerDto = {
    id: "player-id",
    telegramId: "12345",
    username: "hero",
    createdAt: new Date("2026-04-09T00:00:00.000Z"),
    meditationStartedAt: null,
    stats: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            authenticate: jest.fn().mockResolvedValue(playerMock),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.setGlobalPrefix("v1");
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it("should authenticate telegram initData and return player data", async () => {
    const response = await request(app.getHttpServer())
      .post("/v1/auth/telegram")
      .send({ initData: "test-init-data" })
      .expect(201);

    expect(authService.authenticate).toHaveBeenCalledWith("test-init-data");
    expect(response.body).toEqual({
      data: {
        id: "player-id",
        telegramId: "12345",
        username: "hero",
        createdAt: playerMock.createdAt.toISOString(),
        meditationStartedAt: null,
        stats: null,
      },
      error: null,
    });
  });
});
