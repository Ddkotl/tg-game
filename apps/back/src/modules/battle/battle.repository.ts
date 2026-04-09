import { Injectable } from "@nestjs/common";
import { BattleLog } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class BattleRepository {
  constructor(private prisma: PrismaService) {}

  async logBattle(data: {
    attackerId: string;
    defenderId: string;
    result: string;
  }): Promise<BattleLog> {
    return this.prisma.battleLog.create({
      data,
    });
  }
}
