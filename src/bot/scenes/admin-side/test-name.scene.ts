import { InjectRepository } from '@nestjs/typeorm';
import { On, Scene, SceneEnter } from 'nestjs-telegraf';
import { Context } from 'src/bot/context/context';
import { scenes } from 'src/bot/utils/scenes';
import { Test } from 'src/tests/entities/tests.entity';
import { Repository } from 'typeorm';

@Scene(scenes.TEST_NAME)
export class TestNameScene {
    constructor(
        @InjectRepository(Test)
        private readonly tests_repository: Repository<Test>,
    ) {}

    @SceneEnter()
    async enter(ctx: Context) {
        //...
        await ctx.reply('Enter Test Name');
    }

    @On('text')
    async name_test(ctx: Context) {
        //...
        const test_name = ctx.message['text'];
        // saving the test name to the repository
        const test = await this.tests_repository.save({
            name: test_name,
            owner_chat_id: ctx.chat.id.toString(),
            is_active: true,
        });

        ctx.session.selected_test_id = test.id; // save the test id to session for later use in other scenes

        await ctx.scene.enter(scenes.ADD_TEST); // navigate to result scene
    }
}
