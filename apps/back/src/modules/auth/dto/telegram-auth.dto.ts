import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class TelegramAuthDto {
  @ApiProperty({ description: "Telegram Web App initData string" })
  @IsString()
  @IsNotEmpty()
  initData: string;
}
