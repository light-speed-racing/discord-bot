import { EntityOf } from 'src/shared';
import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('drivers')
export class Driver {
  constructor(data?: EntityOf<Driver>) {
    Object.assign(this, data);
  }

  @PrimaryColumn({ comment: 'The discord id of the member' })
  id: string;

  @Column({ nullable: true, unique: true })
  steamId?: string;

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
