import { Controller, Get, Query } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { ApiResponseDto } from "../health/dto/health-response.dto";
import { UserDto } from "./dto/user.dto";
import { UserService } from "./user.service";

@Controller("user")
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @ApiOperation({ summary: "Get or create user by Telegram ID" })
  @ApiResponse({
    status: 200,
    description: "User found or created",
    type: ApiResponseDto<UserDto>,
  })
  async getUser(
    @Query("telegramId") telegramId: string,
    @Query("username") username?: string,
  ): Promise<ApiResponseDto<UserDto>> {
    const user = await this.userService.findOrCreateByTelegramId(
      telegramId,
      username,
    );
    return {
      data: user,
      error: null,
    };
  }
}
