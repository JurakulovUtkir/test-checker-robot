import { InjectRepository } from '@nestjs/typeorm';
import { Hears, On, Scene, SceneEnter } from 'nestjs-telegraf';
import { Context } from 'src/bot/context/context';
import { BACK_TO_MENU } from 'src/bot/utils/buttons';
import { back_menu } from 'src/bot/utils/functions';
import { scenes } from 'src/bot/utils/scenes';
import { User } from 'src/users/entities/user.entity';
import { Markup } from 'telegraf';
import { Repository } from 'typeorm';

@Scene(scenes.NAME_SCENE)
export class NameScene {
    constructor(
        @InjectRepository(User)
        private readonly user_repository: Repository<User>,
    ) {}

    @SceneEnter()
    async enter(ctx: Context) {
        await ctx.reply(
            `Iltimos to'liq ismizningizni kiriting...`,
            Markup.removeKeyboard(),
        );

        await ctx.reply(
            `Sizning ismingiz : ${ctx.session.user_full_name}
Agar ismingizni o'zgartrishni istamasangiz, menuga qaytadan kirishni bosing.`,
            back_menu(),
        );
    }

    @Hears([BACK_TO_MENU])
    async back_to_menu(ctx: Context) {
        await ctx.scene.enter(scenes.USER_MENU);
    }
    // we have to catch names and set to themselves
    @On('text')
    async name(ctx: Context) {
        try {
            const name = ctx.message['text'];

            // check if the user sends /start message to the bot and leave the scene to user menu scene
            if (name == '/start') {
                await ctx.scene.enter(scenes.USER_MENU);
                return;
            }

            ctx.session.user_full_name = name;

            // validate name name should have at least 5 characters
            if (name.length < 5) {
                await ctx.scene.reenter();
                await ctx.reply(
                    `Ismizning uzunligi 5ta simvol bo'lsun! Iltimos qaytadan kiriting.`,
                );
                return;
            }

            // set full_name to user
            await this.user_repository.update(
                {
                    chat_id: ctx.chat.id.toString(),
                },
                {
                    full_name: name,
                },
            );

            // change scene to CHOOSE_CATEGORY

            // await ctx.reply(`Xush kelibsiz, ${name}!`);

            await ctx.scene.enter(scenes.USER_MENU);
        } catch (error) {
            console.log(error);
            await ctx.scene.leave();
        }
    }
}
