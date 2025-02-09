import { InjectRepository } from '@nestjs/typeorm';
import { Command, On, Scene, SceneEnter } from 'nestjs-telegraf';
import { Context } from 'src/bot/context/context';
import { remove_keyboard } from 'src/bot/utils/functions';
import { scenes } from 'src/bot/utils/scenes';
import { Test } from 'src/tests/entities/tests.entity';
import { Repository } from 'typeorm';

@Scene(scenes.CLOSE_TESTS_SCENE)
export class CloseTestsScene {
    constructor(
        @InjectRepository(Test)
        private readonly tests_repository: Repository<Test>,
    ) {}
    @SceneEnter()
    async enter(ctx: Context) {
        // asking admin to add close test
        await ctx.reply(`
Agar sizda qolganlari yopiq test bo'lsa ${
                ctx.session.test_answers.length + 1
            } - testni javobini kiriting
            
Agar sizda yopiq testla bo'lmasa /done tugmasini bosib testni yaratishiz mumkin,
            `,remove_keyboard());
    }

    @Command('done')
    async done(ctx: Context) {
        // saving test answers to database
        const test_answers = JSON.stringify(ctx.session.test_answers);
        // check text should be 30 characters and only in default keys
       const test = await this.tests_repository.save({
            name: ctx.session.adding_test_name,
            answers: test_answers,
            is_active: true,
            owner_chat_id : ctx.chat.id.toString()
       })

        await ctx.replyWithHTML(
            `
✅️ Test ishlanishga tayyor
🗒 Test nomi: ${test.name}
🔢 Testlar soni: ${ctx.session.test_answers.length} ta
‼️  Test kodi: ${test.id}

Test javoblaringizni quyidagi botga jo'nating:

👉 @Piimaonlinetestbot
👉 @Piimaonlinetestbot
👉 @Piimaonlinetestbot

📌 Testda qatnashuvchilar quyidagi ko'rinishda javob yuborishlari mumkin:
Test kodini kiriting va *(yulduzcha) belgisini qo'ying.
To'liq 20 ta javobni ham kiriting.  

Namuna:
152*abcdab... (20 ta)   yoki
P.S : Agar yopiq testlar bo'lsa ularni alohida kiritasiz(botda hammasi batafsil so'raladi)
♻️Test ishlanishga tayyor!!!
            `,
        );
        await ctx.scene.enter(scenes.ADMIN_MENU)
    }

    @On('text')
    async get_answer(ctx: Context) {
        try {
            const test_answer = ctx.message['text'];

            // Initialize test_answers array if it doesn't exist
            if (!ctx.session.test_answers) {
                ctx.session.test_answers = [];
            }

            // Create answer object with proper key-value syntax
            const answer_id = ctx.session.test_answers.length;
            ctx.session.test_answers.push({
                id: answer_id,
                answer: test_answer,
            });
            await ctx.scene.reenter();
        } catch (error) {
            await ctx.reply('Error processing your answer. Please try again.');
            console.error('Error in get_answer:', error);
        }
    }
}
