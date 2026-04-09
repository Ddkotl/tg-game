import { ApiProperty } from "@nestjs/swagger";

export class HealthResponseDto {
  @ApiProperty()
  status: string;
}

export class ApiResponseDto<T> {
  @ApiProperty()
  data: T | null;

  @ApiProperty({ nullable: true })
  error: string | null;
}
