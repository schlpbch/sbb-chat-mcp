import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Mock data for tourist sights
    const sights = [
      {
        id: 'matterhorn',
        title: 'Matterhorn',
        type: 'sight',
        description: 'Iconic pyramid-shaped mountain in the Swiss Alps',
        location: 'Zermatt',
        canton: 'Valais',
        coordinates: { lat: 45.9763, lon: 7.6586 },
        category: 'Natural Landmark',
        rating: 4.9,
        imageUrl: 'https://example.com/matterhorn.jpg'
      },
      {
        id: 'chapel-bridge',
        title: 'Chapel Bridge (Kapellbrücke)',
        type: 'sight',
        description: 'Historic wooden covered bridge in Lucerne',
        location: 'Lucerne',
        canton: 'Lucerne',
        coordinates: { lat: 47.0527, lon: 8.3067 },
        category: 'Historical Monument',
        rating: 4.7,
        imageUrl: 'https://example.com/chapel-bridge.jpg'
      },
      {
        id: 'rhine-falls',
        title: 'Rhine Falls',
        type: 'sight',
        description: 'Largest waterfall in Europe',
        location: 'Schaffhausen',
        canton: 'Schaffhausen',
        coordinates: { lat: 47.6779, lon: 8.6158 },
        category: 'Natural Wonder',
        rating: 4.8,
        imageUrl: 'https://example.com/rhine-falls.jpg'
      },
      {
        id: 'chillon-castle',
        title: 'Chillon Castle',
        type: 'sight',
        description: 'Medieval castle on Lake Geneva',
        location: 'Veytaux',
        canton: 'Vaud',
        coordinates: { lat: 46.4143, lon: 6.9275 },
        category: 'Historical Monument',
        rating: 4.6,
        imageUrl: 'https://example.com/chillon-castle.jpg'
      },
      {
        id: 'jungfraujoch',
        title: 'Jungfraujoch - Top of Europe',
        type: 'sight',
        description: 'High-altitude railway station and observation deck',
        location: 'Jungfrau Region',
        canton: 'Bern',
        coordinates: { lat: 46.5474, lon: 7.9851 },
        category: 'Mountain Experience',
        rating: 4.9,
        imageUrl: 'https://example.com/jungfraujoch.jpg'
      }
    ];

    return NextResponse.json({ sights }, { status: 200 });
  } catch (error) {
    console.error('Error fetching sights:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tourist sights' },
      { status: 500 }
    );
  }
}
