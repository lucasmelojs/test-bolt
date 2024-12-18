import { Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Service } from './service.entity';
import { Appointment } from './appointment.entity';
import { Availability } from './availability.entity';

export enum CommissionType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed'
}

@Entity('providers')
export class Provider {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @Column({
    type: 'enum',
    enum: CommissionType,
    default: CommissionType.PERCENTAGE
  })
  commissionType: CommissionType;

  @Column('decimal', { precision: 5, scale: 2 })
  defaultCommission: number;

  @OneToMany(() => Service, service => service.provider)
  services: Service[];

  @OneToMany(() => Appointment, appointment => appointment.provider)
  appointments: Appointment[];

  @OneToMany(() => Availability, availability => availability.provider)
  availabilities: Availability[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  deletedAt?: Date;
}