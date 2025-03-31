import { Module } from '@nestjs/common';
import { CountryModule } from './country/country.module';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
    CountryModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        AV_COUNTRIES_URL: Joi.string().required(),
        COUNTRY_BORDERS_URL: Joi.string().required(),
        COUNTRY_POPULATION_URL: Joi.string().required(),
        COUNTRY_FLAG_URL: Joi.string().required(),
      })
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
