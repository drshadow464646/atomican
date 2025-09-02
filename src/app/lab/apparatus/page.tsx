
'use client';

import { useState } from 'react';
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
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ApparatusSearchOutput | null>(null);
  const { handleAddEquipment } = useExperiment();
  const { toast } = useToast();

  const debouncedSearch = useDebouncedCallback(async (query: string) => {
    if (!query || query.length < 3) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    try {
      const results = await searchApparatus(query);
      setSearchResults(results);
    } catch (error) {
      console.error("Apparatus search failed:", error);
      toast({
        title: 'Search Failed',
        description: 'Could not retrieve equipment results at this time.',
        variant: 'destructive',
      });
      setSearchResults(null);
    } finally {
      setIsSearching(false);
    }
  }, 500);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchTerm(query);
    if (query.length === 0) {
      setIsSearching(false);
      setSearchResults(null);
    } else if(query.length >= 3) {
      setIsSearching(true);
      debouncedSearch(query);
    }
  };
  
  const equipmentToDisplay = searchResults ? searchResults.equipment : [];

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
              onChange={handleSearchChange}
            />
            {isSearching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin" />}
          </div>
        </div>

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
                 <Button className="w-full" onClick={() => handleAddEquipment(item as Equipment)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        {!isSearching && searchTerm.length >= 3 && equipmentToDisplay.length === 0 && (
            <div className="text-center col-span-full py-16">
                <p className="text-muted-foreground">No equipment found matching your search.</p>
            </div>
        )}
         {!isSearching && searchTerm.length < 3 && (
            <div className="text-center col-span-full py-16">
                <p className="text-muted-foreground">Enter 3 or more characters to start a search.</p>
            </div>
         )}
      </div>
    </div>
  );
}
