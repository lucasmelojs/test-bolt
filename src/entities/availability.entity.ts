import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Provider } from './provider.entity';

@Entity('availability')
export class Availability {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Provider, provider => provider.availabilities)
  provider: Provider;

  @Column('date')
  availableDate: Date;

  @Column('time')
  startTime: string;

  @Column('time')
  endTime: string;

  @Column({ default: false })
  isRecurring: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}