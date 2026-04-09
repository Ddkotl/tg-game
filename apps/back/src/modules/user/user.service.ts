import { Injectable } from "@nestjs/common";
import { Player } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findOrCreateByTelegramId(
    telegramId: string,
    username?: string,
  ): Promise<Player> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    let player = await this.prisma.player.findUnique({
      where: { telegramId },
    });
    if (!player) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      player = await this.prisma.player.create({
        data: {
          telegramId,
          username,
        },
      });
    }
    return player;
  }
}
