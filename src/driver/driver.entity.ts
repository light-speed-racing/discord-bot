import { EntityOf } from 'src/shared';
import { Column, CreateDateColumn, Entity, PrimaryColumn, Unique, UpdateDateColumn } from 'typeorm';

@Entity('drivers')
@Unique(['steamId', 'discordId'])
export class Driver {
  constructor(data?: EntityOf<Driver>) {
    Object.assign(this, data);
  }

  @PrimaryColumn()
  steamId: string;

  @Column({ nullable: true })
  discordId?: string;

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column('integer', { nullable: true })
  preferedDriverNumber?: number;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
