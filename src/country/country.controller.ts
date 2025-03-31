import { Controller, Get } from '@nestjs/common';
import { CountryService } from './country.service';
import { Country } from './interfaces/country.interface';

@Controller()
export class CountryController {
  constructor(private readonly countryService: CountryService) {}

  @Get('availableCountries')
  getAvailableCountries(): Promise<Country[]> {
    return this.countryService.getAvailableCountries();
  }
}
