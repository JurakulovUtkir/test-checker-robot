import { Module } from '@nestjs/common';
import { Result } from './entities/results.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([Result])],
})
export class ResultsModule {}
