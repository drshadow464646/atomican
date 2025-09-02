
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Beaker, FlaskConical, Pipette, TestTube, Thermometer, Microscope, Scale, Search, Wind, Flame } from 'lucide-react';
import type { Equipment } from '@/lib/experiment';
import { ALL_EQUIPMENT } from '@/lib/experiment';
import { Badge } from '@/components/ui/badge';

const equipmentIcons: { [key: string]: React.ReactNode } = {
  'beaker-250': <Beaker className="h-10 w-10 text-primary" />,
  burette: <Pipette className="h-10 w-10 text-primary" />, // Using Pipette as a stand-in
  pipette: <Pipette className="h-10 w-10 text-primary" />,
  'graduated-cylinder': <TestTube className="h-10 w-10 text-primary" />, // Using TestTube
  'erlenmeyer-flask': <FlaskConical className="h-10 w-10 text-primary" />,
  thermometer: <Thermometer className="h-10 w-10 text-primary" />,
  'ph-meter': <Wind className="h-10 w-10 text-primary" />, // Stand-in
  'hot-plate': <Flame className="h-10 w-10 text-primary" />,
  'analytical-balance': <Scale className="h-10 w-10 text-primary" />,
  microscope: <Microscope className="h-10 w-10 text-primary" />,
};

export default function ApparatusPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEquipment = ALL_EQUIPMENT.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-transparent text-foreground p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Apparatus Catalog</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Explore the tools and equipment available in the LabSphere laboratory.
          </p>
        </header>

        <div className="mb-8 max-w-lg mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for equipment (e.g., 'beaker', 'heating')"
              className="w-full pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredEquipment.map(item => (
            <Card key={item.id} className="flex flex-col">
              <CardHeader className="items-center text-center">
                <div className="p-4 bg-primary/10 rounded-full mb-2">
                    {equipmentIcons[item.id] || <Beaker className="h-10 w-10 text-primary" />}
                </div>
                <CardTitle className="text-xl">{item.name}</CardTitle>
                <CardDescription>
                  <Badge variant="secondary">{item.type}</Badge>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground text-center">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {filteredEquipment.length === 0 && (
            <div className="text-center col-span-full py-16">
                <p className="text-muted-foreground">No equipment found matching your search.</p>
            </div>
        )}
      </div>
    </div>
  );
}
