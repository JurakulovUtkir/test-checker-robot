import { InjectRepository } from '@nestjs/typeorm';
import { Hears, Scene, SceneEnter } from 'nestjs-telegraf';
import { Context } from 'src/bot/context/context';
import { classes, regions } from 'src/bot/utils/constants';
import { make_buttons } from 'src/bot/utils/functions';
import { scenes } from 'src/bot/utils/scenes';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

@Scene(scenes.STATS)
export class StatsScene {
    constructor(
        @InjectRepository(User)
        private readonly users_repository: Repository<User>,
    ) {}

    @SceneEnter()
    async enter(ctx: Context) {
        // please choose your region there
        await ctx.reply('Please choose your region', make_buttons(regions));
    }

    @Hears(regions)
    async region_chosen(ctx: Context) {
        // you have chosen region, so we will show statistics here
        // for example, we will send statistics about this region
        const region = ctx.message['text'];
        await this.users_repository.update(
            {
                chat_id: ctx.chat.id.toString(),
            },
            { region },
        );

        // asking classes from user :
        await ctx.reply('Please choose your classes', make_buttons(classes));
    }

    @Hears(classes)
    async class_chosen(ctx: Context) {
        // you have chosen region, so we will show statistics here
        // for example, we will send statistics about this region
        const user_class = ctx.message['text'];

        await this.users_repository.update(
            {
                chat_id: ctx.chat.id.toString(),
            },
            { class: user_class },
        );

        const user = await this.users_repository.findOneBy({
            chat_id: ctx.chat.id.toString(),
        });

        if (user.full_name) {
            // send statistics about this user
            await ctx.scene.enter(scenes.CHOOSE_CATEGORY);
        } else {
            // user not found, we will create a new user
            await ctx.scene.enter(scenes.NAME_SCENE);
        }
    }
}
