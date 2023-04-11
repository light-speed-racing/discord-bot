import { EntityOf } from 'src/shared';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Lap } from './lap.entity';

@Entity('hotlaps')
export class Hotlap {
  constructor(data?: EntityOf<Hotlap>) {
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  title: string;

  @Column()
  track: string;

  @Column({ nullable: true })
  entrylistUrl?: string;

  @Column('jsonb', { nullable: true })
  openGamePanelData?: {
    url: string;
    token: string;
    ip: string;
    port: string;
    path: string;
  };

  @OneToMany(() => Lap, (laps) => laps.hotlap)
  laps: Promise<Array<Lap>>;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true, type: 'timestamp with time zone' })
  deletedAt?: Date;
}
