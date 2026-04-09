import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import * as request from "supertest";
import { PlayerController } from "./player.controller";
import { PlayerService } from "./player.service";

describe("PlayerController (e2e)", () => {
  let app: INestApplication;

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

  const leaderboardMock = [playerMock];

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [PlayerController],
      providers: [
        {
          provide: PlayerService,
          useValue: {
            getProfile: jest.fn().mockResolvedValue(playerMock),
            getLeaderboard: jest.fn().mockResolvedValue(leaderboardMock),
            startMeditation: jest.fn().mockResolvedValue({
              ...playerMock,
              meditationStartedAt: new Date(),
            }),
            claimMeditation: jest.fn().mockResolvedValue({
              ...playerMock,
              stats: {
                ...playerMock.stats,
                energy: 150,
                strength: 11,
                defense: 11,
              },
            }),
            upgradeStats: jest.fn().mockResolvedValue({
              ...playerMock,
              stats: {
                ...playerMock.stats,
                strength: 15,
                energy: 80,
              },
            }),
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it("/player/:id (GET) - should get player profile", () => {
    return request(app.getHttpServer())
      .get("/player/player-id")
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty("data");
        expect(res.body).toHaveProperty("error");
        expect(res.body.error).toBeNull();
        expect(res.body.data.id).toBe("player-id");
      });
  });

  it("/player/leaderboard (GET) - should get leaderboard", () => {
    return request(app.getHttpServer())
      .get("/player/leaderboard")
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty("data");
        expect(res.body).toHaveProperty("error");
        expect(res.body.error).toBeNull();
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data).toHaveLength(1);
      });
  });

  it("/player/leaderboard (GET) - should handle pagination", () => {
    return request(app.getHttpServer())
      .get("/player/leaderboard?page=1&limit=5")
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty("data");
        expect(Array.isArray(res.body.data)).toBe(true);
      });
  });

  it("/player/:id/meditation/start (POST) - should start meditation", () => {
    return request(app.getHttpServer())
      .post("/player/player-id/meditation/start")
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty("data");
        expect(res.body.data).toHaveProperty("meditationStartedAt");
      });
  });

  it("/player/:id/meditation/claim (POST) - should claim meditation rewards", () => {
    return request(app.getHttpServer())
      .post("/player/player-id/meditation/claim")
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty("data");
        expect(res.body.data.stats.energy).toBe(150);
      });
  });

  it("/player/:id/upgrade (POST) - should upgrade stats", () => {
    return request(app.getHttpServer())
      .post("/player/player-id/upgrade")
      .send({ stat: "strength", points: 5 })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty("data");
        expect(res.body.data.stats.strength).toBe(15);
        expect(res.body.data.stats.energy).toBe(80);
      });
  });

  it("/player/:id/upgrade (POST) - should validate request body", () => {
    return request(app.getHttpServer())
      .post("/player/player-id/upgrade")
      .send({})
      .expect(400);
  });

  it("/player/:id/upgrade (POST) - should validate stat field", () => {
    return request(app.getHttpServer())
      .post("/player/player-id/upgrade")
      .send({ stat: "invalid", points: 1 })
      .expect(400);
  });

  it("/player/:id/upgrade (POST) - should validate points field", () => {
    return request(app.getHttpServer())
      .post("/player/player-id/upgrade")
      .send({ stat: "strength", points: 0 })
      .expect(400);
  });
});
