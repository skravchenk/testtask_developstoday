import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CountryService } from './country.service';
import { Country } from './interfaces/country.interface';
import { RegisterDto } from './dto/register.dto';
import { AddHolidayDto } from './dto/addHoliday.dto';

@Controller()
export class CountryController {
  constructor(private readonly countryService: CountryService) {}

  @Get('availableCountries')
  getAvailableCountries(): Promise<Country[]> {
    return this.countryService.getAvailableCountries();
  }

  @Get('info/:countryCode')
  info(@Param('countryCode') countryCode: string) {
    return this.countryService.getCountryInfo(countryCode);
  }

  @Post('/users/:userId/calendar/holidays')
  addHoliday(
    @Param('userId') userId: string,
    @Body() addHolidayDto: AddHolidayDto,
  ) {
    return this.countryService.addHoliday(userId, addHolidayDto);
  }

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.countryService.register(registerDto);
  }
}
