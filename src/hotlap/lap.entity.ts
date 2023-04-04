import { Driver } from 'src/driver/driver.entity';
import { EntityOf } from 'src/shared';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Hotlap } from './hotlap.entity';
import { LapJsonEntity } from './lap-json-entity.object';

@Entity('laps')
export class Lap {
  constructor(data?: EntityOf<Lap>) {
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  car: number;

  @Column()
  carGroup: string;

  @Column('jsonb')
  times: {
    laptime: number;
    splits: Array<number>;
  };

  @ManyToOne(() => Hotlap, (hotlap) => hotlap.laps)
  hotlap: Promise<Hotlap>;

  @ManyToOne(() => Driver, (driver) => driver.laps)
  driver: Promise<Driver>;

  @Column('jsonb', { nullable: true })
  entity?: LapJsonEntity;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
