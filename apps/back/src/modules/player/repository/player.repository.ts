import { Injectable } from "@nestjs/common";
import { Player, Stats } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class PlayerRepository {
  constructor(private prisma: PrismaService) {}

  async findByTelegramId(telegramId: string): Promise<Player & { stats: Stats | null } | null> {
    return this.prisma.player.findUnique({
      where: { telegramId },
      include: { stats: true },
    });
  }

  async create(data: { telegramId: string; username?: string }): Promise<Player & { stats: Stats }> {
    return this.prisma.player.create({
      data: {
        telegramId: data.telegramId,
        username: data.username,
        stats: {
          create: {}, // Uses defaults
        },
      },
      include: { stats: true },
    });
  }

  async findOrCreateByTelegramId(telegramId: string, username?: string): Promise<Player & { stats: Stats | null }> {
    let player = await this.findByTelegramId(telegramId);
    if (!player) {
      player = await this.create({ telegramId, username });
    }
    return player;
  }
}
