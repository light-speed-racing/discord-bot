import { Column, Entity, JoinColumn, OneToMany, PrimaryColumn } from 'typeorm';
import { GameServer } from './game-server.entity';

@Entity({
  name: 'ogpgbhome_ip_ports',
})
export class IpPort {
  @PrimaryColumn()
  ip_id: number;

  @Column('integer')
  port: number;

  @OneToMany(() => GameServer, (t) => t.home_id)
  @JoinColumn({ name: 'home_id', referencedColumnName: 'home_id' })
  GameServer: Promise<GameServer>;

  @Column('varchar')
  home_id: string;

  @Column('varchar', { default: 0 })
  force_mod_id: 0 | 1;
}
