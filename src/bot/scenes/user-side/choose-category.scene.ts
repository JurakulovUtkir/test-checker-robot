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
        private readonly reults_repository: Repository<Result>,
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
            if (await this.check_subscriptions(ctx)) {
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
            const text: string = ctx.message['text'];
            const is_in_formatted = isNumberAsteriskFollowedBy30Chars(text);
            if (!is_in_formatted) {
                await ctx.reply(
                    `Iltimos, 2*aabbccddd... (agar test kodi 2 bo'ladigan bo'lsa) formatida qaytadan kiring`,
                );
                return ctx.scene.reenter();
            }

            const data = text.split('*');
            const test_number = +data[0];
            const user_test_keys = data[1];

            const test = await this.tests_repository.findOneBy({
                id: test_number,
            });

            if (!test) {
                await ctx.reply(`Test  topilmadi.`);
                await ctx.scene.reenter();
            }

            // check test is active or not
            if (test.is_active) {
                // we have to check test give results to user and save to the database

                const ball = await check_test_keys(
                    user_test_keys,
                    test.answers,
                );

                await this.reults_repository.save({
                    test,
                    user_chat_id: ctx.chat.id.toString(),
                    result: ball,
                    created_at: new Date(),
                });

                ctx.reply(`
Test ID : ${test.id}
Test nomi : ${test.name} 
Ball : ${ball} ball               
                `);

                await ctx.reply('Successfully saved!');
            } else {
                await ctx.reply('Test yopilgan.');
            }
        } catch (error) {
            this.logger.log(error.message);
        }
    }
}

export function isNumberAsteriskFollowedBy30Chars(text: string): boolean {
    // Regular expression to match a number followed by an asterisk (*) and exactly 30 characters
    const regex = /^\d\*.{30}$/;
    return regex.test(text);
}

export function check_test_keys(user_keys: string, test_keys): number {
    let true_keys = 0;

    for (let i = 0; i < test_keys.length; i++) {
        if (user_keys[i] === test_keys[i]) {
            true_keys++;
        }
    }
    return true_keys;
}
