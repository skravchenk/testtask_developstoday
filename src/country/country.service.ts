import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
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
}
