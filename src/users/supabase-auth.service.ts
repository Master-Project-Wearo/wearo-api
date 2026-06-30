import {
  BadGatewayException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class SupabaseAuthService {
  private readonly logger = new Logger(SupabaseAuthService.name);

  async updateNickname(authorization: string | undefined, nickname: string) {
    const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '');
    const apiKey = process.env.SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl) {
      throw new InternalServerErrorException('SUPABASE_URL must be set');
    }

    if (!apiKey) {
      throw new InternalServerErrorException(
        'SUPABASE_PUBLISHABLE_KEY must be set',
      );
    }

    if (!authorization) {
      throw new UnauthorizedException('Missing authorization header');
    }

    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      method: 'PUT',
      headers: {
        apikey: apiKey,
        authorization,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          nickname,
          display_name: nickname,
        },
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      this.logger.error(
        `Supabase Auth nickname update failed with ${response.status}: ${body}`,
      );
      throw new BadGatewayException('Failed to update Supabase auth user');
    }
  }
}
