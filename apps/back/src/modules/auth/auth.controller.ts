import { Body, Controller, Post, ValidationPipe } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ApiResponseDto } from "../health/dto/health-response.dto";
import { PlayerDto } from "../player/dto/player.dto";
import { AuthService } from "./auth.service";
import { TelegramAuthDto } from "./dto/telegram-auth.dto";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("telegram")
  @ApiOperation({ summary: "Authenticate Telegram Web App initData" })
  @ApiBody({ type: TelegramAuthDto })
  @ApiResponse({
    status: 200,
    description: "Authenticated player",
    type: ApiResponseDto,
  })
  async authenticate(
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    body: TelegramAuthDto,
  ): Promise<ApiResponseDto<PlayerDto>> {
    const player = await this.authService.authenticate(body.initData);
    return {
      data: player,
      error: null,
    };
  }
}
