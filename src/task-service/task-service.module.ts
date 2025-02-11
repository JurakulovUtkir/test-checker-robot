import { Module } from '@nestjs/common';
import { TaskServiceService } from './task-service.service';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TelegrafModule } from 'nestjs-telegraf';
import { BotModule } from 'src/bot/bot.module';
import { session } from 'telegraf';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        TelegrafModule.forRoot({
            middlewares: [session()],
            botName: 'bot',
            include: [BotModule],
            token: process.env.BOT_TOKEN,
        }),
    ],
    providers: [TaskServiceService],
})
export class TaskServiceModule {}
