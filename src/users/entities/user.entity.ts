import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'users' })
export class User {
    @PrimaryColumn({ generated: 'uuid' })
    id: string;

    @Column({ type: String })
    full_name: string;

    @Column({ type: String, unique: true })
    chat_id: string;

    @Column({ type: String })
    role: string;

    @Column({ type: 'varchar' })
    status: string;
}
