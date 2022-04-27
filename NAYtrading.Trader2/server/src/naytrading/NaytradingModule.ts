import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NaytradingService } from './NaytradingService';

@Module({
  providers: [NaytradingService],
  imports: [ConfigModule],
  exports: [NaytradingService]
})
export class NaytradingModule {}
