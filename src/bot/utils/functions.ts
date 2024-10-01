import { Markup } from 'telegraf';
import {
    ADMIN_BUTTONS,
    BACK_TO_MENU,
    CHANNELS,
    CHECKOUT_SUBSCRIPTION,
    PLUS_ONE,
    STATISTICS,
} from './buttons';
import { Channel } from 'src/channels/entities/channel.entity';
import { Test } from 'src/tests/entities/tests.entity';

/**
 * channels inline buttons
 */

export function subscriptions(channels: Channel[]) {
    const inline_buttons = [];

    channels.forEach((ch) => {
        inline_buttons.push(Markup.button.url(ch.full_name, ch.url));
    });

    inline_buttons.push(
        Markup.button.callback(CHECKOUT_SUBSCRIPTION, CHECKOUT_SUBSCRIPTION),
    );
    return Markup.inlineKeyboard(inline_buttons, { columns: 1 });
}

/**
 * admin-site
 */

export function admin_menu() {
    return Markup.keyboard(
        [
            Markup.button.text(STATISTICS),
            // Markup.button.text(NEWS),
            Markup.button.text(CHANNELS),
            // Markup.button.text(ADMINS),
            Markup.button.text(ADMIN_BUTTONS.TEST_LIST),
        ],
        {
            columns: 2,
        },
    )
        .oneTime()
        .resize()
        .selective();
}

export function channels_for_adding(channels: Channel[]) {
    const inline_buttons = [];

    channels.forEach((ch) => {
        inline_buttons.push(Markup.button.url(ch.full_name, ch.url));
    });

    inline_buttons.push(Markup.button.callback(PLUS_ONE, PLUS_ONE));
    return Markup.inlineKeyboard(inline_buttons, { columns: 1 });
}

export function back_menu() {
    return Markup.keyboard([Markup.button.text(BACK_TO_MENU)], {
        columns: 2,
    })
        .oneTime()
        .resize()
        .selective();
}

export function show_tests(tests: Test[]) {
    // we have to show all tests in inline mode
    // so we will create a keyboard with each test as a button
    const inline_buttons = [];

    tests.forEach((test) => {
        inline_buttons.push(
            Markup.button.callback(test.name, test.id.toString()),
        );
    });

    // add button : "adding new one"
    inline_buttons.push(Markup.button.callback(PLUS_ONE, PLUS_ONE));

    // return the keyboard with inline buttons

    return Markup.inlineKeyboard(inline_buttons, { columns: 1 });
}

export function test_functionalities(test: Test) {
    // add test functionalities here
    // buttons for make active if inactive or the opposite

    const status_show = 'Status' + (test.is_active ? '✅' : '❌');

    return Markup.inlineKeyboard([
        [
            Markup.button.callback(ADMIN_BUTTONS.EXCEL_FILE, 'excel'),
            Markup.button.callback(ADMIN_BUTTONS.TEST_STATS, 'stats'),
        ],
        [
            Markup.button.callback(status_show, 'status'),
            Markup.button.callback('Edit test', 'edit_test'),
        ],
        [Markup.button.callback('🧹🪣 Delete test', 'delete_test')],
        [Markup.button.callback('🔙 Back', 'back')],
    ]);
}
