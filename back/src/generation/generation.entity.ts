import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Generation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  conversation: string;

  @Column({ nullable: true })
  count?: number;

  @Column()
  isGenerating: boolean;
}
