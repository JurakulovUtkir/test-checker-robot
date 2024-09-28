import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Test } from './entities/tests.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Test])],
})
export class TestsModule {}
