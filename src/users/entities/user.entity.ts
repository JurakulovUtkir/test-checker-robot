import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'users' })
export class User {
    @PrimaryColumn({ generated: 'uuid' })
    id: string;

    @Column({ type: String, nullable: true })
    full_name?: string;

    @Column({ type: String, unique: true })
    chat_id: string;

    @Column({ type: String })
    role: string;

    @Column({ type: 'varchar' })
    status: string;

    @Column({ type: 'varchar', nullable: true })
    region: string;

    @Column({ type: 'varchar', nullable: true })
    class: string;
}
