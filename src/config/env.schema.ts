import { validateEnv } from '@safe-hand/safe-env-check';

export const envSchema = {
  NODE_ENV: {
    type: 'string',
    enum: ['development', 'production', 'test'],
    default: 'development',
  },
  PORT: {
    type: 'number',
    default: 3000,
  },
} as const;

export const envValues = () => validateEnv(envSchema);
