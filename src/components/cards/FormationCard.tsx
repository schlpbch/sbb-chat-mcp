'use client';

import { translations, type Language } from '@/lib/i18n';
import CardHeader from './CardHeader';

interface FormationCardProps {
  data: any;
  language: Language;
}

export default function FormationCard({ data, language }: FormationCardProps) {
  const t = translations[language];
  
  // SBB API can return composition in many formats. Let's be robust.
  let trainUnits = [];
  
  // 1. Direct or under composition
  const comp = data.composition || data;
  if (comp.trainUnits) {
    trainUnits = comp.trainUnits;
  } 
  // 2. Under formations[key].compound_train
  else if (data.formations) {
    const keys = Object.keys(data.formations);
    if (keys.length > 0) {
      const f = data.formations[keys[0]];
      trainUnits = f.compound_train?.train_elements || 
                   f.compound_train?.trainUnits || 
                   f.compound_train?.units ||
                   [];
    }
  }

  if (trainUnits.length === 0) {
    return (
      <article className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-md">
        <p className="text-gray-500 dark:text-gray-400 text-sm">{t.formation.noData}</p>
      </article>
    );
  }

  return (
    <article className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-md hover:shadow-lg transition-all duration-200">
      <CardHeader
        icon={<span className="text-xl">🚆</span>}
        title={t.formation.title}
        subtitle={t.formation.liveData}
        color="purple"
      />

      {/* Composition View */}
      <div className="p-4 bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col space-y-6">
          {trainUnits.map((unit: any, uIdx: number) => (
            <div key={uIdx} className="relative">
              {/* Unit Label */}
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">{t.formation.unit} {uIdx + 1}</span>
                {unit.operationalType && <span className="text-[10px] text-gray-500 dark:text-gray-400">{unit.operationalType}</span>}
              </div>

              {/* Wagon Row */}
              <div className="flex items-end space-x-1 overflow-x-auto pb-4 scrollbar-hide">
                {(unit.wagons || unit.train_elements || unit.elements || [])?.map((wagon: any, wIdx: number) => {
                  const is1st = wagon.firstClass === true || wagon.class === '1' || wagon.class === 1;
                  const sector = wagon.sector || wagon.platform_sector || '';
                  const hasRestaurant = wagon.type?.includes('WR') || wagon.notices?.some((n: any) => n.name === 'BE' || n.name === 'WR');
                  const isQuiet = wagon.notices?.some((n: any) => n.name === 'RZ');
                  const isFamily = wagon.notices?.some((n: any) => n.name === 'FA');

                  return (
                    <div key={wIdx} className="flex flex-col items-center">
                      {/* Sector Indicator */}
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-1">{sector}</span>

                      {/* Wagon Shape */}
                      <div
                        className={`w-24 h-14 bg-white dark:bg-gray-800 border-2 rounded-md flex flex-col items-center justify-center relative shadow-sm transition-transform hover:-translate-y-1 ${
                          is1st ? 'border-yellow-400 dark:border-yellow-500' : 'border-gray-200 dark:border-gray-600'
                        }`}
                        title={`${is1st ? t.formation.firstClass : t.formation.secondClass} - ${t.formation.wagon} ${wagon.number || ''}`}
                      >
                        {/* Status Bar */}
                        <div className={`absolute top-0 w-full h-1.5 ${is1st ? 'bg-yellow-400 dark:bg-yellow-500' : 'bg-gray-400 dark:bg-gray-600'}`} />

                        {/* Class Number */}
                        <span className={`text-xl font-black ${is1st ? 'text-yellow-600 dark:text-yellow-500' : 'text-gray-300 dark:text-gray-500'}`}>
                          {is1st ? '1' : '2'}
                        </span>

                        {/* Icons */}
                        <div className="absolute bottom-1 right-1 flex space-x-0.5">
                          {hasRestaurant && <span className="text-[10px]" title={t.formation.bistro}>🍴</span>}
                          {isQuiet && <span className="text-[10px]" title={t.formation.quietZone}>🤫</span>}
                          {isFamily && <span className="text-[10px]" title={t.formation.familyZone}>🧸</span>}
                        </div>
                      </div>

                      {/* Wagon Number */}
                      <span className="text-[9px] text-gray-500 dark:text-gray-400 mt-1 font-medium">#{wagon.number || wIdx + 1}</span>
                    </div>
                  );
                })}
              </div>

              {/* Coupling line if not last */}
              {uIdx < trainUnits.length - 1 && (
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-center space-x-4 text-[10px] text-gray-500 dark:text-gray-400">
        <div className="flex items-center"><div className="w-2 h-2 bg-yellow-400 dark:bg-yellow-500 rounded-full mr-1"/> {t.formation.firstClass}</div>
        <div className="flex items-center"><div className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full mr-1"/> {t.formation.secondClass}</div>
        <div className="flex items-center"><span>🍴</span> {t.formation.restaurant}</div>
        <div className="flex items-center"><span>🤫</span> {t.formation.quietZone}</div>
      </div>
    </article>
  );
}
