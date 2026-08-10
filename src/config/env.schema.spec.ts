import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { validateEnv } from '@safe-hand/safe-env-check';
import { envSchema } from './env.schema';

describe('Env validation', () => {
  const createConfigModule = () =>
    ConfigModule.forRoot({
      isGlobal: true,
      validate: () => validateEnv(envSchema),
    });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('fail fast on invalid env', () => {
    it('throws when PORT is not a number', async () => {
      jest.replaceProperty(process, 'env', {
        DOTENV_CONFIG_QUIET: 'true',
        PORT: 'not-a-number',
        NODE_ENV: undefined,
      });

      await expect(createConfigModule()).rejects.toThrow(
        'PORT must be a number',
      );
    });

    it('throws when a required variable is missing', async () => {
      const schema = {
        ...envSchema,
        DATABASE_URL: { type: 'string', required: true },
      } as const;

      jest.replaceProperty(process, 'env', {
        DOTENV_CONFIG_QUIET: 'true',
        PORT: undefined,
        NODE_ENV: undefined,
        DATABASE_URL: undefined,
      });

      await expect(
        ConfigModule.forRoot({
          isGlobal: true,
          validate: () => validateEnv(schema),
        }),
      ).rejects.toThrow('DATABASE_URL is required');
    });
  });

  describe('accepts defaults and valid values', () => {
    it('falls back to defaults when env vars are missing', async () => {
      jest.replaceProperty(process, 'env', {
        DOTENV_CONFIG_QUIET: 'true',
        PORT: undefined,
        NODE_ENV: undefined,
      });

      const moduleRef = await Test.createTestingModule({
        imports: [createConfigModule()],
      }).compile();

      const configService = moduleRef.get(ConfigService);
      expect(configService.get<number>('PORT')).toBe(3000);
      expect(configService.get<string>('NODE_ENV')).toBe('development');
    });

    it('parses a valid PORT as a number', async () => {
      jest.replaceProperty(process, 'env', {
        DOTENV_CONFIG_QUIET: 'true',
        PORT: '9000',
        NODE_ENV: 'test',
      });

      const moduleRef = await Test.createTestingModule({
        imports: [createConfigModule()],
      }).compile();

      const configService = moduleRef.get(ConfigService);
      expect(configService.get<number>('PORT')).toBe(9000);
      expect(configService.get<string>('NODE_ENV')).toBe('test');
    });
  });
});
