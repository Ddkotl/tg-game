import { Controller, Get, Query } from "@nestjs/common";
import { User } from "@prisma/client";
import { UserService } from "./user.service";

@Controller("user")
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  async getUser(
    @Query("telegramId") telegramId: string,
    @Query("username") username?: string,
  ): Promise<User> {
    return this.userService.findOrCreateByTelegramId(telegramId, username);
  }
}
