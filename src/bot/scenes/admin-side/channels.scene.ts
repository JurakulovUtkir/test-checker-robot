import { InjectRepository } from '@nestjs/typeorm';
import { Action, Hears, On, Scene, SceneEnter } from 'nestjs-telegraf';
import { Context } from 'src/bot/context/context';
import { BACK_TO_MENU, PLUS_ONE } from 'src/bot/utils/buttons';
import { back_menu, channels_for_adding } from 'src/bot/utils/functions';
import { scenes } from 'src/bot/utils/scenes';
import { Channel } from 'src/channels/entities/channel.entity';
import { Repository } from 'typeorm';

@Scene(scenes.CHANNELS)
export class ChannelsScene {
    constructor(
        @InjectRepository(Channel)
        private readonly channelRepository: Repository<Channel>,
    ) {}

    @SceneEnter()
    async sceneEnter(ctx: Context) {
        const channels = await this.channelRepository.find();
        ctx.reply('channels are here', channels_for_adding(channels));
        ctx.reply(
            'If you want to back to menu, please click the back button',
            back_menu(),
        );
    }

    @Hears([BACK_TO_MENU])
    async back_to_menu(ctx: Context) {
        await ctx.scene.enter(scenes.ADMIN_MENU);
    }

    @Action(PLUS_ONE)
    async add_one(ctx: Context) {
        await ctx.scene.enter(scenes.ADD_CHANNEL);
    }
}
