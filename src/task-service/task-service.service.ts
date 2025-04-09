import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectBot } from 'nestjs-telegraf';
import { Context } from 'src/bot/context/context';
import { Telegraf } from 'telegraf';
import * as fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as dotenv from 'dotenv';

dotenv.config();
const execPromise = promisify(exec);

@Injectable()
export class TaskServiceService {
    constructor(@InjectBot('bot') private readonly bot: Telegraf<Context>) {}

    private getBackupCommand(filePath: string): string {
        const host = process.env.DB_HOST || 'test-bot-postgres'; // Change 'db' to your PostgreSQL service name in Docker
        const user = process.env.DB_USER || 'test';
        const db = process.env.DB_NAME || 'test';

        return `PGPASSWORD="${process.env.DB_PASSWORD}" pg_dump -h ${host} -U ${user} -d ${db} -c > ${filePath}`;
    }

    @Cron(CronExpression.EVERY_DAY_AT_5AM)
    async backup_db() {
        const dir = '/app/assets/files/backup';
        const file_name = `backup_test_db_${
            new Date().toISOString().split('T')[0]
        }`;
        const sqlPath = `${dir}/${file_name}.sql`;
        const tarPath = `${dir}/${file_name}.tar.gz`;

        try {
            fs.mkdirSync(dir, { recursive: true });

            await execPromise(this.getBackupCommand(sqlPath), {
                env: { ...process.env }, // Ensure environment variables are available
            });

            // Create tar.gz archive
            await execPromise(`tar -czf ${tarPath} -C ${dir} ${file_name}.sql`);

            // Send the tar file
            await this.bot.telegram.sendDocument(1411561011, {
                source: tarPath,
                filename: `${file_name}.tar.gz`,
            });

            // Clean up files
            fs.unlinkSync(sqlPath);
            fs.unlinkSync(tarPath);
        } catch (error) {
            console.error('Backup process failed:', error);
            await this.bot.telegram.sendMessage(
                1411561011,
                `Database backup failed: ${error.message}`,
            );
        }
    }
}
