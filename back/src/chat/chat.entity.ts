import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Conversation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'simple-json' })
  messages: {
    content: string;
    sender: 'user' | 'bot' | 'file';
  }[];

  @Column()
  ownerId: string;
}
