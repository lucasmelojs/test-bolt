import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Tenant } from './tenant.entity';
import { Client } from './client.entity';
import { Provider } from './provider.entity';

export enum UserRole {
  ADMIN = 'admin',
  CLIENT = 'client',
  PROVIDER = 'provider'
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  phone: string;

  @Column({
    type: 'text',
    transformer: {
      to: (value: string) => value,
      from: (value: string) => value
    }
  })
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CLIENT
  })
  role: UserRole;

  @ManyToOne(() => Tenant, tenant => tenant.users)
  tenant: Tenant;

  @OneToOne(() => Client, client => client.user)
  client: Client;

  @OneToOne(() => Provider, provider => provider.user)
  provider: Provider;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  deletedAt?: Date;
}