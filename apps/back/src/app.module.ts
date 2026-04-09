import { Module } from "@nestjs/common";
import { HealthModule } from "./modules/health/health.module";
import { PlayerModule } from "./modules/player/player.module";
import { PrismaModule } from "./modules/prisma/prisma.module";
import { UserModule } from "./modules/user/user.module";

@Module({
  imports: [PrismaModule, UserModule, HealthModule, PlayerModule],
})
export class AppModule {}
