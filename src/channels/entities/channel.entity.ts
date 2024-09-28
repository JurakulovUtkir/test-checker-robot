import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'channels' })
export class Channel {
    @PrimaryColumn()
    chat_id: string;

    @Column({ type: String })
    full_name: string;

    @Column({ type: String })
    url: string;

    @Column({ type: String })
    user_chat_id: string;
}
