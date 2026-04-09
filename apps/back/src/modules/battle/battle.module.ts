import { Module } from "@nestjs/common";
import { PlayerModule } from "../player/player.module";
import { PrismaModule } from "../prisma/prisma.module";
import { BattleController } from "./battle.controller";
import { BattleRepository } from "./battle.repository";
import { BattleService } from "./battle.service";

@Module({
  imports: [PrismaModule, PlayerModule],
  controllers: [BattleController],
  providers: [BattleRepository, BattleService],
})
export class BattleModule {}
