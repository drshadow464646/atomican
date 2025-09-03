
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Beaker, FlaskConical, Pipette, TestTube, Thermometer, Microscope, Scale, Search, Wind, Flame, Plus, Loader2 } from 'lucide-react';
import { useExperiment } from '@/hooks/use-experiment';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDebouncedCallback } from 'use-debounce';
import { searchApparatus, type ApparatusSearchOutput } from '@/ai/flows/apparatus-search';
import { useToast } from '@/hooks/use-toast';
import type { Equipment } from '@/lib/experiment';


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
};

function getIconForEquipment(item: Equipment) {
    if (equipmentIcons[item.type]) {
        return equipmentIcons[item.type];
    }
    // Fallback for specific IDs if type doesn't match
    if (item.id.includes('ph-meter')) return <Wind className="h-10 w-10 text-primary" />;
    if (item.id.includes('balance')) return <Scale className="h-10 w-10 text-primary" />;
    return <Beaker className="h-10 w-10 text-primary" />;
}

export default function ApparatusPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(true);
  const [results, setResults] = useState<ApparatusSearchOutput | null>(null);
  const { handleAddEquipmentToInventory } = useExperiment();
  const { toast } = useToast();

  const performSearch = async (query: string) => {
    setIsSearching(true);
    try {
      const searchResults = await searchApparatus(query);
      setResults(searchResults);
    } catch (error) {
      console.error("Apparatus search failed:", error);
      toast({
        title: 'Search Failed',
        description: 'Could not retrieve equipment results at this time.',
        variant: 'destructive',
      });
      setResults(null);
    } finally {
      setIsSearching(false);
    }
  }

  // Fetch common items on initial load
  useEffect(() => {
    performSearch('common lab equipment');
  }, []);


  const debouncedSearch = useDebouncedCallback(async (query: string) => {
    if (!query || query.length < 3) {
      // If search is cleared, show common items again
      performSearch('common lab equipment');
      return;
    }
    performSearch(query);
  }, 500);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchTerm(query);
    debouncedSearch(query);
  };
  
  const equipmentToDisplay = results ? results.equipment : [];

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
              className="w-full pl-10 pr-10"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            {isSearching && (
              <div className="absolute right-3">
                 <div className="h-5 w-5">
                    <Loader2 className="h-full w-full animate-spin" />
                 </div>
              </div>
            )}
          </div>
        </div>
        
        {isSearching && equipmentToDisplay.length === 0 && (
          <div className="text-center col-span-full py-16">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground mt-4">Fetching equipment...</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {equipmentToDisplay.map(item => (
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
                 <Button className="w-full" onClick={() => handleAddEquipmentToInventory(item as Equipment)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        {!isSearching && equipmentToDisplay.length === 0 && (
            <div className="text-center col-span-full py-16">
                <p className="text-muted-foreground">No equipment found matching your search.</p>
            </div>
        )}
      </div>
    </div>
  );
}
