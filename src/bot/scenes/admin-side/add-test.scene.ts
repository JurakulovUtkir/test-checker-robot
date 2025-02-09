import { InjectRepository } from '@nestjs/typeorm';
import { Hears, On, Scene, SceneEnter } from 'nestjs-telegraf';
import { Context } from 'src/bot/context/context';
import { BACK_TO_MENU, ONLY_CLOSE_TESTS } from 'src/bot/utils/buttons';
import { example_test_answers } from 'src/bot/utils/constants';
import { add_test_menu, back_menu } from 'src/bot/utils/functions';
import { scenes } from 'src/bot/utils/scenes';
import { Test } from 'src/tests/entities/tests.entity';
import { Repository } from 'typeorm';

@Scene(scenes.ADD_TEST)
export class AddTestScene {
    constructor(
        @InjectRepository(Test)
        private readonly tests_repository: Repository<Test>,
    ) {}
    @SceneEnter()
    async enter(ctx: Context) {
        await ctx.reply(example_test_answers, add_test_menu());
    }

    @Hears([BACK_TO_MENU])
    async back_to_menu(ctx: Context) {
        await ctx.scene.enter(scenes.ADMIN_MENU);
    }

    @Hears([ONLY_CLOSE_TESTS])
    async close_tests(ctx: Context) {
        await ctx.scene.enter(scenes.CLOSE_TESTS_SCENE);
    }

    @On('text')
    async add_test(ctx: Context) {
        const test_answers = ctx.message['text'];

        if(!ctx.session.test_answers){
            ctx.session.test_answers = [];
        }

        // save test_answers to database
        const default_keys = ['a', 'b', 'c', 'd', 'e'];
        // check text should be 30 characters and only in default keys
        if (
            test_answers.split('').every((char) => default_keys.includes(char))
        ) {
            // save test_answers to database
        for(let i=0;i<test_answers.length;i++){
     ctx.session.test_answers.push({
        id : i+1,
        answer : test_answers[i]
    })
        }

            await ctx.scene.enter(scenes.CLOSE_TESTS_SCENE);
        } else {
            await ctx.reply(
                'Test da faqat a,b,c,d,e kalitlaridan foydalanish mumkin',
            );
            await ctx.scene.reenter();
        }
    }
}
