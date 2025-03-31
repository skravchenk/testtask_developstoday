import { Module } from '@nestjs/common';
import { CountryController } from './country.controller';
import { CountryService } from './country.service';
import { HttpModule } from '@nestjs/axios';
import { MyTypeOrmModule } from '../datasource/typeorm.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Holiday } from './entities/holiday.entity';

@Module({
  imports: [
    HttpModule,
    MyTypeOrmModule,
    TypeOrmModule.forFeature([User, Holiday]),
  ],
  controllers: [CountryController],
  providers: [CountryService],
})
export class CountryModule {}
