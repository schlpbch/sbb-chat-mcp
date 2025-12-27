/**
 * Type definitions for function call parameters
 */

export interface FindStopPlacesParams {
  query: string;
  limit?: number;
}

export interface FindPlacesParams {
  query: string;
  limit?: number;
}

export interface FindTripsParams {
  origin: string;
  destination: string;
  dateTime?: string;
  limit?: number;
}

export interface GetWeatherParams {
  latitude: number;
  longitude: number;
  locationName?: string;
}

export interface GetSnowConditionsParams {
  latitude: number;
  longitude: number;
  locationName?: string;
}

export type FunctionCallParams =
  | FindStopPlacesParams
  | FindPlacesParams
  | FindTripsParams
  | GetWeatherParams
  | GetSnowConditionsParams;
