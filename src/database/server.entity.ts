import { Column, Entity, JoinColumn, OneToMany, PrimaryColumn } from 'typeorm';
import { GameServer } from './game-server.entity';

@Entity({ name: 'ogpgbremote_servers' })
export class Server {
  @PrimaryColumn()
  remote_server_id: number;

  @OneToMany(() => GameServer, (t) => t.remote_server_id)
  @JoinColumn({ name: 'remote_server_id', referencedColumnName: 'remote_server_id' })
  GameServer: Promise<GameServer>;

  @Column('varchar')
  remote_server_name: string;

  @Column('varchar')
  ogp_user: string;

  @Column('varchar')
  agent_ip: string;

  @Column('integer')
  agent_port: number;

  @Column('integer')
  ftp_port: number;

  @Column('varchar')
  encryption_key: string;

  @Column('integer')
  timeout: number;

  @Column('integer')
  use_nat: 0 | 1;

  @Column('varchar')
  ftp_ip: string;

  @Column('varchar', { nullable: true })
  firewall_settings: string | null;

  @Column('varchar')
  display_public_ip: string;
}
