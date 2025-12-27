'use client';

interface EcoCardProps {
 data: {
 route?: string;
 trainCO2?: number;
 carCO2?: number;
 planeCO2?: number;
 savings?: number;
 treesEquivalent?: number;
 };
}

export default function EcoCard({ data }: EcoCardProps) {
 const { route, trainCO2, carCO2, planeCO2, savings, treesEquivalent } = data;

 const formatCO2 = (value?: number) => {
 if (value === undefined) return '--';
 return value.toFixed(1);
 };

 return (
 <article
 className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 hover:border-green-500:border-green-500"
 data-testid="eco-card"
 aria-label="Environmental impact comparison"
 >
 {/* Compact Header */}
 <div className="bg-linear-to-r from-green-600 to-emerald-600 px-4 py-2">
 <div className="flex items-center space-x-2 text-white">
 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 <div>
 <h3 className="text-lg font-bold">Eco Impact</h3>
 <p className="text-xs text-green-100 truncate">{route || 'Your Journey'}</p>
 </div>
 </div>
 </div>

 {/* Compact Content */}
 <div className="p-3 space-y-3">
 {/* CO2 Comparison - Compact */}
 <div>
 <p className="text-xs font-semibold text-gray-700 mb-2">
 CO₂ Emissions (kg)
 </p>
 <div className="space-y-2">
 {/* Train */}
 <div className="flex items-center space-x-2">
 <span className="text-lg">🚂</span>
 <div className="flex-1">
 <div className="flex items-center justify-between mb-0.5">
 <span className="text-xs font-medium text-gray-700">Train</span>
 <span className="text-sm font-bold text-green-600">
 {formatCO2(trainCO2)}
 </span>
 </div>
 <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
 <div className="h-full bg-green-600" style={{ width: '20%' }}></div>
 </div>
 </div>
 </div>

 {/* Car */}
 {carCO2 !== undefined && (
 <div className="flex items-center space-x-2">
 <span className="text-lg">🚗</span>
 <div className="flex-1">
 <div className="flex items-center justify-between mb-0.5">
 <span className="text-xs font-medium text-gray-700">Car</span>
 <span className="text-sm font-bold text-orange-600">
 {formatCO2(carCO2)}
 </span>
 </div>
 <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
 <div className="h-full bg-orange-600" style={{ width: `${Math.min((carCO2 / (planeCO2 || carCO2)) * 100, 100)}%` }}></div>
 </div>
 </div>
 </div>
 )}

 {/* Plane */}
 {planeCO2 !== undefined && (
 <div className="flex items-center space-x-2">
 <span className="text-lg">✈️</span>
 <div className="flex-1">
 <div className="flex items-center justify-between mb-0.5">
 <span className="text-xs font-medium text-gray-700">Plane</span>
 <span className="text-sm font-bold text-red-600">
 {formatCO2(planeCO2)}
 </span>
 </div>
 <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
 <div className="h-full bg-red-600" style={{ width: '100%' }}></div>
 </div>
 </div>
 </div>
 )}
 </div>
 </div>

 {/* Savings Highlight - Compact */}
 {savings !== undefined && savings > 0 && (
 <div className="bg-green-50 border border-green-200 rounded-lg p-2">
 <div className="flex items-center space-x-2">
 <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center shrink-0">
 <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
 </svg>
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-xs font-semibold text-green-800">
 Saving {formatCO2(savings)} kg CO₂
 </p>
 <p className="text-xs text-green-700">
 vs. car
 </p>
 </div>
 </div>
 </div>
 )}

 {/* Trees Equivalent - Compact */}
 {treesEquivalent !== undefined && treesEquivalent > 0 && (
 <div className="flex items-center justify-center space-x-2 p-2 bg-gray-50 rounded-lg">
 <span className="text-2xl">🌳</span>
 <div>
 <p className="text-xs text-gray-600">Equivalent to</p>
 <p className="text-sm font-bold text-gray-900">
 {treesEquivalent.toFixed(1)} trees/year
 </p>
 </div>
 </div>
 )}
 </div>
 </article>
 );
}
