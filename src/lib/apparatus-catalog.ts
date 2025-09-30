
import type { Equipment } from './experiment';

export const commonApparatus: Omit<Equipment, 'position' | 'isSelected' | 'size' | 'solutions'>[] = [
    {
        id: 'beaker-250ml',
        name: 'Beaker (250ml)',
        type: 'beaker',
        volume: 250,
        description: 'A cylindrical container used to hold, mix, and heat liquids.',
    },
    {
        id: 'erlenmeyer-flask-250ml',
        name: 'Erlenmeyer Flask (250ml)',
        type: 'erlenmeyer-flask',
        volume: 250,
        description: 'A conical flask used to hold and mix chemicals, minimizing splashing.',
    },
    {
        id: 'graduated-cylinder-100ml',
        name: 'Graduated Cylinder (100ml)',
        type: 'graduated-cylinder',
        volume: 100,
        description: 'Used to measure the volume of a liquid.',
    },
    {
        id: 'burette-50ml',
        name: 'Burette (50ml)',
        type: 'burette',
        volume: 50,
        description: 'A vertical cylindrical piece of laboratory glassware with a volumetric graduation.',
    },
    {
        id: 'test-tube',
        name: 'Test Tube',
        type: 'test-tube',
        volume: 25,
        description: 'A thin glass tube used to hold small amounts of material for laboratory testing or experiments.',
    },
    {
        id: 'pipette-10ml',
        name: 'Pipette (10ml)',
        type: 'pipette',
        volume: 10,
        description: 'Used to transport a measured volume of liquid.',
    },
    {
        id: 'volumetric-flask-500ml',
        name: 'Volumetric Flask (500ml)',
        type: 'volumetric-flask',
        volume: 500,
        description: 'A type of laboratory flask, calibrated to contain a precise volume at a particular temperature.',
    },
    {
        id: 'funnel',
        name: 'Funnel',
        type: 'funnel',
        description: 'Used to guide liquid or powder into a small opening.',
    },
    {
        id: 'thermometer',
        name: 'Thermometer',
        type: 'thermometer',
        description: 'Measures temperature.',
    },
    {
        id: 'ph-meter',
        name: 'pH Meter',
        type: 'ph-meter',
        description: 'Measures the pH of a solution.',
    },
    {
        id: 'stand',
        name: 'Ring Stand',
        type: 'stand',
        description: 'Used to support other pieces of equipment and glassware.',
    },
    {
        id: 'clamp',
        name: 'Utility Clamp',
        type: 'clamp',
        description: 'Attaches to a ring stand to hold glassware, such as a burette or flask.',
    },
];
