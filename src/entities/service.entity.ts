import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Provider } from './provider.entity';
import { Appointment } from './appointment.entity';

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('int')
  duration: number;

  @Column('decimal', { precision: 5, scale: 2 })
  providerCommission: number;

  @ManyToOne(() => Provider, provider => provider.services)
  provider: Provider;

  @OneToMany(() => Appointment, appointment => appointment.service)
  appointments: Appointment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  deletedAt?: Date;
}