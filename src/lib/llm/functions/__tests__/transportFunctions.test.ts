import { transportFunctions } from '../transportFunctions';

describe('Transport Functions', () => {
  describe('Function Definitions', () => {
    it('should export all five transport functions', () => {
      expect(transportFunctions).toHaveLength(5);
      expect(transportFunctions[0].name).toBe('findStopPlacesByName');
      expect(transportFunctions[1].name).toBe('findPlaces');
      expect(transportFunctions[2].name).toBe('findTrips');
      expect(transportFunctions[3].name).toBe('optimizeTransfers');
      expect(transportFunctions[4].name).toBe('findPlacesByLocation');
    });

    it('should have distinct descriptions for each function', () => {
      const functionNames = transportFunctions.map((f) => f.name);
      const descriptions = transportFunctions.map((f) => f.description);

      // All functions should have descriptions
      descriptions.forEach((desc) => {
        expect(desc).toBeDefined();
        expect(desc.length).toBeGreaterThan(20);
      });

      // All descriptions should be unique
      const uniqueDescriptions = new Set(descriptions);
      expect(uniqueDescriptions.size).toBe(descriptions.length);
    });

    it('should provide clear usage guidance in descriptions', () => {
      const findTripsFunc = transportFunctions.find((f) => f.name === 'findTrips');
      const findStopsFunc = transportFunctions.find((f) => f.name === 'findStopPlacesByName');

      // findTrips should mention when to use it
      expect(findTripsFunc?.description).toContain('USE THIS TOOL');
      expect(findTripsFunc?.description).toContain('TWO locations');

      // findStopPlacesByName should explain its purpose
      expect(findStopsFunc?.description).toContain('USE THIS TOOL');
    });

    it('should cross-reference related functions', () => {
      const findTripsFunc = transportFunctions.find((f) => f.name === 'findTrips');
      const findStopsFunc = transportFunctions.find((f) => f.name === 'findStopPlacesByName');

      // findTrips should reference getPlaceEvents for single-station queries
      expect(findTripsFunc?.description).toContain('getPlaceEvents');

      // findStopPlacesByName should reference getPlaceEvents
      expect(findStopsFunc?.description).toContain('getPlaceEvents');
    });
  });

  describe('findStopPlacesByName Parameter Definitions', () => {
    const findStopsFunc = transportFunctions.find((f) => f.name === 'findStopPlacesByName');

    it('should require query parameter', () => {
      expect(findStopsFunc?.parameters.required).toContain('query');
      expect(findStopsFunc?.parameters.properties.query).toBeDefined();
      expect(findStopsFunc?.parameters.properties.query.type).toBe('string');
    });

    it('should have optional limit parameter with default', () => {
      expect(findStopsFunc?.parameters.properties.limit).toBeDefined();
      expect(findStopsFunc?.parameters.properties.limit.type).toBe('number');
      expect(findStopsFunc?.parameters.properties.limit.default).toBe(10);
      expect(findStopsFunc?.parameters.required).not.toContain('limit');
    });

    it('should include station name examples in query description', () => {
      const queryDesc = findStopsFunc?.parameters.properties.query.description || '';

      // Should mention Swiss station examples
      expect(queryDesc.toLowerCase()).toContain('zürich');
      expect(queryDesc.toLowerCase()).toContain('bern');
    });
  });

  describe('findTrips Parameter Definitions', () => {
    const findTripsFunc = transportFunctions.find((f) => f.name === 'findTrips');

    it('should require origin and destination parameters', () => {
      expect(findTripsFunc?.parameters.required).toContain('origin');
      expect(findTripsFunc?.parameters.required).toContain('destination');
    });

    it('should have origin and destination as string parameters', () => {
      expect(findTripsFunc?.parameters.properties.origin).toBeDefined();
      expect(findTripsFunc?.parameters.properties.origin.type).toBe('string');
      expect(findTripsFunc?.parameters.properties.destination).toBeDefined();
      expect(findTripsFunc?.parameters.properties.destination.type).toBe('string');
    });

    it('should have optional dateTime parameter', () => {
      expect(findTripsFunc?.parameters.properties.dateTime).toBeDefined();
      expect(findTripsFunc?.parameters.properties.dateTime.type).toBe('string');
      expect(findTripsFunc?.parameters.required).not.toContain('dateTime');
    });

    it('should have limit parameter with default value', () => {
      expect(findTripsFunc?.parameters.properties.limit).toBeDefined();
      expect(findTripsFunc?.parameters.properties.limit.type).toBe('number');
      expect(findTripsFunc?.parameters.properties.limit.default).toBe(5);
    });

    it('should have responseMode parameter with valid enums', () => {
      expect(findTripsFunc?.parameters.properties.responseMode).toBeDefined();
      expect(findTripsFunc?.parameters.properties.responseMode.type).toBe('string');
      expect(findTripsFunc?.parameters.properties.responseMode.enum).toEqual([
        'standard',
        'compact',
        'detailed',
      ]);
      expect(findTripsFunc?.parameters.properties.responseMode.default).toBe('standard');
    });

    it('should mention international destinations in description', () => {
      const destDesc = findTripsFunc?.parameters.properties.destination.description || '';

      // Should mention international examples
      expect(destDesc).toContain('Milan');
      expect(destDesc).toContain('Paris');
    });
  });

  describe('optimizeTransfers Parameter Definitions', () => {
    const optimizeFunc = transportFunctions.find((f) => f.name === 'optimizeTransfers');

    it('should require hubStationId parameter', () => {
      expect(optimizeFunc?.parameters.required).toContain('hubStationId');
      expect(optimizeFunc?.parameters.properties.hubStationId).toBeDefined();
      expect(optimizeFunc?.parameters.properties.hubStationId.type).toBe('string');
    });

    it('should have optional arrivalTime and departureTime parameters', () => {
      expect(optimizeFunc?.parameters.properties.arrivalTime).toBeDefined();
      expect(optimizeFunc?.parameters.properties.arrivalTime.type).toBe('string');
      expect(optimizeFunc?.parameters.properties.departureTime).toBeDefined();
      expect(optimizeFunc?.parameters.properties.departureTime.type).toBe('string');
      expect(optimizeFunc?.parameters.required).not.toContain('arrivalTime');
      expect(optimizeFunc?.parameters.required).not.toContain('departureTime');
    });

    it('should include UIC code example in hubStationId description', () => {
      const hubDesc = optimizeFunc?.parameters.properties.hubStationId.description || '';

      // Should mention Zürich HB UIC code
      expect(hubDesc).toContain('8503000');
    });
  });

  describe('findPlacesByLocation Parameter Definitions', () => {
    const findByLocationFunc = transportFunctions.find((f) => f.name === 'findPlacesByLocation');

    it('should require latitude and longitude parameters', () => {
      expect(findByLocationFunc?.parameters.required).toContain('latitude');
      expect(findByLocationFunc?.parameters.required).toContain('longitude');
    });

    it('should have latitude and longitude as number parameters', () => {
      expect(findByLocationFunc?.parameters.properties.latitude).toBeDefined();
      expect(findByLocationFunc?.parameters.properties.latitude.type).toBe('number');
      expect(findByLocationFunc?.parameters.properties.longitude).toBeDefined();
      expect(findByLocationFunc?.parameters.properties.longitude.type).toBe('number');
    });

    it('should have radiusKm parameter with default', () => {
      expect(findByLocationFunc?.parameters.properties.radiusKm).toBeDefined();
      expect(findByLocationFunc?.parameters.properties.radiusKm.type).toBe('number');
      expect(findByLocationFunc?.parameters.properties.radiusKm.default).toBe(1);
    });

    it('should have limit parameter with default', () => {
      expect(findByLocationFunc?.parameters.properties.limit).toBeDefined();
      expect(findByLocationFunc?.parameters.properties.limit.type).toBe('number');
      expect(findByLocationFunc?.parameters.properties.limit.default).toBe(10);
    });
  });

  describe('Schema Validation', () => {
    it('should have valid Gemini function calling schema structure', () => {
      transportFunctions.forEach((func) => {
        expect(func.name).toBeDefined();
        expect(typeof func.name).toBe('string');
        expect(func.description).toBeDefined();
        expect(typeof func.description).toBe('string');
        expect(func.parameters).toBeDefined();
        expect(func.parameters.type).toBe('object');
        expect(func.parameters.properties).toBeDefined();
      });
    });

    it('should have all required parameters defined in properties', () => {
      transportFunctions.forEach((func) => {
        const required = func.parameters.required || [];
        required.forEach((reqParam) => {
          expect(func.parameters.properties[reqParam]).toBeDefined();
        });
      });
    });

    it('should have consistent parameter types across functions', () => {
      transportFunctions.forEach((func) => {
        Object.values(func.parameters.properties).forEach((prop: any) => {
          expect(prop.type).toBeDefined();
          expect(['string', 'number', 'object', 'array', 'boolean']).toContain(prop.type);
        });
      });
    });
  });

  describe('Function Selection Guidance', () => {
    it('findTrips should explicitly discourage single-station queries', () => {
      const findTripsFunc = transportFunctions.find((f) => f.name === 'findTrips');

      expect(findTripsFunc?.description).toContain('DO NOT use for single-station');
    });

    it('findStopPlacesByName should explain it returns IDs for getPlaceEvents', () => {
      const findStopsFunc = transportFunctions.find((f) => f.name === 'findStopPlacesByName');

      expect(findStopsFunc?.description.toLowerCase()).toContain('station id');
    });
  });
});
