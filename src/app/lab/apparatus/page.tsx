
'use client';

import { useState, useEffect, useTransition } from 'react';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Beaker, FlaskConical, Pipette, TestTube, Thermometer, Microscope, Scale, Search, Wind, Flame, Plus, Loader2, Check } from 'lucide-react';
import { useExperiment } from '@/hooks/use-experiment';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDebouncedCallback } from 'use-debounce';
import type { Equipment } from '@/lib/experiment';
import { findApparatus } from '@/app/actions';

const equipmentIcons: { [key: string]: React.ReactNode } = {
  glassware: <Beaker className="h-10 w-10 text-primary" />,
  funnel: <Wind className="h-10 w-10 text-primary" />, // Using Wind as a stand-in
  heating: <Flame className="h-10 w-10 text-primary" />,
  vacuum: <Wind className="h-10 w-10 text-primary" />, // Using Wind as a stand-in
  measurement: <Scale className="h-10 w-10 text-primary" />,
  safety: <Beaker className="h-10 w-10 text-primary" />, // Placeholder
  other: <TestTube className="h-10 w-10 text-primary" />,
};

function getIconForEquipment(item: Omit<Equipment, 'position' | 'isSelected' | 'size'>): React.ReactNode {
  // More specific icons first
  if (item.id.includes('beaker')) return <Beaker className="h-10 w-10 text-primary" />;
  if (item.id.includes('erlenmeyer') || item.id.includes('flask')) return <FlaskConical className="h-10 w-10 text-primary" />;
  if (item.id.includes('burette') || item.id.includes('pipette')) return <Pipette className="h-10 w-10 text-primary" />;
  if (item.id.includes('cylinder') || item.id.includes('tube')) return <TestTube className="h-10 w-10 text-primary" />;
  if (item.id.includes('ph-meter') || item.id.includes('thermometer')) return <Thermometer className="h-10 w-10 text-primary" />;
  if (item.id.includes('balance')) return <Scale className="h-10 w-10 text-primary" />;
  if (item.id.includes('microscope')) return <Microscope className="h-10 w-10 text-primary" />;

  // Fallback to type
  if (equipmentIcons[item.type]) {
    return equipmentIcons[item.type];
  }

  // Final fallback
  return <Beaker className="h-10 w-10 text-primary" />;
}

export default function ApparatusPage() {
  const [searchTerm, setSearchTerm] = useState('common lab equipment');
  const [isSearching, startSearchTransition] = useTransition();
  const [results, setResults] = useState<Omit<Equipment, 'position' | 'isSelected' | 'size' | 'solutions'>[]>([]);
  const { handleAddEquipmentToInventory, inventoryEquipment } = useExperiment();

  const performSearch = (query: string) => {
    if (!query) {
      setResults([]);
      return;
    };
    startSearchTransition(async () => {
      const searchResults = await findApparatus(query);
      setResults(searchResults);
    });
  };

  useEffect(() => {
    // Show common items on initial load
    performSearch('common lab glassware');
  }, []);

  const debouncedSearch = useDebouncedCallback((query: string) => {
    performSearch(query);
  }, 500);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchTerm(query);
    debouncedSearch(query);
  };

  return (
    <div className="min-h-screen bg-transparent text-foreground p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8 animate-fade-in-up">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-glow">Apparatus Catalog</h1>
          <p className="text-muted-foreground mt-2 text-md md:text-lg">
            Explore the tools and equipment available in the LabSphere laboratory.
          </p>
        </header>

        <div className="mb-8 max-w-lg mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
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
              <p className="text-muted-foreground mt-4">AI is searching the catalog...</p>
          </div>
        )}

        {!isSearching && results.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {results.map((item, index) => {
              const isInInventory = inventoryEquipment.some(invItem => invItem.id === item.id);
              return (
                <Card key={item.id} className="flex flex-col justify-between card-entry-animation" style={{ animationDelay: `${index * 50}ms` }}>
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
                    <Button 
                      className="w-full" 
                      onClick={() => handleAddEquipmentToInventory(item)}
                      disabled={isInInventory}
                    >
                      {isInInventory ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Added
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Add
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
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
