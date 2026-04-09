import { Test, TestingModule } from "@nestjs/testing";
import { UserRepository } from "./repository/user.repository";
import { UserService } from "./user.service";

describe("UserService", () => {
  let service: UserService;
  let repository: UserRepository;

  const userMock = {
    id: "user-id",
    telegramId: "12345",
    username: "player1",
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: {
            findOrCreateByTelegramId: jest.fn().mockResolvedValue(userMock),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<UserRepository>(UserRepository);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should return a mapped user DTO", async () => {
    const result = await service.findOrCreateByTelegramId("12345", "player1");

    expect(repository.findOrCreateByTelegramId).toHaveBeenCalledWith(
      "12345",
      "player1",
    );
    expect(result).toEqual({
      id: "user-id",
      telegramId: "12345",
      username: "player1",
      createdAt: userMock.createdAt,
    });
  });
});
