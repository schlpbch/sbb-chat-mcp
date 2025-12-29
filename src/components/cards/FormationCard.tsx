'use client';

import { translations, type Language } from '@/lib/i18n';

interface FormationCardProps {
  data: any;
  language: Language;
}

export default function FormationCard({ data, language }: FormationCardProps) {
  const t = translations[language];
  
  // SBB API returns composition under 'composition' or directly at root
  const composition = data.composition || data;
  const trainUnits = composition.trainUnits || [];

  if (trainUnits.length === 0) {
    return (
      <article className="bg-white rounded-lg border border-gray-200 p-4 shadow-md">
        <p className="text-gray-500 text-sm">No formation data available for this journey.</p>
      </article>
    );
  }

  return (
    <article className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-md hover:shadow-lg transition-all duration-200">
      {/* Header */}
      <div className="bg-gray-800 px-4 py-2 text-white flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xl">🚆</span>
          <h3 className="font-bold text-sm">Train Composition</h3>
        </div>
        <span className="text-[10px] uppercase tracking-wider opacity-70">Live Data</span>
      </div>

      {/* Composition View */}
      <div className="p-4 bg-gray-50">
        <div className="flex flex-col space-y-6">
          {trainUnits.map((unit: any, uIdx: number) => (
            <div key={uIdx} className="relative">
              {/* Unit Label */}
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Unit {uIdx + 1}</span>
                {unit.operationalType && <span className="text-[10px] text-gray-500">{unit.operationalType}</span>}
              </div>

              {/* Wagon Row */}
              <div className="flex items-end space-x-1 overflow-x-auto pb-4 scrollbar-hide">
                {unit.wagons?.map((wagon: any, wIdx: number) => {
                  const is1st = wagon.firstClass;
                  const sector = wagon.sector || '';
                  const hasRestaurant = wagon.type?.includes('WR') || wagon.notices?.some((n: any) => n.name === 'BE' || n.name === 'WR');
                  const hasBikeSpace = wagon.notices?.some((n: any) => n.name === 'SV' || n.name === 'BK');
                  const isQuiet = wagon.notices?.some((n: any) => n.name === 'RZ');
                  const isFamily = wagon.notices?.some((n: any) => n.name === 'FA');

                  return (
                    <div key={wIdx} className="flex flex-col items-center">
                      {/* Sector Indicator */}
                      <span className="text-[10px] font-bold text-purple-600 mb-1">{sector}</span>
                      
                      {/* Wagon Shape */}
                      <div 
                        className={`w-20 h-12 bg-white border-2 rounded-md flex flex-col items-center justify-center relative shadow-sm transition-transform hover:-translate-y-1 ${
                          is1st ? 'border-yellow-400' : 'border-gray-300'
                        }`}
                        title={`${is1st ? '1st Class' : '2nd Class'} - Wagon ${wagon.number || ''}`}
                      >
                        {/* Status Bar */}
                        <div className={`absolute top-0 w-full h-1 ${is1st ? 'bg-yellow-400' : 'bg-gray-400'}`} />
                        
                        {/* Class Number */}
                        <span className={`text-lg font-black ${is1st ? 'text-yellow-600' : 'text-gray-400'}`}>
                          {is1st ? '1' : '2'}
                        </span>

                        {/* Icons */}
                        <div className="absolute bottom-1 right-1 flex space-x-0.5">
                          {hasRestaurant && <span className="text-[10px]" title="Bistro/Restaurant">🍴</span>}
                          {isQuiet && <span className="text-[10px]" title="Quiet Zone">🤫</span>}
                          {isFamily && <span className="text-[10px]" title="Family zone">🧸</span>}
                        </div>
                      </div>

                      {/* Wagon Number */}
                      <span className="text-[9px] text-gray-500 mt-1 font-medium">#{wagon.number || wIdx + 1}</span>
                    </div>
                  );
                })}
              </div>

              {/* Coupling line if not last */}
              {uIdx < trainUnits.length - 1 && (
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gray-300 rounded-full" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 py-2 border-t border-gray-100 bg-white flex items-center justify-center space-x-4 text-[9px] text-gray-400">
        <div className="flex items-center"><div className="w-2 h-2 bg-yellow-400 rounded-full mr-1"/> 1st Class</div>
        <div className="flex items-center"><div className="w-2 h-2 bg-gray-400 rounded-full mr-1"/> 2nd Class</div>
        <div className="flex items-center"><span>🍴</span> Restaurant</div>
        <div className="flex items-center"><span>🤫</span> Quiet</div>
      </div>
    </article>
  );
}
