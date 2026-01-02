import { analyticsFunctions } from '../analyticsFunctions';

describe('Analytics Functions', () => {
  describe('Function Definitions', () => {
    it('should export all three analytics functions', () => {
      expect(analyticsFunctions).toHaveLength(3);
      expect(analyticsFunctions[0].name).toBe('getEcoComparison');
      expect(analyticsFunctions[1].name).toBe('compareRoutes');
      expect(analyticsFunctions[2].name).toBe('journeyRanking');
    });

    it('should have distinct descriptions for each function', () => {
      const descriptions = analyticsFunctions.map((f) => f.description);

      // All functions should have descriptions
      descriptions.forEach((desc) => {
        expect(desc).toBeDefined();
        expect(desc.length).toBeGreaterThan(20);
      });

      // All descriptions should be unique
      const uniqueDescriptions = new Set(descriptions);
      expect(uniqueDescriptions.size).toBe(descriptions.length);
    });

    it('should clearly identify comparison and ranking purposes', () => {
      const ecoFunc = analyticsFunctions.find((f) => f.name === 'getEcoComparison');
      const compareFunc = analyticsFunctions.find((f) => f.name === 'compareRoutes');
      const rankFunc = analyticsFunctions.find((f) => f.name === 'journeyRanking');

      // getEcoComparison should mention environmental impact
      expect(ecoFunc?.description.toLowerCase()).toContain('environmental');
      expect(ecoFunc?.description.toLowerCase()).toContain('impact');

      // compareRoutes should mention comparison criteria
      expect(compareFunc?.description.toLowerCase()).toContain('compare');
      expect(compareFunc?.description.toLowerCase()).toContain('rank');

      // journeyRanking should mention scoring
      expect(rankFunc?.description.toLowerCase()).toContain('rank');
      expect(rankFunc?.description.toLowerCase()).toContain('score');
    });

    it('should provide usage guidance for compareRoutes', () => {
      const compareFunc = analyticsFunctions.find((f) => f.name === 'compareRoutes');

      // Should mention when to use it
      expect(compareFunc?.description).toContain('USE THIS TOOL');
      // Should guide away from simple queries
      expect(compareFunc?.description).toContain('DO NOT use for simple');
    });
  });

  describe('getEcoComparison Parameter Definitions', () => {
    const ecoFunc = analyticsFunctions.find((f) => f.name === 'getEcoComparison');

    it('should require tripId parameter', () => {
      expect(ecoFunc?.parameters.required).toContain('tripId');
      expect(ecoFunc?.parameters.properties.tripId).toBeDefined();
      expect(ecoFunc?.parameters.properties.tripId.type).toBe('string');
    });

    it('should have optional userLanguage parameter with default', () => {
      expect(ecoFunc?.parameters.properties.userLanguage).toBeDefined();
      expect(ecoFunc?.parameters.properties.userLanguage.type).toBe('string');
      expect(ecoFunc?.parameters.properties.userLanguage.default).toBe('en');
      expect(ecoFunc?.parameters.required).not.toContain('userLanguage');
    });

    it('should reference findTrips in tripId description', () => {
      const tripIdDesc = ecoFunc?.parameters.properties.tripId.description || '';

      // Should explain where to get tripId from
      expect(tripIdDesc).toContain('findTrips');
      expect(tripIdDesc).toContain('Trip::id');
    });
  });

  describe('compareRoutes Parameter Definitions', () => {
    const compareFunc = analyticsFunctions.find((f) => f.name === 'compareRoutes');

    it('should require origin, destination, and criteria parameters', () => {
      expect(compareFunc?.parameters.required).toContain('origin');
      expect(compareFunc?.parameters.required).toContain('destination');
      expect(compareFunc?.parameters.required).toContain('criteria');
    });

    it('should have origin and destination as string parameters', () => {
      expect(compareFunc?.parameters.properties.origin).toBeDefined();
      expect(compareFunc?.parameters.properties.origin.type).toBe('string');
      expect(compareFunc?.parameters.properties.destination).toBeDefined();
      expect(compareFunc?.parameters.properties.destination.type).toBe('string');
    });

    it('should have criteria parameter with valid enums', () => {
      expect(compareFunc?.parameters.properties.criteria).toBeDefined();
      expect(compareFunc?.parameters.properties.criteria.type).toBe('string');
      expect(compareFunc?.parameters.properties.criteria.enum).toEqual([
        'fastest',
        'fewest_changes',
        'earliest_arrival',
        'balanced',
      ]);
      expect(compareFunc?.parameters.properties.criteria.default).toBe('fastest');
    });

    it('should have optional departureTime parameter', () => {
      expect(compareFunc?.parameters.properties.departureTime).toBeDefined();
      expect(compareFunc?.parameters.properties.departureTime.type).toBe('string');
      expect(compareFunc?.parameters.required).not.toContain('departureTime');
    });

    it('should have description for criteria parameter', () => {
      const criteriaDesc = compareFunc?.parameters.properties.criteria.description || '';

      // Should have a description
      expect(criteriaDesc).toBeDefined();
      expect(criteriaDesc.length).toBeGreaterThan(5);
    });
  });

  describe('journeyRanking Parameter Definitions', () => {
    const rankFunc = analyticsFunctions.find((f) => f.name === 'journeyRanking');

    it('should require from and to parameters', () => {
      expect(rankFunc?.parameters.required).toContain('from');
      expect(rankFunc?.parameters.required).toContain('to');
    });

    it('should have from and to as string parameters', () => {
      expect(rankFunc?.parameters.properties.from).toBeDefined();
      expect(rankFunc?.parameters.properties.from.type).toBe('string');
      expect(rankFunc?.parameters.properties.to).toBeDefined();
      expect(rankFunc?.parameters.properties.to.type).toBe('string');
    });

    it('should have optional preferences parameter as object', () => {
      expect(rankFunc?.parameters.properties.preferences).toBeDefined();
      expect(rankFunc?.parameters.properties.preferences.type).toBe('object');
      expect(rankFunc?.parameters.required).not.toContain('preferences');
    });

    it('should describe ranking preferences in preferences parameter', () => {
      const prefDesc = rankFunc?.parameters.properties.preferences.description || '';

      // Should mention ranking criteria
      expect(prefDesc.toLowerCase()).toContain('speed');
      expect(prefDesc.toLowerCase()).toContain('price');
      expect(prefDesc.toLowerCase()).toContain('comfort');
      expect(prefDesc.toLowerCase()).toContain('eco');
    });
  });

  describe('Schema Validation', () => {
    it('should have valid Gemini function calling schema structure', () => {
      analyticsFunctions.forEach((func) => {
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
      analyticsFunctions.forEach((func) => {
        const required = func.parameters.required || [];
        required.forEach((reqParam) => {
          expect(func.parameters.properties[reqParam]).toBeDefined();
        });
      });
    });

    it('should have consistent parameter types', () => {
      analyticsFunctions.forEach((func) => {
        Object.values(func.parameters.properties).forEach((prop: any) => {
          expect(prop.type).toBeDefined();
          expect(['string', 'number', 'object', 'array', 'boolean']).toContain(prop.type);
        });
      });
    });
  });

  describe('Function Relationships', () => {
    it('getEcoComparison should reference findTrips for getting tripId', () => {
      const ecoFunc = analyticsFunctions.find((f) => f.name === 'getEcoComparison');

      expect(ecoFunc?.description).toContain('findTrips');
    });

    it('compareRoutes should reference findTrips for simple queries', () => {
      const compareFunc = analyticsFunctions.find((f) => f.name === 'compareRoutes');

      expect(compareFunc?.description).toContain('findTrips');
    });

    it('all functions should have language support where applicable', () => {
      const ecoFunc = analyticsFunctions.find((f) => f.name === 'getEcoComparison');

      // getEcoComparison should have userLanguage
      expect(ecoFunc?.parameters.properties.userLanguage).toBeDefined();

      // Language should support de, fr, it, en
      const langDesc = ecoFunc?.parameters.properties.userLanguage.description || '';
      expect(langDesc).toContain('de');
      expect(langDesc).toContain('fr');
      expect(langDesc).toContain('it');
      expect(langDesc).toContain('en');
    });
  });
});
