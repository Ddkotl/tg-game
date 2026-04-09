import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsInt, Min } from "class-validator";

export class UpgradeStatsDto {
  @ApiProperty({ enum: ["strength", "defense"] })
  @IsIn(["strength", "defense"])
  stat: "strength" | "defense";

  @ApiProperty({ description: "Number of points to add" })
  @IsInt()
  @Min(1)
  points: number;
}
