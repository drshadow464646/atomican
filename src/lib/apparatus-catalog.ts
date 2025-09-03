
import type { Equipment } from './experiment';

// This acts as a local database for all available apparatus.
// We are not using the AI for this anymore to ensure reliability and speed.

export const ALL_APPARATUS: Omit<Equipment, 'position' | 'isSelected' | 'size'>[] = [
  // Glassware
  { id: 'beaker-50ml', name: 'Beaker (50ml)', type: 'beaker', volume: 50, description: 'A 50ml beaker for holding and mixing liquids.' },
  { id: 'beaker-100ml', name: 'Beaker (100ml)', type: 'beaker', volume: 100, description: 'A 100ml beaker for holding and mixing liquids.' },
  { id: 'beaker-250ml', name: 'Beaker (250ml)', type: 'beaker', volume: 250, description: 'A 250ml beaker for holding and mixing liquids.' },
  { id: 'erlenmeyer-flask-250ml', name: 'Erlenmeyer Flask (250ml)', type: 'erlenmeyer-flask', volume: 250, description: 'A 250ml conical flask, useful for titrations.' },
  { id: 'volumetric-flask-100ml', name: 'Volumetric Flask (100ml)', type: 'volumetric-flask', volume: 100, description: 'A 100ml flask for preparing solutions to an accurate volume.' },
  { id: 'graduated-cylinder-10ml', name: 'Graduated Cylinder (10ml)', type: 'graduated-cylinder', volume: 10, description: 'A 10ml cylinder for measuring approximate volumes of liquids.' },
  { id: 'graduated-cylinder-100ml', name: 'Graduated Cylinder (100ml)', type: 'graduated-cylinder', volume: 100, description: 'A 100ml cylinder for measuring approximate volumes of liquids.' },
  { id: 'test-tube', name: 'Test Tube', type: 'test-tube', volume: 10, description: 'A small glass tube for holding and observing chemical reactions.' },
  { id: 'burette-50ml', name: 'Burette (50ml)', type: 'burette', volume: 50, description: 'A 50ml burette for accurately dispensing variable amounts of a chemical solution.' },
  { id: 'pipette-10ml', name: 'Volumetric Pipette (10ml)', type: 'pipette', volume: 10, description: 'A 10ml pipette for accurately transferring a specific volume of liquid.' },
  { id: 'funnel', name: 'Funnel', type: 'funnel', description: 'A funnel for guiding liquid or powder into a small opening.' },
  { id: 'thistle-tube', name: 'Thistle Tube', type: 'funnel', description: 'A special funnel with a long tube, used to add liquid to an existing system of apparatus.' },
  { id: 'buchner-funnel', name: 'Büchner Funnel', type: 'funnel', description: 'A porcelain or glass funnel with a perforated plate, used for vacuum filtration.' },
  { id: 'separatory-funnel', name: 'Separatory Funnel', type: 'funnel', description: 'A funnel used for liquid-liquid extractions to separate the components of a mixture.' },
  { id: 'petri-dish', name: 'Petri Dish', type: 'other', description: 'A shallow cylindrical dish used to culture cells or observe samples.' },
  { id: 'watch-glass', name: 'Watch Glass', type: 'other', description: 'A circular concave piece of glass used for evaporation or as a lid for a beaker.' },
  
  // Heating
  { id: 'bunsen-burner', name: 'Bunsen Burner', type: 'heating', description: 'A gas burner used for heating, sterilization, and combustion.' },
  { id: 'hot-plate', name: 'Hot Plate', type: 'heating', description: 'An electric device used to heat glassware or its contents.' },
  { id: 'magnetic-stirrer', name: 'Magnetic Stirrer', type: 'heating', description: 'A device that uses a rotating magnetic field to cause a stir bar to spin and mix a liquid.' },
  { id: 'wire-gauze', name: 'Wire Gauze', type: 'heating', description: 'A mesh of wire used to support beakers and flasks when heating.' },
  { id: 'crucible', name: 'Crucible', type: 'heating', description: 'A ceramic or metal container in which metals or other substances may be melted or subjected to very high temperatures.' },

  // Measurement
  { id: 'ph-meter', name: 'pH Meter', type: 'measurement', description: 'An instrument used to measure hydrogen-ion activity in water-based solutions.' },
  { id: 'analytical-balance', name: 'Analytical Balance', type: 'measurement', description: 'A highly sensitive lab instrument for measuring mass with high precision.' },
  { id: 'thermometer', name: 'Thermometer', type: 'measurement', description: 'An instrument for measuring temperature.' },
  { id: 'spectrophotometer', name: 'Spectrophotometer', type: 'measurement', description: 'Measures the intensity of light in a part of the spectrum, used to determine substance concentration.' },
  
  // Support & Holding
  { id: 'ring-stand', name: 'Ring Stand', type: 'other', description: 'A metal stand with a solid base used to support laboratory apparatus.' },
  { id: 'utility-clamp', name: 'Utility Clamp', type: 'other', description: 'A clamp used to hold various pieces of lab equipment, attached to a ring stand.' },
  { id: 'test-tube-rack', name: 'Test Tube Rack', type: 'other', description: 'A rack for holding and organizing test tubes.' },

  // Microscopy
  { id: 'compound-microscope', name: 'Compound Microscope', type: 'microscopy', description: 'A high-power microscope used to view smaller specimens such as cell structures.' },
];

export const COMMON_APPARATUS_IDS = [
  'beaker-250ml',
  'erlenmeyer-flask-250ml',
  'graduated-cylinder-100ml',
  'test-tube',
  'burette-50ml',
  'pipette-10ml',
  'funnel',
  'hot-plate',
  'magnetic-stirrer',
  'analytical-balance',
  'ph-meter',
  'thermometer',
];

// Add a default position, size, and isSelected property for use in the inventory
export const getInitialInventoryEquipment = (): Equipment[] => {
  return ALL_APPARATUS.filter(item => COMMON_APPARATUS_IDS.includes(item.id)).map(item => ({
    ...item,
    position: { x: 0, y: 0 },
    size: 1,
    isSelected: false,
  }));
};
