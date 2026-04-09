import { ApiProperty } from "@nestjs/swagger";

export class BattleResultDto {
  @ApiProperty()
  attackerId: string;

  @ApiProperty()
  defenderId: string;

  @ApiProperty({ description: "Winning side: attacker, defender, or draw" })
  winner: string;

  @ApiProperty()
  description: string;
}
