import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { User } from "../../generated/client";

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findOrCreateByTelegramId(
    telegramId: string,
    username?: string,
  ): Promise<User> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    let user = await this.prisma.user.findUnique({
      where: { telegramId },
    });
    if (!user) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
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
