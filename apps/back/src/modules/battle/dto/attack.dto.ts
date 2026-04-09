import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class AttackDto {
  @ApiProperty({ description: "Attacker player id" })
  @IsString()
  @IsNotEmpty()
  attackerId: string;

  @ApiProperty({ description: "Defender player id" })
  @IsString()
  @IsNotEmpty()
  defenderId: string;
}
