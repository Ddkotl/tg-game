import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./modules/auth/auth.module";
import { BattleModule } from "./modules/battle/battle.module";
import { HealthModule } from "./modules/health/health.module";
import { PlayerModule } from "./modules/player/player.module";
import { PrismaModule } from "./modules/prisma/prisma.module";
import { UserModule } from "./modules/user/user.module";

@Module({
  imports: [
    PrismaModule,
    UserModule,
    HealthModule,
    PlayerModule,
    BattleModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
