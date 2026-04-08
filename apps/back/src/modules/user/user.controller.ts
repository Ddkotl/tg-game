import { Controller, Get, Query } from "@nestjs/common";
import { UserService } from "./user.service";
import { User } from "../../generated/client";

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
