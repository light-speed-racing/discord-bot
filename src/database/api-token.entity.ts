import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({
  name: 'ogpgbapi_tokens',
})
export class ApiToken {
  @PrimaryColumn()
  user_id: number;

  @Column('varchar')
  token: string;
}
