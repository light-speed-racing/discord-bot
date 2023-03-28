import { Test, TestingModule } from '@nestjs/testing';
import { HotlapService } from './hotlap.service';

describe('HotlapService', () => {
  let service: HotlapService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HotlapService],
    }).compile();

    service = module.get<HotlapService>(HotlapService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
