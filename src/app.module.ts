import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from '@safe-hand/safe-env-check';
import { envSchema } from './config/env.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: () => validateEnv(envSchema),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
