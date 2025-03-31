import { ConflictException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Country } from './interfaces/country.interface';
import { RegisterDto } from './dto/register.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { hash } from 'argon2';
import { AddHolidayDto } from './dto/addHoliday.dto';
import { Holiday } from './entities/holiday.entity';
import { GetPopulationRequest } from './interfaces/getPopulation.request';

interface CountryFlag {
  iso2: string;
  iso3: string;
  flag: string;
}

interface HolidayApiResponse {
  name: string;
  date: string;
  [key: string]: unknown;
}

@Injectable()
export class CountryService {
  private readonly AV_COUNTRIES_URL: string;
  private readonly COUNTRY_POPULATION_URL: string;
  private readonly COUNTRY_FLAG_URL: string;
  private readonly COUNTRY_BORDERS_URL: string;
  private readonly ADD_HOLIDAY_SUBURL: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(Holiday)
    private readonly holidayRepository: Repository<Holiday>,
  ) {
    this.AV_COUNTRIES_URL = configService.get<string>('AV_COUNTRIES_URL')!;
    this.COUNTRY_POPULATION_URL = configService.get<string>(
      'COUNTRY_POPULATION_URL',
    )!;
    this.COUNTRY_FLAG_URL = configService.get<string>('COUNTRY_FLAG_URL')!;
    this.COUNTRY_BORDERS_URL = configService.get<string>(
      'COUNTRY_BORDERS_URL',
    )!;
    this.ADD_HOLIDAY_SUBURL = configService.get<string>('ADD_HOLIDAY_SUBURL')!;
  }

  async getAvailableCountries(): Promise<Country[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<Country[]>(this.AV_COUNTRIES_URL),
      );
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to fetch countries: ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  async getCountryInfo(countryCode: string): Promise<{
    borders: Country;
    populationData: GetPopulationRequest['data'][0];
    flag: string | null;
  }> {
    try {
      const getBorders = await firstValueFrom(
        this.httpService.get<Country>(
          `${this.COUNTRY_BORDERS_URL}${countryCode}`,
        ),
      );
      const borders = getBorders.data;

      const getPopulation = await firstValueFrom(
        this.httpService.get<GetPopulationRequest>(this.COUNTRY_POPULATION_URL),
      );

      const countryData = getPopulation.data.data.find(
        (country) => country.code === countryCode,
      );

      if (!countryData) {
        throw new Error(`Country with code ${countryCode} not found`);
      }

      const allFlags = await firstValueFrom(
        this.httpService.get<{ data: CountryFlag[] }>(this.COUNTRY_FLAG_URL),
      );
      const flags = allFlags.data?.data || [];
      const flag = flags.find(
        (c) => c.iso2 === countryCode || c.iso3 === countryCode,
      );
      const resultFlag = flag?.flag || null;

      return {
        borders,
        populationData: countryData,
        flag: resultFlag,
      };
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Unknown error occurred',
      );
    }
  }

  async register({ username, password }: RegisterDto): Promise<User> {
    const isUserExists = await this.usersRepository.findOne({
      where: {
        username,
      },
    });
    if (isUserExists) {
      throw new ConflictException('User already exists');
    }
    const hashedPassword = await hash(password);
    return this.usersRepository.save({ username, password: hashedPassword });
  }

  async addHoliday(
    userId: string,
    addHolidayDto: AddHolidayDto,
  ): Promise<Omit<Holiday, 'id'>[]> {
    const holidays = await firstValueFrom(
      this.httpService.get<HolidayApiResponse[]>(
        `${this.ADD_HOLIDAY_SUBURL}${addHolidayDto.year}/${addHolidayDto.countryCode}`,
      ),
    );

    const filteredHolidays = holidays.data.filter((holiday) =>
      addHolidayDto.holidays.includes(holiday.name),
    );
    const userHolidays = filteredHolidays.map((holiday) => ({
      userId,
      date: holiday.date,
      name: holiday.name,
      countryCode: addHolidayDto.countryCode,
      year: addHolidayDto.year,
      holidays: addHolidayDto.holidays,
    }));
    await this.holidayRepository.save(userHolidays);

    return userHolidays;
  }
}
