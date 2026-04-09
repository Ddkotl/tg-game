import { ApiProperty } from "@nestjs/swagger";

export class UserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  telegramId: string | null;

  @ApiProperty()
  username: string | null;

  @ApiProperty()
  createdAt: Date;
}
