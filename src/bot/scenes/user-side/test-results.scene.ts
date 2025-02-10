import { InjectRepository } from '@nestjs/typeorm';
import { On, Scene, SceneEnter } from 'nestjs-telegraf';
import { Context } from 'src/bot/context/context';
import { scenes } from 'src/bot/utils/scenes';
import { Result } from 'src/results/entities/results.entity';
import { Test } from 'src/tests/entities/tests.entity';
import { Markup } from 'telegraf';
import { IsNull, Not, Repository } from 'typeorm';

@Scene(scenes.TEST_RESULTS)
export class TestResultsScene {
    constructor(
        @InjectRepository(Test)
        private readonly test_repository: Repository<Test>,

        @InjectRepository(Result)
        private readonly result_repository: Repository<Result>,
    ) {}

    @SceneEnter()
    async enter(ctx: Context) {
        // showing test results with inline buttons to show with full detailed information
        const results = await this.result_repository.find({
            where: {
                user_chat_id: ctx.chat.id.toString(),
                answers: Not(IsNull()),
            },
            order: {
                created_at: 'desc',
            },
            take: 5,
        });

        if (results.length === 0) {
            await ctx.reply('Sizda natijalar mavjud emas');
            await ctx.scene.enter(scenes.USER_MENU);
            return;
        }

        // showing test results with inline buttons to show with full detailed information

        for (const result of results) {
            const test = await this.test_repository.findOneBy({
                id: result.test_id,
            });
            const text = `
Test: ${test.name}(${test.answers.length})
Natijangiz: ${result.result}
Vaqti: ${result.created_at.toLocaleString()}
            `;

            await ctx.reply(
                text,
                Markup.inlineKeyboard([
                    Markup.button.callback('ℹ️ details', `${result.id}`),
                ]),
            );
        }
    }
    @On('callback_query')
    async handle_callback_query(ctx: Context) {
        const result_id = await ctx.callbackQuery['data'];
        const result = await this.result_repository.findOneBy({
            id: result_id,
        });
        const test = await this.test_repository.findOneBy({
            id: result.test_id,
        });
        ctx.session.test_answers = JSON.parse(test.answers);
        ctx.session.user_test_answers = JSON.parse(result.answers);

        let text = ``;

        text += `Test: ${test.name}\n\n`;

        for (let i = 0; i < ctx.session.test_answers.length; i++) {
            const emoji =
                ctx.session.test_answers[i].answer ===
                ctx.session.user_test_answers[i].answer
                    ? '✅'
                    : '❌';
            if (
                ctx.session.test_answers[i].answer ===
                ctx.session.user_test_answers[i].answer
            ) {
                text += ` ${i + 1}. ${
                    ctx.session.user_test_answers[i].answer
                } ${emoji}\n`;
            } else {
                text += ` ${i + 1}. ${
                    ctx.session.user_test_answers[i].answer
                } ${emoji} ${ctx.session.test_answers[
                    i
                ].answer.toLowerCase()}\n`;
            }
        }

        await ctx.editMessageText(text);
        await ctx.scene.enter(scenes.USER_MENU);
    }
}
