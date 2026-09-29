import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { PortfolioService } from './portfolio.service';

@ApiTags('portfolio')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get('recommended')
  @ApiOperation({ summary: 'Get customized portfolio allocation according to user risk tier' })
  @ApiResponse({ status: 200, description: 'Model portfolio returned based on stored investor assessment' })
  @ApiResponse({ status: 404, description: 'Assessment not found' })
  getRecommended(@Request() req: any) {
    return this.portfolioService.getRecommendedPortfolio(req.user.id);
  }
}