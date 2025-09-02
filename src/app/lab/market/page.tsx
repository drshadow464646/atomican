
'use client';

import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Droplets, Plus, Search, Loader2 } from 'lucide-react';
import type { Chemical } from '@/lib/experiment';
import { useToast } from '@/hooks/use-toast';
import { useDebouncedCallback } from 'use-debounce';
import { searchChemicals, ChemicalSearchOutput } from '@/ai/flows/chemical-search';

export default function MarketPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ChemicalSearchOutput | null>(null);
  const { toast } = useToast();

  const debouncedSearch = useDebouncedCallback(async (query: string) => {
    if (!query || query.length < 3) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    try {
      const results = await searchChemicals(query);
      setSearchResults(results);
    } catch (error) {
      console.error("Chemical search failed:", error);
      toast({
        title: 'Search Failed',
        description: 'Could not retrieve chemical results at this time.',
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


  const handleAddToInventory = (chemical: Chemical) => {
    // This is a placeholder for now.
    // In a real app, you would use a state management solution (like Context or Zustand)
    // to update a shared inventory state and likely save it to a database.
    console.log('Adding to inventory:', chemical);
    toast({
      title: 'Added to Inventory',
      description: `${chemical.name} has been added to your inventory.`,
    });
  };

  const chemicalsToDisplay = searchResults ? searchResults.chemicals : [];

  return (
    <div className="min-h-screen bg-transparent text-foreground p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Chemical Market</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Browse and acquire reagents for your experiments from our virtual catalog.
          </p>
        </header>

        <div className="mb-8 max-w-lg mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name, formula, or type (e.g. 'strong acids')"
              className="w-full pl-10"
              value={searchTerm}
              onChange={handleSearchChange}
            />
             {isSearching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin" />}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {chemicalsToDisplay.map(chem => (
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
                <Button className="w-full" onClick={() => handleAddToInventory(chem)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add to Inventory
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
         {!isSearching && searchTerm.length >= 3 && chemicalsToDisplay.length === 0 && (
            <div className="text-center col-span-full py-16">
                <p className="text-muted-foreground">No chemicals found matching your search.</p>
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
