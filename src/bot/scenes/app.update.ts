import { Injectable, Logger, UseInterceptors } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectBot, On, Start, Update } from 'nestjs-telegraf';
import { User } from 'src/users/entities/user.entity';
import { Telegraf } from 'telegraf';
import { Repository } from 'typeorm';
import { Context } from '../context/context';
import { BotInterceptor } from '../interceptor/interceptor';
import { scenes } from '../utils/scenes';

@Update()
@Injectable()
@UseInterceptors(BotInterceptor)
export class AppUpdate {
    constructor(
        @InjectBot('bot') private readonly bot: Telegraf<Context>,
        @InjectRepository(User) private readonly repository: Repository<User>,
    ) {}

    private logger = new Logger(AppUpdate.name);

    @Start()
    async start(ctx: Context) {
        const user = await this.getUser(ctx);
        ctx.session.user_full_name = user.full_name;
        if (user.role == 'admin') {
            await ctx.scene.enter(scenes.ADMIN_MENU);
        } else {
            if (user.full_name) {
                await ctx.scene.enter(scenes.CHOOSE_CATEGORY);
            } else {
                await ctx.scene.enter(scenes.NAME_SCENE);
            }
        }
    }

    async getUser(ctx: Context): Promise<User> {
        {
            const users = await this.repository.find({
                where: {
                    chat_id: ctx.chat.id.toString(),
                },
            });

            if (users.length > 0) {
                return users[0];
            } else {
                try {
                    const user = this.repository.create({
                        chat_id: ctx.chat.id.toString(),
                        role: 'user',
                        status: 'member',
                    });

                    this.repository.save(user);

                    return user;
                } catch (error) {
                    this.logger.error(error.message);
                }
            }
        }
    }

    @On('my_chat_member')
    async get_chat_member(ctx: Context) {
        const newChatMember = ctx.update['my_chat_member'].new_chat_member;
        await this.repository.update(
            {
                chat_id: ctx.chat.id.toString(),
            },
            {
                status: newChatMember.status,
            },
        );
    }
}
