import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PlayerDto } from "./dto/player.dto";
import { UpgradeStatsDto } from "./dto/upgrade-stats.dto";
import { PlayerRepository } from "./repository/player.repository";

@Injectable()
export class PlayerService {
  constructor(private playerRepository: PlayerRepository) {}

  async findOrCreateByTelegramId(
    telegramId: string,
    username?: string,
  ): Promise<PlayerDto> {
    const player = await this.playerRepository.findOrCreateByTelegramId(
      telegramId,
      username,
    );
    return this.mapPlayer(player);
  }

  async getProfile(playerId: string): Promise<PlayerDto> {
    const player = await this.playerRepository.findById(playerId);
    if (!player) {
      throw new NotFoundException("Player not found");
    }
    return this.mapPlayer(player);
  }

  async startMeditation(playerId: string): Promise<PlayerDto> {
    const player = await this.playerRepository.findById(playerId);
    if (!player) {
      throw new NotFoundException("Player not found");
    }
    if (player.meditationStartedAt) {
      throw new BadRequestException("Meditation session is already active");
    }

    const startedAt = new Date();
    const updated = await this.playerRepository.setMeditationStartedAt(
      playerId,
      startedAt,
    );

    return this.mapPlayer(updated);
  }

  async claimMeditation(playerId: string): Promise<PlayerDto> {
    const player = await this.playerRepository.findById(playerId);
    if (!player) {
      throw new NotFoundException("Player not found");
    }
    if (!player.meditationStartedAt) {
      throw new BadRequestException("No active meditation session to claim");
    }

    const elapsedMs = Date.now() - player.meditationStartedAt.getTime();
    const elapsedMinutes = Math.floor(elapsedMs / 60000);
    if (elapsedMinutes < 1) {
      throw new BadRequestException(
        "Meditation session must last at least one minute to claim",
      );
    }

    const cappedMinutes = Math.min(elapsedMinutes, 180);
    const energyReward = Math.min(cappedMinutes * 2, 50);
    const strengthReward = Math.min(Math.floor(cappedMinutes / 60), 2);
    const defenseReward = Math.min(Math.floor(cappedMinutes / 90), 1);

    const updated = await this.playerRepository.claimMeditation(
      playerId,
      energyReward,
      strengthReward,
      defenseReward,
    );

    return this.mapPlayer(updated);
  }

  async upgradeStats(
    playerId: string,
    dto: UpgradeStatsDto,
  ): Promise<PlayerDto> {
    const player = await this.playerRepository.findById(playerId);
    if (!player || !player.stats) {
      throw new NotFoundException("Player not found");
    }

    const cost = this.getUpgradeCost(dto.points);
    if (player.stats.energy < cost) {
      throw new BadRequestException("Not enough energy to upgrade stats");
    }

    const updatePayload = {
      [dto.stat]: dto.points,
      energy: -cost,
    };

    const updated = await this.playerRepository.upgradeStats(
      playerId,
      updatePayload,
    );
    return this.mapPlayer(updated);
  }

  async getLeaderboard(page = 1, limit = 10): Promise<PlayerDto[]> {
    const players = await this.playerRepository.findLeaderboard(page, limit);
    return players.map((player) => this.mapPlayer(player));
  }

  private getUpgradeCost(points: number): number {
    return points * 10;
  }

  private mapPlayer(player: {
    id: string;
    telegramId: string | null;
    username: string | null;
    createdAt: Date;
    meditationStartedAt: Date | null;
    stats: {
      id: string;
      playerId: string;
      strength: number;
      defense: number;
      energy: number;
    } | null;
  }): PlayerDto {
    return {
      id: player.id,
      telegramId: player.telegramId,
      username: player.username,
      createdAt: player.createdAt,
      meditationStartedAt: player.meditationStartedAt ?? null,
      stats: player.stats
        ? {
            id: player.stats.id,
            playerId: player.stats.playerId,
            strength: player.stats.strength,
            defense: player.stats.defense,
            energy: player.stats.energy,
          }
        : null,
    };
  }
}
