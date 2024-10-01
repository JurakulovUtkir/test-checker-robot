import { Result } from 'src/results/entities/results.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
} from 'typeorm';

@Entity('tests')
export class Test {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255, nullable: true })
    name?: string;

    @Column({ type: 'varchar', length: 100 })
    owner_chat_id: string;

    @Column({ default: true })
    is_active: boolean;

    @Column({ type: 'text', nullable: true })
    answers: string;

    @Column({ type: 'int', default: 0 })
    checked_count: number;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;
}
