import { EntityOf } from 'src/shared';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('hotlaps')
export class Hotlap {
  constructor(data?: EntityOf<Hotlap>) {
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  entryListUrl: string;

  @Column()
  resultsUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
