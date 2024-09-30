import { InjectRepository } from '@nestjs/typeorm';
import { Hears, On, Scene, SceneEnter } from 'nestjs-telegraf';
import { Context } from 'src/bot/context/context';
import { BACK_TO_MENU } from 'src/bot/utils/buttons';
import { example_test_answers } from 'src/bot/utils/constants';
import { back_menu } from 'src/bot/utils/functions';
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
        await ctx.reply(example_test_answers, back_menu());
    }

    @Hears([BACK_TO_MENU])
    async back_to_menu(ctx: Context) {
        await ctx.scene.enter(scenes.ADMIN_MENU);
    }

    @On('text')
    async add_test(ctx: Context) {
        const test_answers = ctx.message['text'];
        // save test_answers to database
        const default_keys = ['a', 'b', 'c', 'd', 'e'];
        // check text should be 30 characters and only in default keys
        if (
            test_answers.split('').every((char) => default_keys.includes(char))
        ) {
            // save test_answers to database

            const test = await this.tests_repository.save({
                owner_chat_id: ctx.chat.id.toString(),
                is_active: true,
                answers: test_answers,
                checked_count: 0,
                created_at: new Date(),
            });

            await this.tests_repository.update(
                { id: test.id },
                { name: 'Test ' + test.id },
            );
            await ctx.reply('new test is added!!!');

            await ctx.reply(`
                Test ID: ${test.id}
Test nomi: Test ${test.id}
Test javoblari: ${test_answers}
                `);

            await ctx.scene.enter(scenes.ADMIN_MENU);
        } else {
            await ctx.reply(
                'Test da faqat a,b,c,d,e kalitlaridan foydalanish mumkin',
            );
            await ctx.scene.reenter();
        }
    }
}
