import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiOperation } from '../helpers/api-operation.decorator';
import { AuthRequest, AuthResponse } from './auth.dto';
import { AuthService } from './auth.service';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({})
  @UseGuards(AuthGuard('local'))
  @Post()
  @ApiBody({ type: AuthRequest })
  @ApiResponse({
    status: 200,
    type: AuthResponse,
    description: 'Login successful'
  })
  async login(@Request() req) {
    return this.authService.login(req.user);
  }
}
