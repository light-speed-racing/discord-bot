import { EntityOf } from 'src/shared';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Hotlap } from './hotlap.entity';

@Entity('drivers')
export class Driver {
  constructor(data?: EntityOf<Driver>) {
    Object.assign(this, data ?? {});
  }

  @PrimaryGeneratedColumn('increment')
  id: string;

  @Column()
  steamId: string;

  @Column({ nullable: true })
  discordId?: string;

  @OneToMany(() => Hotlap, (hotlap) => hotlap.driver)
  hotlaps: Array<Hotlap>;

  @CreateDateColumn()
  createdAt: Date;
}
