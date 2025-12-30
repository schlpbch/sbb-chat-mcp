export default function FeaturesSection() {
  const features = [
    {
      icon: '🚂',
      title: 'Journey Planning',
      description: 'Real-time train connections across Switzerland and beyond',
    },
    {
      icon: '🌤️',
      title: 'Weather & Snow',
      description: 'Current weather and ski conditions for your destination',
    },
    {
      icon: '🌍',
      title: 'Multilingual',
      description: 'Available in English, German, French, and Italian',
    },
    {
      icon: '♿',
      title: 'Accessible',
      description: 'Wheelchair-accessible routes and accessibility information',
    },
  ];

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">
          Everything You Need
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, i) => (
            <div key={i} className="text-center">
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
