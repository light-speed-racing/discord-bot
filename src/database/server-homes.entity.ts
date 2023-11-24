import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({
  name: 'ogpgbserver_homes',
})
export class ServerHomes {
  @PrimaryColumn()
  home_id: number;

  @Column('varchar')
  home_path: string;

  @Column('varchar')
  home_name: string;

  @Column('blob', {
    nullable: true,
    transformer: {
      to: (value: string) => value,
      from: (value: string) => JSON.parse(value),
    },
  })
  custom_fields: null | {
    entrylist_url?: string;
    channel_id?: string;
    role_id?: string;
  };
}
