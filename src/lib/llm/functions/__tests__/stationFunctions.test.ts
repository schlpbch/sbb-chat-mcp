import { stationFunctions } from '../stationFunctions';

describe('Station Functions', () => {
  describe('Function Definitions', () => {
    it('should export getPlaceEvents and getTrainFormation functions', () => {
      expect(stationFunctions).toHaveLength(2);
      expect(stationFunctions[0].name).toBe('getPlaceEvents');
      expect(stationFunctions[1].name).toBe('getTrainFormation');
    });

    it('should have clear descriptions distinguishing functions', () => {
      const placeEventsFunc = stationFunctions.find((f) => f.name === 'getPlaceEvents');
      const trainFormationFunc = stationFunctions.find((f) => f.name === 'getTrainFormation');

      expect(placeEventsFunc?.description).toBeDefined();
      expect(trainFormationFunc?.description).toBeDefined();

      // getPlaceEvents should mention real-time boards
      expect(placeEventsFunc?.description.toLowerCase()).toContain('departure');
      expect(placeEventsFunc?.description.toLowerCase()).toContain('arrival');

      // getTrainFormation should mention composition
      expect(trainFormationFunc?.description.toLowerCase()).toContain('composition');
    });

    it('should reference findTrips in getPlaceEvents description', () => {
      const placeEventsFunc = stationFunctions.find((f) => f.name === 'getPlaceEvents');

      // Should guide users to use findTrips for journey planning
      expect(placeEventsFunc?.description).toContain('findTrips');
    });

    it('should reference findStopPlacesByName in getPlaceEvents workflow', () => {
      const placeEventsFunc = stationFunctions.find((f) => f.name === 'getPlaceEvents');

      // Should mention workflow with findStopPlacesByName
      expect(placeEventsFunc?.description).toContain('findStopPlacesByName');
    });
  });

  describe('getPlaceEvents Parameter Definitions', () => {
    const placeEventsFunc = stationFunctions.find((f) => f.name === 'getPlaceEvents');

    it('should require placeId parameter', () => {
      expect(placeEventsFunc?.parameters.required).toContain('placeId');
      expect(placeEventsFunc?.parameters.properties.placeId).toBeDefined();
      expect(placeEventsFunc?.parameters.properties.placeId.type).toBe('string');
    });

    it('should have eventType parameter with valid enums', () => {
      expect(placeEventsFunc?.parameters.properties.eventType).toBeDefined();
      expect(placeEventsFunc?.parameters.properties.eventType.type).toBe('string');
      expect(placeEventsFunc?.parameters.properties.eventType.enum).toEqual([
        'arrivals',
        'departures',
        'both',
      ]);
      expect(placeEventsFunc?.parameters.properties.eventType.default).toBe('departures');
    });

    it('should have optional dateTime parameter', () => {
      expect(placeEventsFunc?.parameters.properties.dateTime).toBeDefined();
      expect(placeEventsFunc?.parameters.properties.dateTime.type).toBe('string');
      expect(placeEventsFunc?.parameters.required).not.toContain('dateTime');
    });

    it('should have limit parameter with default value', () => {
      expect(placeEventsFunc?.parameters.properties.limit).toBeDefined();
      expect(placeEventsFunc?.parameters.properties.limit.type).toBe('number');
      expect(placeEventsFunc?.parameters.properties.limit.default).toBe(20);
    });

    it('should include UIC code examples in placeId description', () => {
      const placeIdDesc = placeEventsFunc?.parameters.properties.placeId.description || '';

      // Should mention example UIC codes
      expect(placeIdDesc).toContain('8507100'); // Thun
      expect(placeIdDesc).toContain('8503000'); // Zürich HB
    });
  });

  describe('getTrainFormation Parameter Definitions', () => {
    const trainFormationFunc = stationFunctions.find((f) => f.name === 'getTrainFormation');

    it('should require journeyId and stopPlaces parameters', () => {
      expect(trainFormationFunc?.parameters.required).toContain('journeyId');
      expect(trainFormationFunc?.parameters.required).toContain('stopPlaces');
    });

    it('should have journeyId as string parameter', () => {
      expect(trainFormationFunc?.parameters.properties.journeyId).toBeDefined();
      expect(trainFormationFunc?.parameters.properties.journeyId.type).toBe('string');
    });

    it('should have stopPlaces as array of strings', () => {
      expect(trainFormationFunc?.parameters.properties.stopPlaces).toBeDefined();
      expect(trainFormationFunc?.parameters.properties.stopPlaces.type).toBe('array');
      expect(trainFormationFunc?.parameters.properties.stopPlaces.items.type).toBe('string');
    });

    it('should have optional userLanguage parameter with default', () => {
      expect(trainFormationFunc?.parameters.properties.userLanguage).toBeDefined();
      expect(trainFormationFunc?.parameters.properties.userLanguage.type).toBe('string');
      expect(trainFormationFunc?.parameters.properties.userLanguage.default).toBe('en');
      expect(trainFormationFunc?.parameters.required).not.toContain('userLanguage');
    });
  });

  describe('Schema Validation', () => {
    it('should have valid Gemini function calling schema structure', () => {
      stationFunctions.forEach((func) => {
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
      stationFunctions.forEach((func) => {
        const required = func.parameters.required || [];
        required.forEach((reqParam) => {
          expect(func.parameters.properties[reqParam]).toBeDefined();
        });
      });
    });
  });
});
