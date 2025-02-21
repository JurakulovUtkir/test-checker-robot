import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
} from 'typeorm';

@Entity('results')
export class Result {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 100 })
    user: string;

    @Column({ type: 'varchar', length: 100 })
    user_chat_id: string;

    @Column({ type: 'float' })
    result: number;

    @Column()
    test_id: number;

    @Column({ type: 'varchar', nullable: true })
    answers: string;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    region: string;
    class: string;
}
