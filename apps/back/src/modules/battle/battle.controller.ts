import { Body, Controller, Post, ValidationPipe } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ApiResponseDto } from "../health/dto/health-response.dto";
import { BattleService } from "./battle.service";
import { AttackDto } from "./dto/attack.dto";
import { BattleResultDto } from "./dto/battle-result.dto";

@ApiTags("battle")
@Controller("battle")
export class BattleController {
  constructor(private readonly battleService: BattleService) {}

  @Post("attack")
  @ApiOperation({ summary: "Attack another player" })
  @ApiBody({ type: AttackDto })
  @ApiResponse({ status: 200, type: ApiResponseDto })
  async attack(
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    body: AttackDto,
  ): Promise<ApiResponseDto<BattleResultDto>> {
    const result = await this.battleService.attack(
      body.attackerId,
      body.defenderId,
    );
    return {
      data: result,
      error: null,
    };
  }
}
