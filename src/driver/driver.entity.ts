import { EntityOf } from 'src/shared';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('drivers')
export class Driver {
  constructor(data?: EntityOf<Driver>) {
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  steamId: string;

  @Column({ nullable: true })
  discordId?: string;

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
