import { InjectRepository } from '@nestjs/typeorm';
import { On, Scene, SceneEnter } from 'nestjs-telegraf';
import { Context } from 'src/bot/context/context';
import { scenes } from 'src/bot/utils/scenes';
import { Channel } from 'src/channels/entities/channel.entity';
import { Repository } from 'typeorm';

@Scene(scenes.ADD_CHANNEL)
export class AddChannelScene {
    constructor(
        @InjectRepository(Channel)
        private readonly channelRepository: Repository<Channel>,
    ) {}

    @SceneEnter()
    async enter(ctx: Context) {
        ctx.deleteMessage();
        ctx.reply('Please send forward message from channel');
    }
    @On('message')
    async adding_one(ctx: Context) {
        const forward = ctx.message['forward_from_chat'];

        if (forward?.type != 'channel' || !forward) {
            return await ctx.scene.reenter();
        } else {
            const channel = new Channel();

            channel.chat_id = forward.id;
            channel.full_name = forward.title;
            channel.url = 'https://t.me/' + forward.username;
            channel.user_chat_id = ctx.chat.id.toString();

            await this.channelRepository.save(channel);
            await ctx.scene.enter(scenes.ADMIN_MENU);
        }
    }
}
