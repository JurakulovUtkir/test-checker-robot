import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Hears, On, Scene, SceneEnter } from 'nestjs-telegraf';
import { Context } from 'src/bot/context/context';
import { BACK_TO_MENU } from 'src/bot/utils/buttons';
import { send_news } from 'src/bot/utils/constants';
import { back_menu } from 'src/bot/utils/functions';
import { scenes } from 'src/bot/utils/scenes';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

@Scene(scenes.NEWS)
export class NewsScene {
    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
    ) {}

    private logger = new Logger(NewsScene.name);

    @SceneEnter()
    async sceneEnter(ctx: Context) {
        ctx.reply(send_news, back_menu());
    }

    @Hears([BACK_TO_MENU])
    async back_to_menu(ctx: Context) {
        await ctx.scene.enter(scenes.ADMIN_MENU);
    }

    @On('message')
    async onMessage(ctx: Context) {
        try {
            const users = await this.usersRepository.find({
                where: { status: 'member' },
            });
            await ctx.telegram.sendChatAction(ctx.chat.id, 'typing');

            for (let i = 0; i < users.length; i += 30) {
                const chatIdsSlice = users.slice(i, i + 30); // Slice the array into chunks of 30 chat ids

                await Promise.all(
                    chatIdsSlice.map(async (user) => {
                        // send message
                        await ctx.telegram.forwardMessage(
                            user.chat_id,
                            ctx.chat.id,
                            ctx.message.message_id,
                        );
                    }),
                );
            }
            ctx.reply('Xabaringiz muvaffaqiyatli yuborildi');
        } catch (error) {
            this.logger.error(error.message);
        }
    }
}
