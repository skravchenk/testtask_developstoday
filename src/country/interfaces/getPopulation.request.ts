export interface GetPopulationRequest {
  error: boolean;
  msg: string;
  data: Array<{
    country: string;
    code: string;
    iso3: string;
    populationCounts: Array<{ year: number; value: number }>;
  }>;
}
