import { Result } from 'src/results/entities/results.entity';
import { Test } from 'src/tests/entities/tests.entity';
import { Scenes, Context as BaseContext } from 'telegraf';
import { Update } from 'telegraf/typings/core/types/typegram';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Context extends BaseContext {
    update: Update.CallbackQueryUpdate;
    session: SessionData;
    scene: Scenes.SceneContextScene<Context, MySceneSession>;
    match: any;
}

interface SessionData extends Scenes.SceneSession<MySceneSession> {
    user_full_name: string;
    /**
     * o'zimizga keraklilari
     */
    selected_test_id: number;
    selected_test_stats: Result[];
    test_page: number;
    tests: Test[];
}

interface MySceneSession extends Scenes.SceneSessionData {
    state: {
        wallet?: string;
        amount?: string;
        prevScene?: string[];
        orderId?: number;
        walletBalance?: number;
    };
}
