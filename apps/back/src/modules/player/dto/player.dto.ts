import { ApiProperty } from "@nestjs/swagger";

export class StatsDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  playerId: string;

  @ApiProperty()
  strength: number;

  @ApiProperty()
  defense: number;

  @ApiProperty()
  energy: number;
}

export class PlayerDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  telegramId: string | null;

  @ApiProperty()
  username: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: StatsDto, nullable: true })
  stats: StatsDto | null;
}

export class CreatePlayerDto {
  @ApiProperty()
  telegramId: string;

  @ApiProperty({ required: false })
  username?: string;
}
