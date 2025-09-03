
'use client';

import { useState, useEffect } from 'react';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Beaker, FlaskConical, Pipette, TestTube, Thermometer, Microscope, Scale, Search, Wind, Flame, Plus, Loader2 } from 'lucide-react';
import { useExperiment } from '@/hooks/use-experiment';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDebouncedCallback } from 'use-debounce';
import type { Equipment } from '@/lib/experiment';
import { ALL_APPARATUS, COMMON_APPARATUS_IDS } from '@/lib/apparatus-catalog';

const equipmentIcons: { [key: string]: React.ReactNode } = {
  'beaker': <Beaker className="h-10 w-10 text-primary" />,
  'burette': <Pipette className="h-10 w-10 text-primary" />,
  'pipette': <Pipette className="h-10 w-10 text-primary" />,
  'graduated-cylinder': <TestTube className="h-10 w-10 text-primary" />,
  'erlenmeyer-flask': <FlaskConical className="h-10 w-10 text-primary" />,
  'volumetric-flask': <FlaskConical className="h-10 w-10 text-primary" />,
  'test-tube': <TestTube className="h-10 w-10 text-primary" />,
  'measurement': <Thermometer className="h-10 w-10 text-primary" />,
  'heating': <Flame className="h-10 w-10 text-primary" />,
  'microscopy': <Microscope className="h-10 w-10 text-primary" />,
  'other': <Beaker className="h-10 w-10 text-primary" />,
  'funnel': <Wind className="h-10 w-10 text-primary" />, // Using Wind as a stand-in for Funnel
};

function getIconForEquipment(item: Equipment) {
    if (equipmentIcons[item.type]) {
        return equipmentIcons[item.type];
    }
    // Fallback for specific IDs if type doesn't match
    if (item.id.includes('ph-meter')) return <Thermometer className="h-10 w-10 text-primary" />;
    if (item.id.includes('balance')) return <Scale className="h-10 w-10 text-primary" />;
    if (item.id.includes('stirrer')) return <Wind className="h-10 w-10 text-primary" />;
    return <Beaker className="h-10 w-10 text-primary" />;
}

export default function ApparatusPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<Equipment[]>([]);
  const { handleAddEquipmentToInventory } = useExperiment();

  const filterApparatus = (query: string) => {
    setIsSearching(true);
    if (!query) {
      setResults(ALL_APPARATUS.filter(item => COMMON_APPARATUS_IDS.includes(item.id)) as Equipment[]);
    } else {
      const lowerCaseQuery = query.toLowerCase();
      const filtered = ALL_APPARATUS.filter(item => 
        item.name.toLowerCase().includes(lowerCaseQuery) ||
        item.description.toLowerCase().includes(lowerCaseQuery) ||
        item.type.toLowerCase().includes(lowerCaseQuery)
      );
      setResults(filtered as Equipment[]);
    }
    setIsSearching(false);
  };

  useEffect(() => {
    // Show common items on initial load
    filterApparatus('');
  }, []);

  const debouncedSearch = useDebouncedCallback((query: string) => {
    filterApparatus(query);
  }, 300);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchTerm(query);
    debouncedSearch(query);
  };

  return (
    <div className="min-h-screen bg-transparent text-foreground p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Apparatus Catalog</h1>
          <p className="text-muted-foreground mt-2 text-md md:text-lg">
            Explore the tools and equipment available in the LabSphere laboratory.
          </p>
        </header>

        <div className="mb-8 max-w-lg mx-auto">
          <div className="relative flex items-center">
            <Search className="absolute left-3 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for equipment (e.g., 'beaker', 'heating')"
              className="w-full pl-10"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>
        
        {isSearching && (
          <div className="text-center col-span-full py-16">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground mt-4">Searching...</p>
          </div>
        )}

        {!isSearching && results.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {results.map(item => (
              <Card key={item.id} className="flex flex-col justify-between transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
                <CardHeader className="items-center text-center">
                  <div className="p-4 bg-primary/10 rounded-full mb-2">
                      {getIconForEquipment(item)}
                  </div>
                  <CardTitle className="text-xl">{item.name}</CardTitle>
                  <CardDescription>
                    <Badge variant="secondary">{item.type}</Badge>
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button className="w-full" onClick={() => handleAddEquipmentToInventory(item)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
        
        {!isSearching && results.length === 0 && (
            <div className="w-full text-center col-span-full py-16">
                <p className="text-muted-foreground">No equipment found matching your search.</p>
            </div>
        )}
      </div>
    </div>
  );
}
