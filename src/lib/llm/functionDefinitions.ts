/**
 * Gemini Function Calling Definitions for MCP Tools
 *
 * These definitions allow Gemini to call MCP tools when needed to answer user queries.
 */

import { transportFunctions } from './functions/transportFunctions';
import { weatherFunctions } from './functions/weatherFunctions';
import { analyticsFunctions } from './functions/analyticsFunctions';
import { stationFunctions } from './functions/stationFunctions';

export const MCP_FUNCTION_DEFINITIONS = [
  ...transportFunctions,
  ...weatherFunctions,
  ...analyticsFunctions,
  ...stationFunctions,
];

export type {
  FunctionCallParams,
  FindStopPlacesParams,
  FindPlacesParams,
  FindTripsParams,
  GetWeatherParams,
  GetSnowConditionsParams,
} from './functions/types';
