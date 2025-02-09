import { weekly_hours } from './../../utils/constants';
import { InjectRepository } from '@nestjs/typeorm';
import { Hears, On, Scene, SceneEnter, Start } from 'nestjs-telegraf';
import { Context } from 'src/bot/context/context';
import { USER_BUTTONS } from 'src/bot/utils/buttons';
import { users_menu } from 'src/bot/utils/functions';
import { scenes } from 'src/bot/utils/scenes';
import { Result } from 'src/results/entities/results.entity';
import { Test } from 'src/tests/entities/tests.entity';
import { Markup } from 'telegraf';
import { Repository } from 'typeorm';

@Scene(scenes.USER_MENU)
export class UserMenuScene {
    constructor(
        @InjectRepository(Test)
        private readonly test_repository: Repository<Test>,

        @InjectRepository(Result)
        private readonly result_repository: Repository<Result>,
    ) {}

    @SceneEnter()
    async enter(ctx: Context) {
        await ctx.reply(
            `Welcome to user menu, ${ctx.session.user_full_name}`,
            users_menu(),
        );
    }
    @Start()
    async start(ctx: Context) {
        await ctx.scene.enter(scenes.USER_MENU);
    }

    @Hears(USER_BUTTONS.EDIT_NAME)
    async edit_name(ctx: Context) {
        await ctx.scene.enter(scenes.NAME_SCENE);
    }

    @Hears(USER_BUTTONS.CHECK_TEST)
    async check_test(ctx: Context) {
        await ctx.scene.enter(scenes.CHOOSE_CATEGORY);
    }

    @Hears(USER_BUTTONS.TEST_RESULTS)
    async results(ctx: Context) {
        await ctx.scene.enter(scenes.TEST_RESULTS);
    }
}
