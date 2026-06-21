import { TEST_JWT_SECRET } from '../../src/auth/constants';

type SecretCallback = (error: Error | null, secret?: string) => void;

export function passportJwtSecret() {
  return (
    _request: unknown,
    _rawJwtToken: string,
    done: SecretCallback,
  ): void => {
    done(null, TEST_JWT_SECRET);
  };
}
