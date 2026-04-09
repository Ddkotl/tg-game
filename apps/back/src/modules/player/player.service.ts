import { Injectable } from "@nestjs/common";
import { PlayerDto } from "./dto/player.dto";
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
    return {
      id: player.id,
      telegramId: player.telegramId,
      username: player.username,
      createdAt: player.createdAt,
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
