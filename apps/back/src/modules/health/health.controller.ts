import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { ApiResponseDto, HealthResponseDto } from "./dto/health-response.dto";
import { HealthService } from "./health.service";

@Controller("health")
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: "Get health status" })
  @ApiResponse({
    status: 200,
    description: "Health status",
    type: ApiResponseDto<HealthResponseDto>,
  })
  getHealth(): ApiResponseDto<HealthResponseDto> {
    return {
      data: this.healthService.getHealth(),
      error: null,
    };
  }
}
