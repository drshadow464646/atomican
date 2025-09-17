
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Droplets, Plus, Search, Loader2 } from 'lucide-react';
import type { Chemical } from '@/lib/experiment';
import { useToast } from '@/hooks/use-toast';
import { useDebouncedCallback } from 'use-debounce';
import { searchChemicals } from '@/ai/flows/chemical-search';
import { useExperiment } from '@/hooks/use-experiment';
import { ALL_CHEMICALS } from '@/lib/chemical-catalog';

export default function MarketPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<Chemical[]>([]);
  const { toast } = useToast();
  const { handleAddChemicalToInventory } = useExperiment();

  const performSearch = async (query: string) => {
    setIsSearching(true);

    const lowerCaseQuery = query.toLowerCase();
    
    // 1. Local Search First
    const localResults = ALL_CHEMICALS.filter(chem => 
        chem.name.toLowerCase().includes(lowerCaseQuery) || 
        chem.formula.toLowerCase().includes(lowerCaseQuery) ||
        chem.id.toLowerCase().includes(lowerCaseQuery)
    );

    if (localResults.length > 0) {
      setResults(localResults);
      setIsSearching(false);
      return;
    }

    // 2. Fallback to AI Search if no local results
    if (query.length > 2) {
      try {
        const aiResults = await searchChemicals(query);
        setResults(aiResults.chemicals);
      } catch (error) {
        console.error("Chemical search failed:", error);
        toast({
          title: 'AI Search Failed',
          description: 'Could not retrieve remote chemical results.',
          variant: 'destructive',
        });
        setResults([]);
      }
    } else {
        setResults([]);
    }

    setIsSearching(false);
  };

  const debouncedSearch = useDebouncedCallback(async (query: string) => {
    if (!query) {
      setResults(ALL_CHEMICALS.slice(0, 12)); // Show first 12 as default
      setIsSearching(false);
      return;
    }
    await performSearch(query);
  }, 300);

  // Set initial chemicals
  useEffect(() => {
    setResults(ALL_CHEMICALS.slice(0, 12));
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchTerm(query);
    debouncedSearch(query);
  };
  
  return (
    <div className="min-h-screen bg-transparent text-foreground p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Chemical Market</h1>
          <p className="text-muted-foreground mt-2 text-md md:text-lg">
            Browse and acquire reagents for your experiments from our virtual catalog.
          </p>
        </header>

        <div className="mb-8 max-w-lg mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name, formula, or type (e.g. 'hcl', 'strong acids')"
              className="w-full pl-10 pr-10"
              value={searchTerm}
              onChange={handleSearchChange}
            />
             {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                </div>
             )}
          </div>
        </div>

        {isSearching && results.length === 0 && (
          <div className="text-center col-span-full py-16">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground mt-4">Searching catalog...</p>
          </div>
        )}

        {!isSearching && results.length === 0 && (
          <div className="text-center col-span-full py-16">
              <p className="text-muted-foreground">No chemicals found matching your search.</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {results.map(chem => (
            <Card key={chem.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-md">
                    <Droplets className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{chem.name}</CardTitle>
                    <CardDescription>{chem.formula}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground">
                  Type: <span className="font-medium text-foreground">{chem.type}</span>
                  {chem.concentration && `, Conc: ${chem.concentration}M`}
                </p>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => handleAddChemicalToInventory(chem)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add to Inventory
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
