import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NextFunction } from 'express';
import {
    Action,
    Ctx,
    InjectBot,
    Next,
    On,
    Scene,
    SceneEnter,
    Use,
} from 'nestjs-telegraf';
import { Context } from 'src/bot/context/context';
import { CHECKOUT_SUBSCRIPTION } from 'src/bot/utils/buttons';
import { please_subscribe } from 'src/bot/utils/constants';
import { subscriptions } from 'src/bot/utils/functions';
import { scenes } from 'src/bot/utils/scenes';
import { Channel } from 'src/channels/entities/channel.entity';
import { Result } from 'src/results/entities/results.entity';
import { Test } from 'src/tests/entities/tests.entity';
import { Telegraf } from 'telegraf';
import { Repository } from 'typeorm';

@Scene(scenes.CHOOSE_CATEGORY)
export class ChooseCategoryScene {
    constructor(
        @InjectRepository(Channel)
        private readonly channelsRepository: Repository<Channel>,
        @InjectBot('bot') private readonly bot: Telegraf<Context>,
        @InjectRepository(Test)
        private readonly tests_repository: Repository<Test>,
        @InjectRepository(Result)
        private readonly results_repository: Repository<Result>,
    ) {}

    protected logger = new Logger(ChooseCategoryScene.name);

    @SceneEnter()
    async enter(ctx: Context) {
        try {
            ctx.reply(
                "Iltimos kalitlaringizni quyidagi formatda yuboring : 2*aabbccddd... (Agar test kodi 2 bo'ladigan bo'lsa)",
            );
        } catch (error) {
            this.logger.error(error);
        }
    }

    @Action(CHECKOUT_SUBSCRIPTION)
    async checkout_subscription(ctx: Context) {
        try {
            await ctx.deleteMessage();
        } catch (error) {
            this.logger.error(error);
        }
        await ctx.answerCbQuery('Kanallarga obunangiz tekshirilmoqda.');
        if (await this.check_subscriptions(ctx)) {
            this.bot.telegram.sendChatAction(ctx.chat.id, 'typing');
            ctx.scene.reenter();
        } else {
            try {
                await ctx.reply(
                    please_subscribe,
                    subscriptions(await this.channelsRepository.find()),
                );
            } catch (error) {
                this.logger.error(error.message);
            }
        }
    }

    // @Hears(TAKLIF_MUROJAATLAR)
    // async comments(ctx: Context) {
    //     try {
    //         await ctx.reply('upcoming');
    //     } catch (error) {
    //         this.logger.error(error.message);
    //     }
    // }

    @Use()
    async checking(@Ctx() ctx: Context, @Next() next: NextFunction) {
        try {
            //await this.check_subscriptions(ctx)
            if (true) {
                // this.bot.telegram.sendChatAction(ctx.chat.id, 'typing');
                next(ctx);
            } else {
                try {
                    await ctx.reply(
                        please_subscribe,
                        subscriptions(await this.channelsRepository.find()),
                    );
                } catch (error) {
                    this.logger.error(error.message);
                }
            }
        } catch (error) {
            this.logger.error(error.message);
        }
    }

    async check_subscriptions(ctx: Context): Promise<boolean> {
        const channels = await this.channelsRepository.find();
        for (const channel of channels) {
            if (!(await this.is_subscribed(ctx.chat.id, channel.chat_id))) {
                return false;
            }
        }
        return true;
    }

    async is_subscribed(
        user_chat_id: number,
        chanel_chat_id: string,
    ): Promise<boolean> {
        try {
            /**
             * checkout user subscription
             */
            const data = await this.bot.telegram.getChatMember(
                chanel_chat_id,
                +user_chat_id,
            );
            const possible_subscription = [
                'creator',
                'administrator',
                'member',
            ];
            if (possible_subscription.includes(data.status)) {
                return true;
            }
            return false;
        } catch (error) {
            await this.bot.telegram.sendMessage(
                user_chat_id,
                `Kanallardan birontasiga bot admin qilinmagan`,
            );
            this.logger.error(error.message);
        }
    }

    @On('text')
    async check_test(ctx: Context) {
        try {
            const text = (ctx.message['text'] + '').toLowerCase();

            // check if the user sends /start message to the bot and leave the scene to user menu scene
            if (text == '/start') {
                await ctx.scene.enter(scenes.USER_MENU);
            }

            // Extract test number and user test keys
            const [testNumber, userTestKeys] = text.split('*');

            // Convert test number to an integer
            const testId = Number(testNumber);

            // Fetch the test by ID
            const test = await this.tests_repository.findOneBy({ id: testId });

            if (!test) {
                await ctx.reply(`Test topilmadi.`);
                return ctx.scene.reenter();
            }

            // Check if the test is active
            if (!test.is_active) {
                await ctx.reply('Test yopilgan.');
                return ctx.scene.reenter();
            }

            // Check if the user has already completed the test
            const userChatId = ctx.chat.id.toString();
            const userResult = await this.results_repository.findOne({
                where: { test_id: test.id, user_chat_id: userChatId },
            });

            if (userResult) {
                await ctx.reply('Siz bu testni avval tekshirgansiz.');
                return ctx.scene.reenter();
            }

            // Check if the user sent the correct number of answers
            if (userTestKeys.length !== test.open_test_answers_count) {
                await ctx.reply(
                    `Siz yuborgan ID: ${test.id} li testda ${test.open_test_answers_count} ta ochiq javob bo'lishi kerak, lekin siz ${userTestKeys.length} ta javob yubordiz.`,
                );
                return ctx.scene.reenter();
            }

            // Evaluate the user's answers and calculate the score
            ctx.session.test_answers = JSON.parse(test.answers);
            ctx.session.score = 0;
            ctx.session.checking_test_answer_index = 0;
            ctx.session.user_test_answers = [];
            ctx.session.test = test;
            let is_true = false;
            ctx.session.user_result = `Test ID: ${test.id} \n`;
            for (let i = 0; i < test.open_test_answers_count; i++) {
                ctx.session.checking_test_answer_index++;

                ctx.session.user_test_answers.push({
                    id: i + 1,
                    answer: userTestKeys[i],
                });

                if (ctx.session.test_answers[i].answer == userTestKeys[i]) {
                    ctx.session.score++;
                    is_true = true;
                }

                ctx.session.user_result += `${i + 1}.${userTestKeys[i]}  ${
                    is_true ? '✅' : '❌'
                }\n`;
            }

            await ctx.reply(`Ochiq testlariz tekshirib bo'lindi`);
            await ctx.scene.enter(scenes.CHECK_CLOSE_TEST);
        } catch (error) {
            this.logger.error(`Error in check_test: ${error.message}`);
            await ctx.scene.reenter();
        }
    }
}

export function isNumberAsteriskFollowedBy30Chars(text: string): boolean {
    // Regular expression to match a number followed by an asterisk (*) and exactly 30 characters
    const regex = /^\d\*.{30}$/;
    return regex.test(text);
}
