import { BadGatewayException, Logger } from '@nestjs/common';
import { SupabaseAuthService } from './supabase-auth.service';

describe('SupabaseAuthService', () => {
  const originalEnv = process.env;
  let service: SupabaseAuthService;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      SUPABASE_URL: 'https://project.supabase.co/',
      SUPABASE_PUBLISHABLE_KEY: 'publishable-key',
    };
    service = new SupabaseAuthService();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
    }) as jest.Mock;
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  it('updates only nickname and display_name in Supabase Auth metadata', async () => {
    await service.updateNickname('Bearer user-token', 'Adr');

    expect(global.fetch).toHaveBeenCalledWith(
      'https://project.supabase.co/auth/v1/user',
      expect.objectContaining({
        method: 'PUT',
        headers: {
          apikey: 'publishable-key',
          authorization: 'Bearer user-token',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            nickname: 'Adr',
            display_name: 'Adr',
          },
        }),
      }),
    );
  });

  it('maps Supabase Auth failures to a gateway error', async () => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: jest.fn().mockResolvedValue('boom'),
    }) as jest.Mock;

    await expect(
      service.updateNickname('Bearer user-token', 'Adr'),
    ).rejects.toBeInstanceOf(BadGatewayException);
  });
});
