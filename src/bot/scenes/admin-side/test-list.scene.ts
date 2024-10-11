import { InjectRepository } from '@nestjs/typeorm';
import { Action, On, Scene, SceneEnter } from 'nestjs-telegraf';
import { Context } from 'src/bot/context/context';
import { PLUS_ONE } from 'src/bot/utils/buttons';
import { show_tests, test_functionalities } from 'src/bot/utils/functions';
import { scenes } from 'src/bot/utils/scenes';
import { Result } from 'src/results/entities/results.entity';
import { Test } from 'src/tests/entities/tests.entity';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as PDFDocument from 'pdfkit';
import * as pdfMake from 'pdfkit';

import { Workbook } from 'exceljs';
import * as tmp from 'tmp'; // Temporary files library (optional but recommended for handling files)
import { User } from 'src/users/entities/user.entity';

@Scene(scenes.TEST_LIST)
export class TestListScene {
    constructor(
        @InjectRepository(Test)
        private readonly tests_repository: Repository<Test>,
        @InjectRepository(Result)
        private readonly results_repository: Repository<Result>,
        @InjectRepository(User)
        private readonly user_repository: Repository<User>,
    ) {}
    @SceneEnter()
    async enter(ctx: Context) {
        const all_tests = await this.tests_repository.find({
            order: {
                id: 'ASC',
            },
        });
        await ctx.reply('Here are all your tests:', show_tests(all_tests));
    }

    @Action(PLUS_ONE)
    async add_test(ctx: Context) {
        await ctx.deleteMessage();
        await ctx.answerCbQuery('You are now adding a test');
        ctx.scene.enter(scenes.TEST_NAME);
    }

    @Action('back')
    async back(ctx: Context) {
        const all_tests = await this.tests_repository.find({
            where: {
                owner_chat_id: ctx.chat.id.toString(),
            },
            order: {
                id: 'ASC',
            },
        });
        await ctx.editMessageReplyMarkup(show_tests(all_tests).reply_markup);
        await ctx.editMessageText('Here are all your tests:');
    }

    @Action('status')
    async status(ctx: Context) {
        await ctx.answerCbQuery('Your test status has been updated');

        const { selected_test_id } = ctx.session;

        // Fetch the test once and directly check its status
        const test = await this.tests_repository.findOneBy({
            id: selected_test_id,
        });
        if (!test) {
            throw new Error('Test not found');
        }

        // Toggle the status based on the current is_active flag
        const updatedStatus = !test.is_active;

        // Update the test status in the repository
        await this.tests_repository.update(
            { id: selected_test_id },
            { is_active: updatedStatus },
        );

        // Update the message reply markup with the new status
        await ctx.editMessageReplyMarkup(
            test_functionalities({ ...test, is_active: updatedStatus })
                .reply_markup,
        );
    }

    @Action('excel')
    async excel(ctx: Context) {
        const { selected_test_id } = ctx.session;

        // Fetch all results for the selected test
        const results: Result[] = await this.results_repository.find({
            where: { test_id: selected_test_id },
            order: {
                result: 'DESC',
                created_at: 'ASC',
            },
        });

        for (const result of results) {
            const user = await this.user_repository.findOneBy({
                chat_id: result.user_chat_id,
            });
            result.region = user.region;
            result.class = user.class;
        }

        // Create a new workbook and a worksheet
        const workbook = new Workbook();
        const worksheet = workbook.addWorksheet('Test Results');

        // Add header row
        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'User', key: 'user', width: 40 },
            { header: 'Result', key: 'result', width: 10 },
            { header: 'Created At', key: 'created_at', width: 40 },
            { header: 'Region', key: 'region', width: 40 },
            { header: 'Class', key: 'class', width: 40 },
        ];

        // Add data rows
        results.forEach((result, i) => {
            worksheet.addRow({
                id: i++,
                user: result.user,
                result: result.result,
                created_at: result.created_at.toLocaleString(),
                region: result.region,
                class: result.class,
            });
        });

        // Use a temporary file to store the Excel file
        const tempFile = tmp.fileSync({ postfix: '.xlsx' });
        const filePath = tempFile.name;

        // Write the workbook to the temporary file
        await workbook.xlsx.writeFile(filePath);

        // Send the file as a response in the chat
        await ctx.replyWithDocument(
            {
                source: fs.createReadStream(filePath),
                filename: `Test_${selected_test_id}_Results.xlsx`,
            },
            { caption: 'Here are the results of the test in Excel format.' },
        );

        // Clean up the temporary file after use
        tempFile.removeCallback();
    }

    @Action('edit_test')
    async edit_test(ctx: Context) {
        await ctx.answerCbQuery('You are now editing a test');
    }

    @Action('delete_test')
    async delete_test(ctx: Context) {
        await ctx.answerCbQuery(
            'You have deleted a test with ID: ' + ctx.session.selected_test_id,
        );
        await this.tests_repository.delete({
            id: ctx.session.selected_test_id,
        });
        await ctx.deleteMessage();
        ctx.scene.enter(scenes.TEST_LIST);
    }

    @Action('stats')
    async stats(ctx: Context) {
        await ctx.answerCbQuery(
            'Your test statistics have been calculated and upcoming',
        );
        // const selectedTestStats = ctx.session.selected_test_stats;
        // // Check if there are no results for the selected test
        // if (!selectedTestStats || selectedTestStats.length === 0) {
        //     await ctx.reply('No results found for the selected test.');
        //     return;
        // }
        // // Create a temporary file path
        // const tempFile = tmp.fileSync({ postfix: '.pdf' });
        // const filePath = tempFile.name;
        // // Create a PDF document definition
        // const docDefinition = {
        //     content: [
        //         {
        //             text: 'Test Natijalari',
        //             style: 'header',
        //             alignment: 'center',
        //         },
        //         {
        //             table: {
        //                 widths: [30, '*', 100], // Widths for index, user, and score columns
        //                 body: [
        //                     ['No.', 'User', 'Score'], // Table Header
        //                     ...selectedTestStats.map((result, index) => [
        //                         index + 1,
        //                         result.user,
        //                         `${result.result} ball`,
        //                     ]),
        //                 ],
        //             },
        //             layout: 'lightHorizontalLines', // Optional: to add light horizontal lines
        //         },
        //     ],
        //     styles: {
        //         header: {
        //             fontSize: 16,
        //             bold: true,
        //             margin: [0, 20, 0, 20],
        //         },
        //     },
        // };
        // // Create a PDF with pdfMake
        // const printer = new pdfMake({
        //     Roboto: {
        //         normal: 'node_modules/pdfmake/build/vfs_fonts.js',
        //         bold: 'node_modules/pdfmake/build/vfs_fonts.js',
        //         italics: 'node_modules/pdfmake/build/vfs_fonts.js',
        //         bolditalics: 'node_modules/pdfmake/build/vfs_fonts.js',
        //     },
        // });
        // // Generate the PDF and write it to the file
        // const pdfDoc = printer.createPdfKitDocument(docDefinition);
        // pdfDoc.pipe(fs.createWriteStream(filePath));
        // pdfDoc.end();
        // // Wait for the PDF to finish generating and then send it
        // pdfDoc.on('finish', async () => {
        //     await ctx.replyWithDocument({
        //         source: filePath,
        //         filename: 'test_stats.pdf',
        //     });
        //     // Cleanup: remove the temporary file after sending
        //     tempFile.removeCallback();
        // });
    }

    @On('callback_query')
    async handle_callback_query(ctx: Context) {
        ctx.session.selected_test_id = +ctx.callbackQuery['data'];
        const test = await this.tests_repository.findOneBy({
            id: ctx.session.selected_test_id,
        });

        ctx.session.selected_test_stats = await this.results_repository.find({
            where: {
                test_id: test.id,
            },
            order: {
                result: 'DESC',
                created_at: 'ASC',
            },
        });

        await ctx.editMessageText(`
🗒 Test nomi: ${test.name}
🔢 Testlar soni: ${test.answers.length} ta
‼️  Test kodi: ${test.id}
            `);
        await ctx.editMessageReplyMarkup(
            test_functionalities(test).reply_markup,
        );
    }
}
