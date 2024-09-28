import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BotModule } from './bot/bot.module';
import { UsersModule } from './users/users.module';
import { ChannelsModule } from './channels/channels.module';
import { TestsModule } from './tests/tests.module';
import { ResultsModule } from './results/results.module';
import * as dotenv from 'dotenv';

dotenv.config();

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT),
            username: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            autoLoadEntities: true,
            synchronize: true,
        }),
        BotModule,
        UsersModule,
        ChannelsModule,
        TestsModule,
        ResultsModule,
    ],
})
export class AppModule {}
