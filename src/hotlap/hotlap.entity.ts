import { EntityOf } from 'src/shared';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Driver } from './driver.entity';

@Entity('hotlaps')
export class Hotlap {
  constructor(data?: EntityOf<Hotlap>) {
    Object.assign(this, data ?? {});
  }

  @PrimaryGeneratedColumn('increment')
  id: string;

  @Column()
  track: string;

  @Column({ array: true, type: 'simple-array' })
  laptimes: Array<string>;

  @Column()
  driverId: string;

  @ManyToOne(() => Driver, (driver) => driver.hotlaps)
  driver: Driver;

  @CreateDateColumn()
  createdAt: Date;
}
