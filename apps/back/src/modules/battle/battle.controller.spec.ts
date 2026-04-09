import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import * as request from "supertest";
import { BattleController } from "./battle.controller";
import { BattleService } from "./battle.service";

describe("BattleController (e2e)", () => {
  let app: INestApplication;

  const battleResultMock = {
    winner: "attacker",
    attackerId: "attacker-id",
    defenderId: "defender-id",
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [BattleController],
      providers: [
        {
          provide: BattleService,
          useValue: {
            attack: jest.fn().mockResolvedValue(battleResultMock),
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

  it("/battle/attack (POST) - should attack another player", () => {
    return request(app.getHttpServer())
      .post("/battle/attack")
      .send({
        attackerId: "attacker-id",
        defenderId: "defender-id",
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty("data");
        expect(res.body).toHaveProperty("error");
        expect(res.body.error).toBeNull();
        expect(res.body.data.winner).toBe("attacker");
      });
  });

  it("/battle/attack (POST) - should validate request body", () => {
    return request(app.getHttpServer())
      .post("/battle/attack")
      .send({})
      .expect(400);
  });

  it("/battle/attack (POST) - should require attackerId", () => {
    return request(app.getHttpServer())
      .post("/battle/attack")
      .send({ defenderId: "defender-id" })
      .expect(400);
  });

  it("/battle/attack (POST) - should require defenderId", () => {
    return request(app.getHttpServer())
      .post("/battle/attack")
      .send({ attackerId: "attacker-id" })
      .expect(400);
  });
});
