import { Controller, Get, Query } from "@nestjs/common";
import { Player } from "@prisma/client";
import { UserService } from "./user.service";

@Controller("user")
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  async getUser(
    @Query("telegramId") telegramId: string,
    @Query("username") username?: string,
  ): Promise<Player> {
    return this.userService.findOrCreateByTelegramId(telegramId, username);
  }
}
