import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findOrCreateByTelegramId(telegramId: string, username?: string) {
    let user = await this.prisma.user.findUnique({
      where: { telegramId },
    });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          telegramId,
          username,
        },
      });
    }
    return user;
  }
}
