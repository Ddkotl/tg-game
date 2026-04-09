import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  ValidationPipe,
} from "@nestjs/common";
import {
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { ApiResponseDto } from "../health/dto/health-response.dto";
import { PlayerDto } from "./dto/player.dto";
import { UpgradeStatsDto } from "./dto/upgrade-stats.dto";
import { PlayerService } from "./player.service";

@ApiTags("player")
@Controller("player")
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @Get("leaderboard")
  @ApiOperation({ summary: "Get leaderboard by total stats" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiResponse({ status: 200, type: ApiResponseDto })
  async getLeaderboard(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ): Promise<ApiResponseDto<PlayerDto[]>> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const players = await this.playerService.getLeaderboard(pageNum, limitNum);
    return {
      data: players,
      error: null,
    };
  }

  @Get(":id")
  @ApiOperation({ summary: "Get player profile by id" })
  @ApiResponse({ status: 200, type: ApiResponseDto })
  async getProfile(
    @Param("id") playerId: string,
  ): Promise<ApiResponseDto<PlayerDto>> {
    const player = await this.playerService.getProfile(playerId);
    return {
      data: player,
      error: null,
    };
  }

  @Post(":id/meditation/start")
  @ApiOperation({ summary: "Start meditation for a player" })
  @ApiResponse({ status: 200, type: ApiResponseDto })
  async startMeditation(
    @Param("id") playerId: string,
  ): Promise<ApiResponseDto<PlayerDto>> {
    const player = await this.playerService.startMeditation(playerId);
    return {
      data: player,
      error: null,
    };
  }

  @Post(":id/meditation/claim")
  @ApiOperation({ summary: "Claim meditation rewards" })
  @ApiResponse({ status: 200, type: ApiResponseDto })
  async claimMeditation(
    @Param("id") playerId: string,
  ): Promise<ApiResponseDto<PlayerDto>> {
    const player = await this.playerService.claimMeditation(playerId);
    return {
      data: player,
      error: null,
    };
  }

  @Post(":id/upgrade")
  @ApiOperation({ summary: "Upgrade player stats" })
  @ApiBody({ type: UpgradeStatsDto })
  @ApiResponse({ status: 200, type: ApiResponseDto })
  async upgradeStats(
    @Param("id") playerId: string,
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    body: UpgradeStatsDto,
  ): Promise<ApiResponseDto<PlayerDto>> {
    const player = await this.playerService.upgradeStats(playerId, body);
    return {
      data: player,
      error: null,
    };
  }
}
