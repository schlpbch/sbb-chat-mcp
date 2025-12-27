import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Mock data for alpine resorts
    const resorts = [
      {
        id: 'zermatt',
        title: 'Zermatt',
        type: 'resort',
        description: 'World-famous ski resort at the foot of the Matterhorn',
        canton: 'Valais',
        elevation: 1620,
        skiArea: {
          slopes: 360,
          lifts: 54,
          topElevation: 3883,
          difficulty: {
            easy: 75,
            intermediate: 220,
            advanced: 65
          }
        },
        season: {
          winter: 'Nov - Apr',
          summer: 'Jun - Sep'
        },
        features: ['Glacier skiing', 'Car-free village', 'Matterhorn views'],
        rating: 4.9,
        coordinates: { lat: 46.0207, lon: 7.7491 }
      },
      {
        id: 'st-moritz',
        title: 'St. Moritz',
        type: 'resort',
        description: 'Luxury alpine resort in the Engadin valley',
        canton: 'Graubünden',
        elevation: 1856,
        skiArea: {
          slopes: 350,
          lifts: 56,
          topElevation: 3303,
          difficulty: {
            easy: 90,
            intermediate: 200,
            advanced: 60
          }
        },
        season: {
          winter: 'Nov - Apr',
          summer: 'Jun - Sep'
        },
        features: ['Luxury hotels', 'Olympic heritage', 'Champagne climate'],
        rating: 4.8,
        coordinates: { lat: 46.4908, lon: 9.8355 }
      },
      {
        id: 'verbier',
        title: 'Verbier',
        type: 'resort',
        description: 'Premier freeride destination in the 4 Vallées',
        canton: 'Valais',
        elevation: 1500,
        skiArea: {
          slopes: 410,
          lifts: 82,
          topElevation: 3330,
          difficulty: {
            easy: 100,
            intermediate: 210,
            advanced: 100
          }
        },
        season: {
          winter: 'Dec - Apr',
          summer: 'Jul - Aug'
        },
        features: ['Off-piste skiing', 'Vibrant nightlife', 'Mont Fort glacier'],
        rating: 4.7,
        coordinates: { lat: 46.0964, lon: 7.2281 }
      },
      {
        id: 'davos',
        title: 'Davos',
        type: 'resort',
        description: 'Largest resort town in the Alps',
        canton: 'Graubünden',
        elevation: 1560,
        skiArea: {
          slopes: 300,
          lifts: 53,
          topElevation: 2844,
          difficulty: {
            easy: 110,
            intermediate: 150,
            advanced: 40
          }
        },
        season: {
          winter: 'Nov - Apr',
          summer: 'Jun - Sep'
        },
        features: ['Family-friendly', 'WEF host', 'Parsenn ski area'],
        rating: 4.6,
        coordinates: { lat: 46.8008, lon: 9.8367 }
      },
      {
        id: 'grindelwald',
        title: 'Grindelwald',
        type: 'resort',
        description: 'Gateway to the Jungfrau region',
        canton: 'Bern',
        elevation: 1034,
        skiArea: {
          slopes: 160,
          lifts: 30,
          topElevation: 2971,
          difficulty: {
            easy: 50,
            intermediate: 80,
            advanced: 30
          }
        },
        season: {
          winter: 'Dec - Apr',
          summer: 'Jun - Sep'
        },
        features: ['Eiger North Face views', 'First Cliff Walk', 'Jungfraujoch access'],
        rating: 4.7,
        coordinates: { lat: 46.6244, lon: 8.0411 }
      }
    ];

    return NextResponse.json({ 
      alpine_resorts_guide_enhanced: {
        resorts,
        metadata: {
          totalResorts: resorts.length,
          lastUpdated: new Date().toISOString(),
          source: 'Swiss Tourism Board'
        }
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching resorts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alpine resorts' },
      { status: 500 }
    );
  }
}
