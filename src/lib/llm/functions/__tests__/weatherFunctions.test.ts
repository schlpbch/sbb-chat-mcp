import { weatherFunctions } from '../weatherFunctions';

describe('Weather Functions', () => {
  describe('Function Definitions', () => {
    it('should export both getWeather and getSnowConditions functions', () => {
      expect(weatherFunctions).toHaveLength(2);
      expect(weatherFunctions[0].name).toBe('getWeather');
      expect(weatherFunctions[1].name).toBe('getSnowConditions');
    });

    it('should have distinct descriptions for weather vs snow', () => {
      const weatherFunc = weatherFunctions.find((f) => f.name === 'getWeather');
      const snowFunc = weatherFunctions.find(
        (f) => f.name === 'getSnowConditions'
      );

      expect(weatherFunc?.description).toBeDefined();
      expect(snowFunc?.description).toBeDefined();

      // Weather should mention general conditions
      expect(weatherFunc?.description.toLowerCase()).toContain('general');
      expect(weatherFunc?.description.toLowerCase()).toContain('temperature');

      // Snow should mention ski-specific terms
      expect(snowFunc?.description.toLowerCase()).toContain('snow');
      expect(snowFunc?.description.toLowerCase()).toContain('ski');
    });

    it('should have cross-references between functions', () => {
      const weatherFunc = weatherFunctions.find((f) => f.name === 'getWeather');
      const snowFunc = weatherFunctions.find(
        (f) => f.name === 'getSnowConditions'
      );

      // Weather should reference snow function
      expect(weatherFunc?.description).toContain('getSnowConditions');

      // Snow should reference weather function
      expect(snowFunc?.description).toContain('getWeather');
    });

    it('should include ski-specific keywords in getSnowConditions', () => {
      const snowFunc = weatherFunctions.find(
        (f) => f.name === 'getSnowConditions'
      );
      const description = snowFunc?.description.toLowerCase() || '';

      const expectedKeywords = [
        'snow depth',
        'ski',
        'slope',
        'resort',
        'winter sports',
      ];

      expectedKeywords.forEach((keyword) => {
        expect(description).toContain(keyword);
      });
    });
  });

  describe('Parameter Definitions', () => {
    it('should have optional latitude and longitude for both functions', () => {
      weatherFunctions.forEach((func) => {
        expect(func.parameters.properties.latitude).toBeDefined();
        expect(func.parameters.properties.longitude).toBeDefined();
        expect(func.parameters.properties.latitude.type).toBe('number');
        expect(func.parameters.properties.longitude.type).toBe('number');
        expect(func.parameters.required).toEqual([]);
      });
    });

    it('should have locationName parameter for both functions', () => {
      weatherFunctions.forEach((func) => {
        expect(func.parameters.properties.locationName).toBeDefined();
        expect(func.parameters.properties.locationName.type).toBe('string');
      });
    });

    it('should have ski resort examples in getSnowConditions locationName', () => {
      const snowFunc = weatherFunctions.find(
        (f) => f.name === 'getSnowConditions'
      );
      const locationDesc =
        snowFunc?.parameters.properties.locationName.description || '';

      // Should mention ski resort locations
      expect(locationDesc.toLowerCase()).toContain('zermatt');
    });

    it('should have city examples in getWeather locationName', () => {
      const weatherFunc = weatherFunctions.find((f) => f.name === 'getWeather');
      const locationDesc =
        weatherFunc?.parameters.properties.locationName.description || '';

      // Should mention regular cities
      expect(locationDesc.toLowerCase()).toContain('zurich');
    });
  });

  describe('Function Selection Guidance', () => {
    it('getSnowConditions should explicitly discourage general weather use', () => {
      const snowFunc = weatherFunctions.find(
        (f) => f.name === 'getSnowConditions'
      );

      expect(snowFunc?.description).toContain('DO NOT use for general weather');
    });

    it('getWeather should explicitly discourage ski/snow use', () => {
      const weatherFunc = weatherFunctions.find((f) => f.name === 'getWeather');

      expect(weatherFunc?.description.toLowerCase()).toContain('ski');
      expect(weatherFunc?.description.toLowerCase()).toContain('snow');
    });
  });
});
