import { EntityOf } from 'src/shared';
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Hotlap } from '../hotlap/hotlap.entity';

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

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @OneToMany(() => Hotlap, (hotlap) => hotlap.driver)
  hotlaps?: Array<Hotlap>;

  @CreateDateColumn()
  createdAt: Date;
}
