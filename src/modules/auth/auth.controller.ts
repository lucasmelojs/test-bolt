import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthUserDto, TokenResponseDto } from './dto/auth-response.dto';
import { Public } from './decorators/public.decorator';
import { SkipTenantCheck } from './decorators/skip-tenant.decorator';
import { CurrentUser } from './decorators/user.decorator';
import { JwtAuthGuard } from './guards/jwt.guard';

@ApiTags('Authentication')
@Controller('auth')
@SkipTenantCheck()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully authenticated',
    type: TokenResponseDto 
  })
  async login(@Body() loginDto: LoginDto): Promise<TokenResponseDto> {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ 
    status: 200, 
    description: 'Token refreshed successfully',
    type: TokenResponseDto 
  })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto): Promise<TokenResponseDto> {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user information' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns current user information',
    type: AuthUserDto 
  })
  async getCurrentUser(@CurrentUser() user: AuthUserDto): Promise<AuthUserDto> {
    return user;
  }
}