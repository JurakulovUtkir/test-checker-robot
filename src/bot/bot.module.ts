import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { session } from 'telegraf';
import { AppUpdate } from './scenes/app.update';
import * as dotenv from 'dotenv';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Channel } from 'src/channels/entities/channel.entity';
import { AdminMenuScene } from './scenes/admin-side/admin-menu.scene';
import { ChannelsScene } from './scenes/admin-side/channels.scene';
import { NewsScene } from './scenes/admin-side/news.scene';
import { AddChannelScene } from './scenes/admin-side/add-channel.scene';
import { Test } from 'src/tests/entities/tests.entity';
import { Result } from 'src/results/entities/results.entity';
import { TestListScene } from './scenes/admin-side/test-list.scene';
import { AddTestScene } from './scenes/admin-side/add-test.scene';
import { ChooseCategoryScene } from './scenes/user-side/choose-category.scene';
import { NameScene } from './scenes/user-side/full_name.scene';
import { TestNameScene } from './scenes/admin-side/test-name.scene';
import { StatsScene } from './scenes/user-side/stats.scene';

dotenv.config();

@Module({
    imports: [
        TelegrafModule.forRoot({
            middlewares: [session()],
            botName: 'bot',
            include: [BotModule],
            token: process.env.BOT_TOKEN,
        }),
        TypeOrmModule.forFeature([User, Channel, Test, Result]),
    ],
    providers: [
        AppUpdate,
        ChooseCategoryScene,
        NameScene,
        StatsScene,
        /**
         * admin-site
         */
        AdminMenuScene,
        ChannelsScene,
        AddChannelScene,
        NewsScene,
        TestListScene,
        AddTestScene,
        TestNameScene,
    ],
})
export class BotModule {}
