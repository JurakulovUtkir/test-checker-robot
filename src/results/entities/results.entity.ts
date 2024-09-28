import { Test } from 'src/tests/entities/tests.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';

@Entity('results')
export class Result {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Test)
    @JoinColumn({ name: 'test_id' })
    test: Test;

    @Column({ type: 'varchar', length: 100 })
    user_chat_id: string;

    @Column({ type: 'float' })
    result: number;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;
}
