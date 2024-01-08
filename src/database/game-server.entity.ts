import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Server } from './server.entity';
import { IpPort } from './ip-port.entity';

@Entity({
  name: 'ogpgbserver_homes',
})
export class GameServer {
  @PrimaryColumn()
  home_id: number;

  @Column('varchar')
  remote_server_id: number;

  @ManyToOne(() => Server, (t) => t.remote_server_id, { eager: true })
  @JoinColumn({ name: 'remote_server_id', referencedColumnName: 'remote_server_id' })
  Server: Server;

  @ManyToOne(() => IpPort, (t) => t.home_id, { eager: true })
  @JoinColumn({ name: 'home_id', referencedColumnName: 'home_id' })
  IpPort: IpPort;

  @Column('varchar')
  home_path: string;

  @Column('varchar')
  home_name: string;

  @Column('blob', {
    nullable: true,
    transformer: {
      to: (value: string) => value,
      from: (value: string) => !!value && JSON.parse(value),
    },
  })
  custom_fields: null | {
    entrylist_url?: string | undefined;
    channel_id?: string | undefined;
    role_id?: string | undefined;
  };
}
