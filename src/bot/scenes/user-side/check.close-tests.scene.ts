import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { On, Scene, SceneEnter } from 'nestjs-telegraf';
import { Context } from 'src/bot/context/context';
import { scenes } from 'src/bot/utils/scenes';
import { Result } from 'src/results/entities/results.entity';
import { Test } from 'src/tests/entities/tests.entity';

@Scene(scenes.CHECK_CLOSE_TEST)
export class CheckCloseTestsScene {
    constructor(
        @InjectRepository(Test)
        private readonly tests_repository: Repository<Test>,
        @InjectRepository(Result)
        private readonly results_repository: Repository<Result>,
    ) {}

    @SceneEnter()
    async enter(ctx: Context) {
        // if open test has only open test keys
        if (
            ctx.session.user_test_answers.length ==
            JSON.parse(ctx.session.test.answers).length
        ) {
            await ctx.reply(
                `Here is your results : \n ${ctx.session.user_result}`,
            );
            await ctx.scene.enter(scenes.USER_MENU);
        } else {
            await ctx.reply(
                `Iltimos ${
                    ctx.session.user_test_answers.length + 1
                } - savol javobini kiriting!`,
            );
        }
    }

    @On('text')
    async check_test(ctx: Context) {
        try {
            const text = ctx.message['text'] + '';

            // check if the user sends /start message to the bot and leave the scene to user menu scene
            if (text == '/start') {
                await ctx.scene.enter(scenes.USER_MENU);
            }

            ctx.session.user_test_answers.push({
                id: ctx.session.checking_test_answer_index + 1,
                answer: text,
            });

            let is_true = false;
            if (
                ctx.session.test_answers[
                    ctx.session.checking_test_answer_index
                ].answer.toLowerCase() == text.toLowerCase()
            ) {
                ctx.session.score++;
                is_true = true;
            }

            ctx.session.user_result += `${
                ctx.session.checking_test_answer_index + 1
            }.${text}  ${is_true ? '✅' : '❌'}\n`;

            // saving test results and test stats update
            await this.tests_repository.update(
                { id: ctx.session.test.id },
                {
                    checked_count: ctx.session.test.checked_count + 1,
                },
            );

            await this.results_repository.save({
                user_chat_id: ctx.chat.id.toString(),
                result: ctx.session.score,
                test_id: ctx.session.test.id,
                user: ctx.session.user_full_name,
                answers: JSON.stringify(ctx.session.user_test_answers),
            });

            ctx.session.checking_test_answer_index++;
            await ctx.scene.reenter();
        } catch (error) {
            console.error(`Error in check_test: ${error.message}`);
            await ctx.scene.leave();
        }
    }
}
