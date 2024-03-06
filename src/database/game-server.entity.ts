import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Server } from './server.entity';
import { IpPort } from './ip-port.entity';

export type BopProvider = 'kunos' | 'lfm';

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
      from: (value: string) => {
        if (!value) {
          return;
        }
        const json = JSON.parse(value);

        return {
          ...json,
          is_enabled: json.is_enabled === '1' ? true : false,
        };
      },
    },
  })
  custom_fields: null | {
    is_enabled: boolean;
    bop_provider: BopProvider;
    channel_id?: string | undefined;
    role_id?: string | undefined;
    simgrid_id?: number | undefined;
  };
}
