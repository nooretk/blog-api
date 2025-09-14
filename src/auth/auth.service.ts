import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { RegisterDto } from './dto/register.dto';
import { SignInDto } from './dto/signin.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { TokenResponseDto } from './dto/token-response.dto';
import { User } from 'src/users/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { handleDatabaseError } from '../common/utils/handle-database-error';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async register(data: RegisterDto): Promise<User> {
    return this.usersService.createUser(data);
  }

  async signIn(signInDto: SignInDto): Promise<TokenResponseDto> {
    const user = await this.usersService.findByEmailForAuth(signInDto.email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const passwordValid = await bcrypt.compare(
      signInDto.password,
      user.password,
    );
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.generateTokens(user);
  }

  async refreshTokens(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<TokenResponseDto> {
    try {
      const refreshToken = await this.refreshTokenRepository.findOne({
        where: {
          token: refreshTokenDto.refreshToken,
          isRevoked: false,
          expiresAt: MoreThan(new Date()),
        },
        relations: ['user'],
      });

      if (!refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Revoke the used refresh token (token rotation)
      refreshToken.isRevoked = true;
      await this.refreshTokenRepository.save(refreshToken);

      // Generate new tokens
      const newTokens = await this.generateTokens(refreshToken.user);

      return newTokens;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      handleDatabaseError(error, 'refresh tokens');
    }
  }

  async revokeRefreshToken(refreshTokenDto: RefreshTokenDto): Promise<void> {
    try {
      const refreshToken = await this.refreshTokenRepository.findOne({
        where: { token: refreshTokenDto.refreshToken },
      });

      if (refreshToken) {
        refreshToken.isRevoked = true;
        await this.refreshTokenRepository.save(refreshToken);
      }
    } catch (error) {
      handleDatabaseError(error, 'revoke refresh token');
    }
  }

  private async generateTokens(user: User): Promise<TokenResponseDto> {
    try {
      const payload = { sub: user.id, username: user.name };
      const accessToken = await this.jwtService.signAsync(payload);

      // Generate refresh token
      const refreshTokenValue = crypto.randomBytes(64).toString('hex');
      const refreshTokenExpiresIn = this.configService.get<string>(
        'REFRESH_TOKEN_EXPIRES_IN',
        '7d',
      );

      // Parse the expiration time
      const expiresAt = new Date();
      const expirationMatch = refreshTokenExpiresIn.match(/^(\d+)([dhm])$/);
      if (expirationMatch) {
        const value = parseInt(expirationMatch[1]);
        const unit = expirationMatch[2];
        switch (unit) {
          case 'd':
            expiresAt.setDate(expiresAt.getDate() + value);
            break;
          case 'h':
            expiresAt.setHours(expiresAt.getHours() + value);
            break;
          case 'm':
            expiresAt.setMinutes(expiresAt.getMinutes() + value);
            break;
        }
      } else {
        // Default to 7 days if parsing fails
        expiresAt.setDate(expiresAt.getDate() + 7);
      }

      // Save refresh token to database
      const refreshTokenEntity = this.refreshTokenRepository.create({
        token: refreshTokenValue,
        user: { id: user.id } as User,
        expiresAt,
      });

      await this.refreshTokenRepository.save(refreshTokenEntity);

      // Get access token expiration from config
      const accessTokenExpiresIn = this.configService.get<string>(
        'JWT_EXPIRES_IN',
        '15m',
      );
      const expiresInSeconds =
        this.parseExpirationToSeconds(accessTokenExpiresIn);

      return {
        access_token: accessToken,
        refresh_token: refreshTokenValue,
        token_type: 'Bearer',
        expires_in: expiresInSeconds,
      };
    } catch (error) {
      handleDatabaseError(error, 'generate tokens');
    }
  }

  private parseExpirationToSeconds(expiration: string): number {
    const match = expiration.match(/^(\d+)([dhms])$/);
    if (!match) return 900; // Default 15 minutes

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 'd':
        return value * 24 * 60 * 60;
      case 'h':
        return value * 60 * 60;
      case 'm':
        return value * 60;
      case 's':
        return value;
      default:
        return 900; // Default 15 minutes
    }
  }
}
