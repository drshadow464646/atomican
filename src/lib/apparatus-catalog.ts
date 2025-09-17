
import type { Equipment } from './experiment';

// This acts as a local database for all available apparatus.
// It is populated with a comprehensive list based on typical laboratory equipment.

export const ALL_APPARATUS: Omit<Equipment, 'position' | 'isSelected' | 'size' | 'solutions'>[] = [
  // == Glassware & Small Hardware ==
  { id: 'beaker-50ml', name: 'Beaker (50ml)', type: 'beaker', volume: 50, description: 'A 50ml beaker for holding and mixing liquids.' },
  { id: 'beaker-250ml', name: 'Beaker (250ml)', type: 'beaker', volume: 250, description: 'A 250ml beaker for holding and mixing liquids.' },
  { id: 'beaker-1l', name: 'Beaker (1L)', type: 'beaker', volume: 1000, description: 'A 1L beaker for holding and mixing liquids.' },
  { id: 'erlenmeyer-flask-250ml', name: 'Erlenmeyer Flask (250ml)', type: 'erlenmeyer-flask', volume: 250, description: 'A 250ml conical flask, useful for titrations and heating.' },
  { id: 'erlenmeyer-flask-500ml', name: 'Erlenmeyer Flask (500ml)', type: 'erlenmeyer-flask', volume: 500, description: 'A 500ml conical flask, useful for titrations and heating.' },
  { id: 'volumetric-flask-100ml', name: 'Volumetric Flask (100ml)', type: 'volumetric-flask', volume: 100, description: 'A 100ml flask for preparing solutions to an accurate volume.' },
  { id: 'volumetric-flask-1l', name: 'Volumetric Flask (1L)', type: 'volumetric-flask', volume: 1000, description: 'A 1L flask for preparing solutions to an accurate volume.' },
  { id: 'round-bottom-flask-250ml', name: 'Round-Bottom Flask (250ml)', type: 'glassware', volume: 250, description: 'A 250ml flask with a round bottom, for heating or vacuum applications.' },
  { id: 'graduated-cylinder-10ml', name: 'Graduated Cylinder (10ml)', type: 'graduated-cylinder', volume: 10, description: 'A 10ml cylinder for measuring approximate volumes of liquids.' },
  { id: 'graduated-cylinder-100ml', name: 'Graduated Cylinder (100ml)', type: 'graduated-cylinder', volume: 100, description: 'A 100ml cylinder for measuring approximate volumes of liquids.' },
  { id: 'test-tube', name: 'Test Tube', type: 'test-tube', volume: 10, description: 'A small glass tube for holding and observing chemical reactions.' },
  { id: 'burette-50ml', name: 'Burette (50ml)', type: 'burette', volume: 50, description: 'A 50ml burette for accurately dispensing variable amounts of a chemical solution.' },
  { id: 'pipette-10ml', name: 'Volumetric Pipette (10ml)', type: 'pipette', volume: 10, description: 'A 10ml pipette for accurately transferring a specific volume of liquid.' },
  { id: 'liebig-condenser', name: 'Liebig Condenser', type: 'glassware', description: 'A simple condenser used for distillation.' },
  { id: 'allihn-condenser', name: 'Allihn (Bulb) Condenser', type: 'glassware', description: 'A condenser with a series of bulbs to increase surface area, for refluxing.' },
  { id: 'soxhlet-extractor', name: 'Soxhlet Extractor', type: 'glassware', description: 'Apparatus for continuous solid-liquid extraction.'},
  { id: 'separatory-funnel-500ml', name: 'Separatory Funnel (500ml)', type: 'funnel', volume: 500, description: 'A 500ml funnel used for liquid-liquid extractions.' },
  { id: 'buchner-funnel', name: 'Büchner Funnel', type: 'funnel', description: 'A porcelain or glass funnel with a perforated plate, used for vacuum filtration.' },
  { id: 'filter-flask-1l', name: 'Filter Flask (1L)', type: 'glassware', volume: 1000, description: 'A heavy-walled flask with a side arm for connecting a vacuum line.' },
  { id: 'chromatography-column', name: 'Chromatography Column', type: 'glassware', description: 'A glass tube used for column chromatography.' },
  { id: 'claisen-adapter', name: 'Claisen Adapter', type: 'glassware', description: 'A multi-necked adapter for complex distillation setups.' },
  { id: 'syringe-10ml', name: 'Syringe (10ml)', type: 'other', volume: 10, description: 'A 10ml syringe for precise liquid transfer.'},

  // == Heating, Cooling, Mixing ==
  { id: 'hot-plate-stirrer', name: 'Hot Plate/Stirrer', type: 'heating', description: 'An electric device to simultaneously heat and stir solutions.' },
  { id: 'magnetic-stir-bar', name: 'Magnetic Stir Bar', type: 'other', description: 'A Teflon-coated magnet for stirring solutions on a stir plate.' },
  { id: 'heating-mantle', name: 'Heating Mantle', type: 'heating', description: 'A mantle used to heat round-bottom flasks.' },
  { id: 'oil-bath', name: 'Oil Bath', type: 'heating', description: 'A container of oil heated on a hot plate for uniform heating.' },
  { id: 'dewar-flask', name: 'Dewar Flask', type: 'other', description: 'A vacuum-insulated flask for holding cryogenic liquids (LN2, dry ice).' },
  { id: 'overhead-stirrer', name: 'Overhead Stirrer', type: 'heating', description: 'A motor-driven stirrer for large volumes or viscous liquids.'},
  
  // == Vacuum & Inert Atmosphere ==
  { id: 'rotary-vane-pump', name: 'Rotary Vane Pump', type: 'vacuum', description: 'A mechanical pump for achieving medium vacuum ("rotovap").' },
  { id: 'schlenk-line', name: 'Schlenk Line', type: 'vacuum', description: 'A dual manifold for working with air-sensitive reagents under vacuum or inert gas.' },
  { id: 'glove-box', name: 'Glove Box', type: 'vacuum', description: 'An isolated chamber for working in a completely inert atmosphere.' },
  { id: 'cold-trap', name: 'Cold Trap', type: 'vacuum', description: 'A device to condense vapors before they reach the vacuum pump.' },
  { id: 'pressure-regulator', name: 'Gas Regulator', type: 'vacuum', description: 'A two-stage regulator for controlling gas pressure from a cylinder.' },
  { id: 'bubbler', name: 'Bubbler', type: 'vacuum', description: 'Monitors gas flow and prevents over-pressurization of a system.' },

  // == Analytical Instruments ==
  { id: 'analytical-balance', name: 'Analytical Balance', type: 'measurement', description: 'A highly sensitive lab instrument for measuring mass with high precision (±0.1 mg).' },
  { id: 'ph-meter', name: 'pH Meter', type: 'measurement', description: 'An instrument used to measure hydrogen-ion activity in water-based solutions.' },
  { id: 'thermometer', name: 'Digital Thermometer', type: 'measurement', description: 'An electronic instrument for measuring temperature.' },
  { id: 'ft-ir-spectrometer', name: 'FT-IR Spectrometer', type: 'measurement', description: 'Measures infrared absorption to identify functional groups in a molecule.' },
  { id: 'uv-vis-spectrophotometer', name: 'UV-Vis Spectrophotometer', type: 'measurement', description: 'Measures UV-visible light absorption to determine concentration or electronic structure.' },
  { id: 'gas-chromatograph-ms', name: 'GC-MS', type: 'measurement', description: 'Separates volatile compounds and identifies them by mass spectrometry.' },
  { id: 'nmr-spectrometer', name: 'NMR Spectrometer (400 MHz)', type: 'measurement', description: 'Uses magnetic fields to determine the structure of organic compounds.' },
  { id: 'melting-point-apparatus', name: 'Melting Point Apparatus', type: 'measurement', description: 'An instrument to determine the melting point of a solid.' },

  // == Safety & Storage ==
  { id: 'fume-hood', name: 'Fume Hood', type: 'safety', description: 'A ventilated enclosure for safely working with hazardous fumes.' },
  { id: 'safety-goggles', name: 'Safety Goggles', type: 'safety', description: 'Required eye protection for all lab work.' },
  { id: 'lab-coat', name: 'Lab Coat', type: 'safety', description: 'A coat to protect clothing and skin from spills.'},
  { id: 'fire-extinguisher', name: 'Fire Extinguisher', type: 'safety', description: 'For putting out small fires (Class ABC).' },
  { id: 'safety-shower', name: 'Safety Shower & Eyewash', type: 'safety', description: 'For emergency use in case of chemical contact.' },
  { id: 'solvent-cabinet', name: 'Flammable Solvent Cabinet', type: 'safety', description: 'A fire-rated cabinet for storing flammable liquids.' },
  { id: 'spill-kit', name: 'Spill Kit', type: 'safety', description: 'Contains materials to clean up chemical spills.' },

  // == Consumables & General Hardware ==
  { id: 'spatula', name: 'Spatula', type: 'other', description: 'A small utensil for scraping, transferring, or applying powders and paste-like chemicals.' },
  { id: 'forceps', name: 'Forceps', type: 'other', description: 'For grasping or holding small objects.' },
  { id: 'weighing-paper', name: 'Weighing Paper', type: 'other', description: 'Used to weigh solid, powdery substances on a balance.' },
  { id: 'wash-bottle', name: 'Wash Bottle (DI Water)', type: 'other', description: 'A squeeze bottle with a nozzle, for rinsing glassware.' },
  { id: 'ring-stand', name: 'Ring Stand', type: 'other', description: 'A metal stand with a solid base used to support laboratory apparatus.' },
  { id: 'utility-clamp', name: 'Utility Clamp', type: 'other', description: 'A clamp used to hold various pieces of lab equipment, attached to a ring stand.' },
  { id: 'test-tube-rack', name: 'Test Tube Rack', type: 'other', description: 'A rack for holding and organizing test tubes.' },
  { id: 'syringe-filter', name: 'Syringe Filter', type: 'other', description: 'A single-use filter cartridge attached to a syringe to remove particulates.'},
];

// A smaller, curated list for the initial inventory and "common" searches.
export const COMMON_APPARATUS_IDS = [
  'beaker-250ml',
  'erlenmeyer-flask-250ml',
  'graduated-cylinder-100ml',
  'test-tube',
  'burette-50ml',
  'pipette-10ml',
  'buchner-funnel',
  'filter-flask-1l',
  'separatory-funnel-500ml',
  'hot-plate-stirrer',
  'magnetic-stir-bar',
  'analytical-balance',
  'ph-meter',
  'thermometer',
  'ring-stand',
  'utility-clamp'
];

// Add a default position, size, and isSelected property for use in the inventory
export const getInitialInventoryEquipment = (): Equipment[] => {
  return ALL_APPARATUS.filter(item => COMMON_APPARATUS_IDS.includes(item.id)).map(item => ({
    ...item,
    position: { x: 0, y: 0 },
    size: 1,
    isSelected: false,
    solutions: [],
  }));
};
