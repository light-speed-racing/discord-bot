import { OgpCustomFieldsDto } from 'src/webhook/ogp-custom-fields.dto';
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
  custom_fields: null | OgpCustomFieldsDto;
}
