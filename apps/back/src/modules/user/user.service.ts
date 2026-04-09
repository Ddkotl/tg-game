import { Injectable } from "@nestjs/common";
import { UserDto } from "./dto/user.dto";
import { UserRepository } from "./repository/user.repository";

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  async findOrCreateByTelegramId(
    telegramId: string,
    username?: string,
  ): Promise<UserDto> {
    const player = await this.userRepository.findOrCreateByTelegramId(
      telegramId,
      username,
    );
    return {
      id: player.id,
      telegramId: player.telegramId,
      username: player.username,
      createdAt: player.createdAt,
    };
  }
}
