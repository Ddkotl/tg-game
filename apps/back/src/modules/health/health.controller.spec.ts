import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import * as request from "supertest";
import { HealthController } from "./health.controller";
import { HealthService } from "./health.service";

describe("HealthController (e2e)", () => {
  let app: INestApplication;

  const healthMock = {
    status: "ok",
    timestamp: new Date().toISOString(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthService,
          useValue: {
            getHealth: jest.fn().mockReturnValue(healthMock),
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

  it("/health (GET) - should return health status", () => {
    return request(app.getHttpServer())
      .get("/health")
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty("data");
        expect(res.body).toHaveProperty("error");
        expect(res.body.error).toBeNull();
        expect(res.body.data).toHaveProperty("status");
        expect(res.body.data).toHaveProperty("timestamp");
        expect(res.body.data.status).toBe("ok");
      });
  });
});
