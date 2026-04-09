import { Module } from "@nestjs/common";
import { HealthModule } from "./modules/health/health.module";
import { PrismaModule } from "./modules/prisma/prisma.module";
import { UserModule } from "./modules/user/user.module";

@Module({
  imports: [PrismaModule, UserModule, HealthModule],
})
export class AppModule {}
