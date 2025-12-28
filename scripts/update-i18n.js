#!/usr/bin/env node

/**
 * Automated i18n Component Updater
 * This script applies the remaining i18n updates to components
 */

const fs = require('fs');
const path = require('path');

const updates = {
  'src/components/cards/EcoCard.tsx': [
    {
      search: /^interface EcoCardProps \{$/m,
      replace: `import type { Language } from '@/lib/i18n';\nimport { translations } from '@/lib/i18n';\n\ninterface EcoCardProps {`,
      description: 'Add imports'
    },
    {
      search: /  \};\n\}/,
      replace: `  };\n  language: Language;\n}`,
      description: 'Add language prop to interface'
    },
    {
      search: /export default function EcoCard\(\{ data \}: EcoCardProps\) \{/,
      replace: `export default function EcoCard({ data, language }: EcoCardProps) {\n  const t = translations[language];`,
      description: 'Add language param and translations'
    },
    {
      search: /'Eco Impact'/g,
      replace: '{t.eco.ecoImpact}',
      description: 'Translate "Eco Impact"'
    },
    {
      search: /'Your Journey'/g,
      replace: '{t.eco.yourJourney}',
      description: 'Translate "Your Journey"'
    },
    {
      search: /CO₂ Emissions \(kg\)/g,
      replace: '{t.eco.co2EmissionsKg}',
      description: 'Translate "CO₂ Emissions (kg)"'
    },
    {
      search: /'Train'/g,
      replace: '{t.eco.train}',
      description: 'Translate "Train"'
    },
    {
      search: /'Car'/g,
      replace: '{t.eco.car}',
      description: 'Translate "Car"'
    },
    {
      search: /'Plane'/g,
      replace: '{t.eco.plane}',
      description: 'Translate "Plane"'
    },
    {
      search: /Saving /g,
      replace: '{t.eco.saving} ',
      description: 'Translate "Saving"'
    },
    {
      search: /vs\. car/g,
      replace: '{t.eco.vsCar}',
      description: 'Translate "vs. car"'
    },
    {
      search: /Equivalent to/g,
      replace: '{t.eco.equivalentTo}',
      description: 'Translate "Equivalent to"'
    },
    {
      search: /trees\/year/g,
      replace: '{t.eco.treesPerYear}',
      description: 'Translate "trees/year"'
    }
  ],
  
  'src/components/cards/CompareCard.tsx': [
    {
      search: /^interface CompareCardProps \{$/m,
      replace: `import type { Language } from '@/lib/i18n';\nimport { translations } from '@/lib/i18n';\n\ninterface CompareCardProps {`,
      description: 'Add imports'
    },
    {
      search: /  \};\n\}/,
      replace: `  };\n  language: Language;\n}`,
      description: 'Add language prop to interface'
    },
    {
      search: /export default function CompareCard\(\{ data \}: CompareCardProps\) \{/,
      replace: `export default function CompareCard({ data, language }: CompareCardProps) {\n  const t = translations[language];`,
      description: 'Add language param and translations'
    }
  ],
  
  'src/components/cards/ItineraryCard.tsx': [
    {
      search: /^interface ItineraryCardProps \{$/m,
      replace: `import type { Language } from '@/lib/i18n';\nimport { translations } from '@/lib/i18n';\n\ninterface ItineraryCardProps {`,
      description: 'Add imports'
    },
    {
      search: /  \};\n\}/,
      replace: `  };\n  language: Language;\n}`,
      description: 'Add language prop to interface'
    },
    {
      search: /export default function ItineraryCard\(\{ data \}: ItineraryCardProps\) \{/,
      replace: `export default function ItineraryCard({ data, language }: ItineraryCardProps) {\n  const t = translations[language];`,
      description: 'Add language param and translations'
    }
  ]
};

console.log('🌍 i18n Component Updater');
console.log('=========================\n');

console.log('This script would apply the following updates:\n');

Object.entries(updates).forEach(([file, fileUpdates]) => {
  console.log(`📝 ${file}:`);
  fileUpdates.forEach((update, idx) => {
    console.log(`   ${idx + 1}. ${update.description}`);
  });
  console.log('');
});

console.log('\n⚠️  Note: This is a demonstration script.');
console.log('For actual implementation, please apply changes manually following i18n_progress.md\n');

module.exports = updates;
