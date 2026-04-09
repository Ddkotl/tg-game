import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { PlayerController } from "./player.controller";
import { PlayerService } from "./player.service";
import { PlayerRepository } from "./repository/player.repository";

@Module({
  imports: [PrismaModule],
  controllers: [PlayerController],
  providers: [PlayerRepository, PlayerService],
  exports: [PlayerService, PlayerRepository],
})
export class PlayerModule {}
