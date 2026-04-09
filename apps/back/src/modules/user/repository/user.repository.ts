import { Injectable } from "@nestjs/common";
import { Player } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

  async findByTelegramId(telegramId: string): Promise<Player | null> {
    return this.prisma.player.findUnique({
      where: { telegramId },
    });
  }

  async create(data: {
    telegramId: string;
    username?: string;
  }): Promise<Player> {
    return this.prisma.player.create({
      data: {
        telegramId: data.telegramId,
        username: data.username,
        stats: {
          create: {},
        },
      },
    });
  }

  async findOrCreateByTelegramId(
    telegramId: string,
    username?: string,
  ): Promise<Player> {
    let player = await this.findByTelegramId(telegramId);
    if (!player) {
      player = await this.create({ telegramId, username });
    }
    return player;
  }
}
