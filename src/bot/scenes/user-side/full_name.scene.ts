import { InjectRepository } from '@nestjs/typeorm';
import { On, Scene, SceneEnter } from 'nestjs-telegraf';
import { Context } from 'src/bot/context/context';
import { scenes } from 'src/bot/utils/scenes';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

@Scene(scenes.NAME_SCENE)
export class NameScene {
    constructor(
        @InjectRepository(User)
        private readonly user_repository: Repository<User>,
    ) {}

    @SceneEnter()
    async enter(ctx: Context) {
        await ctx.reply(`Iltimos to'liq ismizningizni kiriting...`);
    }

    // we have to catch names and set to themselves
    @On('text')
    async name(ctx: Context) {
        const name = ctx.message['text'];
        ctx.session.user_full_name = name;

        // validate name name should have at least 5 characters
        if (name.length < 5) {
            await ctx.scene.reenter();
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

        await ctx.reply(`Xush kelibsiz, ${name}!`);
        await ctx.scene.enter(scenes.CHOOSE_CATEGORY);
    }
}
