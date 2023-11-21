import { Injectable } from '@nestjs/common';
import { OgpCustomFieldsDto } from './ogp-custom-fields.dto';

@Injectable()
export class CustomFieldsService {
  async for(homedir: string): Promise<OgpCustomFieldsDto> {
    console.log(homedir);

    return {
      // @TODO: This should call the database and return the entity
      entrylistUrl: 'https://www.thesimgrid.com/admin/championships/5245/registrations.json',
    };
  }
}
