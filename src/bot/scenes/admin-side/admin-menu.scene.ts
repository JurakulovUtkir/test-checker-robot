import {
    ADMIN_BUTTONS,
    ADMINS,
    CHANNELS,
    NEWS,
    STATISTICS,
} from './../../utils/buttons';
import { Context } from './../../context/context';
import { Scene, SceneEnter, Hears, InjectBot } from 'nestjs-telegraf';
import { admin_site } from 'src/bot/utils/constants';
import { admin_menu } from 'src/bot/utils/functions';
import { scenes } from 'src/bot/utils/scenes';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { Telegraf } from 'telegraf';

@Scene(scenes.ADMIN_MENU)
export class AdminMenuScene {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectBot('bot') private readonly bot: Telegraf<Context>,
    ) {}

    @SceneEnter()
    async enter(ctx: Context) {
        await ctx.reply('Salom', {
            entities: [
                {
                    type: 'text_mention',
                    offset: 0,
                    length: 5,
                    user: {
                        id: ctx.chat.id,
                        first_name: '',
                        last_name: '',
                        username: '',
                        is_bot: false,
                    },
                },
            ],
        });

        await ctx.reply(admin_site, admin_menu());
    }

    @Hears(STATISTICS)
    async statistics(ctx: Context) {
        const users = await this.userRepository.find();
        await this.bot.telegram.sendChatAction(ctx.chat.id, 'typing');

        // await ctx.telegram.sendMessage('1718602214', '1718602214');
        const active_users = users.filter((u) => u.status === 'member');

        ctx.reply(
            `
active userlar soni : ${active_users.length}
blocked users : ${users.length - active_users.length}     
        `,
            admin_menu(),
        );
    }

    @Hears(CHANNELS)
    async channels(ctx: Context) {
        await ctx.scene.enter(scenes.CHANNELS);
    }

    @Hears(NEWS)
    async news(ctx: Context) {
        await ctx.scene.enter(scenes.NEWS);
    }

    @Hears(ADMINS)
    async admins(ctx: Context) {
        ctx.reply('upcoming');
    }

    @Hears(ADMIN_BUTTONS.TEST_LIST)
    async test_list(ctx: Context) {
        await ctx.scene.enter(scenes.TEST_LIST);
    }
}
