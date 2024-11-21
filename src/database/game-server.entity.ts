import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Server } from './server.entity';
import { IpPort } from './ip-port.entity';

export type BopProvider = 'kunos' | 'lfm';
export type GameServerType = 'practice' | 'race' | 'undetermined';

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
        const json = JSON.parse(value) as CustomFields<{
          is_enabled: '1' | '0';
          live_weather: '1' | '0';
        }>;
        return {
          ...json,
          is_enabled: json.is_enabled === '1',
          live_weather: json.live_weather === '1',
        };
      },
    },
  })
  custom_fields: null | undefined | CustomFields;
}

type CustomFields<T = { is_enabled: boolean; live_weather: boolean }> = T & {
  bop_provider: BopProvider;
  channel_id?: string | undefined;
  role_id?: string | undefined;
  simgrid_id?: string | undefined;
  server_type: GameServerType;
};
