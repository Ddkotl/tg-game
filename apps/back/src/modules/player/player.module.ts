import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { PlayerService } from "./player.service";
import { PlayerRepository } from "./repository/player.repository";

@Module({
  imports: [PrismaModule],
  providers: [PlayerRepository, PlayerService],
  exports: [PlayerService],
})
export class PlayerModule {}
