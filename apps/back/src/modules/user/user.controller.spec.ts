import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import * as request from "supertest";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";

describe("UserController (e2e)", () => {
  let app: INestApplication;

  const userMock = {
    id: "user-id",
    telegramId: "12345",
    username: "testuser",
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            findOrCreateByTelegramId: jest
              .fn()
              .mockImplementation((telegramId: string, username?: string) => {
                return Promise.resolve({
                  id: `user-${telegramId}`,
                  telegramId,
                  username: username || null,
                  createdAt: new Date(),
                });
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

  it("/user (GET) - should create or find user by telegramId", () => {
    return request(app.getHttpServer())
      .get("/user?telegramId=12345&username=testuser")
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty("data");
        expect(res.body).toHaveProperty("error");
        expect(res.body.error).toBeNull();
        expect(res.body.data).toHaveProperty("id");
        expect(res.body.data).toHaveProperty("telegramId", "12345");
        expect(res.body.data).toHaveProperty("username", "testuser");
      });
  });

  it("/user (GET) - should handle user without username", () => {
    return request(app.getHttpServer())
      .get("/user?telegramId=67890")
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty("data");
        expect(res.body.data).toHaveProperty("telegramId", "67890");
      });
  });

  it("/user (GET) - should require telegramId query parameter", () => {
    return request(app.getHttpServer()).get("/user").expect(400);
  });
});
