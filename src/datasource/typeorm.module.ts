import { Global, Module } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Holiday } from '../country/entities/holiday.entity';
import { User } from '../country/entities/user.entity';

@Global()
@Module({
  imports: [],
  providers: [
    {
      provide: DataSource,
      inject: [],
      useFactory: async () => {
        try {
          const dataSource = new DataSource({
            type: 'postgres',
            host: 'postgres',
            port: 5432,
            username: 'postgres',
            password: '1234pass',
            database: 'test_task',
            synchronize: true,
            entities: [User, Holiday],
          });
          await dataSource.initialize();
          console.log('Database connected successfully');
          return dataSource;
        } catch (error) {
          console.log('Error connecting to database');
          throw error;
        }
      },
    },
  ],
  exports: [DataSource],
})
export class MyTypeOrmModule {}
