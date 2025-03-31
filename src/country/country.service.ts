import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, NotFoundError } from 'rxjs';
import { Country } from './interfaces/country.interface';

@Injectable()
export class CountryService {
  private readonly apiUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiUrl = configService.get<string>(
      'AV_COUNTRIES_URL',
      'https://date.nager.at/api/v3/AvailableCountries',
    );
  }

  async getAvailableCountries(): Promise<Country[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<Country[]>(this.apiUrl),
      );
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to fetch countries: ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  async getCountryInfo(countryCode: string) {
    try {
      const getBorders = await firstValueFrom(
        this.httpService.get<Country>(
          `https://date.nager.at/api/v3/CountryInfo/${countryCode}`,
        ),
      );
      const borders = getBorders.data;
      //_________________________________________________________________

      const getPopulation = await firstValueFrom(
        this.httpService.get<{
          error: boolean;
          msg: string;
          data: Array<{
            country: string;
            code: string;
            iso3: string;
            populationCounts: Array<{ year: number; value: number }>;
          }>;
        }>('https://countriesnow.space/api/v0.1/countries/population'),
      );

      const countryData = getPopulation.data.data.find(
        (country) => country.code === countryCode,
      );

      if (!countryData) {
        throw new NotFoundError(`Country with code ${countryCode} not found`);
      }

      const allFlags = await firstValueFrom(
        this.httpService.get(
          'https://countriesnow.space/api/v0.1/countries/flag/images',
        ),
      );
      const flags = allFlags.data?.data || [];
      const flag = flags.find((c) => c.iso2 === countryCode || c.iso3 === countryCode);
      const resultFlag = flag?.flag || null;

      return {
        borders,
        populationData: countryData,
        flag: resultFlag,
      };
    } catch (error) {
      throw new Error();
    }
  }
}
