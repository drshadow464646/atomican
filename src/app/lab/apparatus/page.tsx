
'use client';

import { useState, useTransition } from 'react';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Beaker, FlaskConical, Pipette, TestTube, Thermometer, Microscope, Scale, Search, Wind, Flame, Plus, Loader2, Check, Cylinder, Ungroup, Library } from 'lucide-react';
import { useInventory } from '@/hooks/use-inventory'; // Using the new lightweight hook
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Equipment } from '@/lib/experiment';
import { findApparatus } from '@/app/actions';
import { commonApparatus } from '@/lib/apparatus-catalog';

const iconClass = "h-10 w-10 text-primary";

export const equipmentIcons: { [key: string]: React.ReactNode } = {
  'beaker': <Beaker className={iconClass} />,
  'erlenmeyer-flask': <FlaskConical className={iconClass} />,
  'graduated-cylinder': <Cylinder className={iconClass} />,
  'test-tube': <TestTube className={iconClass} />,
  'burette': <Pipette className={iconClass} />, // Using Pipette as it's visually similar for this context
  'pipette': <Pipette className={iconClass} />,
  'volumetric-flask': <FlaskConical className={iconClass} />, // Using Flask as it's visually similar
  'thermometer': <Thermometer className={iconClass} />,
  'ph-meter': <Thermometer className={iconClass} strokeWidth={1.5} />,
  'balance': <Scale className={iconClass} />,
  'heating': <Flame className={iconClass} />,
  'microscope': <Microscope className={iconClass} />,
  'measurement': <Scale className={iconClass} />,
  'glassware': <Beaker className={iconClass} />,
  'safety': <Beaker className={iconClass} />,
  'vacuum': <Wind className={iconClass} />,
  'stand': <Ungroup className={iconClass} />,
  'clamp': <Library className={iconClass} />,
  'other': <Beaker className={iconClass} />,
};

function getIconForEquipment(item: Omit<Equipment, 'position' | 'isSelected' | 'size' | 'solutions'>): React.ReactNode {
  // Prioritize full ID match first
  if (equipmentIcons[item.id]) return equipmentIcons[item.id];
  // Fallback to type
  if (equipmentIcons[item.type]) return equipmentIcons[item.type];
  // Ultimate fallback
  return <Beaker className={iconClass} />;
}

export default function ApparatusPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, startSearchTransition] = useTransition();
  const [results, setResults] = useState<Omit<Equipment, 'position' | 'isSelected' | 'size' | 'solutions'>[]>(commonApparatus);
  const { handleAddEquipmentToInventory, inventoryEquipment } = useInventory(); // Using new hook
  const [isAiSearch, setIsAiSearch] = useState(false);

  const performSearch = (query: string) => {
    if (!query) {
      setResults(commonApparatus);
      setIsAiSearch(false);
      return;
    };
    setIsAiSearch(true);
    startSearchTransition(async () => {
      const searchResults = await findApparatus(query);
      setResults(searchResults);
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchTerm(query);
    if (!query) {
      setResults(commonApparatus);
      setIsAiSearch(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchTerm);
  };

  return (
    <div className="min-h-screen bg-transparent text-foreground p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8 animate-fade-in-up">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-glow">Apparatus Catalog</h1>
          <p className="text-muted-foreground mt-2 text-md md:text-lg">
            Explore the tools and equipment available in the Atomican laboratory.
          </p>
        </header>

        <form onSubmit={handleSearchSubmit} className="mb-8 max-w-lg mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="relative flex items-center gap-2">
            <Search className="absolute left-3 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for equipment (e.g., 'beaker', 'heating')"
              className="w-full pl-10"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <Button type="submit" disabled={isSearching}>
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
            </Button>
          </div>
        </form>
        
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
                <p className="text-muted-foreground">{isAiSearch ? 'AI could not find equipment matching your search.' : 'No common equipment loaded.'}</p>
            </div>
        )}
      </div>
    </div>
  );
}
