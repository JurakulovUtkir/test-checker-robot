import { BadRequestException, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectBot } from 'nestjs-telegraf';
import { Context } from 'src/bot/context/context';
import { Telegraf } from 'telegraf';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import { exec } from 'child_process';
dotenv.config();

@Injectable()
export class TaskServiceService {
    constructor(@InjectBot('bot') private readonly bot: Telegraf<Context>) {}

    // @Cron('1 * * * * *')
    // handleCron() {
    //     console.log(
    //         'Called when the first second of minute ' +
    //             new Date().toLocaleString(),
    //     );
    // }

    private isProductionBackupDB = (filePath: string): string => {
        return `docker exec -t test-bot-postgres pg_dump -c -U test -d test > ${filePath}`;
    };

    @Cron(CronExpression.EVERY_DAY_AT_5AM)
    async backup_db() {
        const dir = 'assets/files/backup';
        const file_name = `backup_salim_db.sql`;
        const filePath = `${dir}/${file_name}`;

        fs.mkdirSync(dir, { recursive: true });

        exec(this.isProductionBackupDB(filePath), async (err) => {
            if (err) {
                throw new BadRequestException(err.message);
            }

            //  TODO: success
            console.log('Successfully backup ' + filePath);
            await this.bot.telegram.sendDocument(1411561011, {
                source: './' + filePath,
            });
        });
    }
}
