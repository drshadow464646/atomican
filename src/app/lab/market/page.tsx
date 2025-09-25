
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Droplets, Plus, Search, Loader2, Check } from 'lucide-react';
import type { Chemical } from '@/lib/experiment';
import { useToast } from '@/hooks/use-toast';
import { useDebouncedCallback } from 'use-debounce';
import { useExperiment } from '@/hooks/use-experiment';
import { ALL_CHEMICALS, COMMON_CHEMICAL_IDS } from '@/lib/chemical-catalog';

export default function MarketPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<Chemical[]>([]);
  const { toast } = useToast();
  const { handleAddChemicalToInventory, inventoryChemicals } = useExperiment();

  const filterChemicals = (query: string) => {
    setIsSearching(true);
    if (!query) {
      setResults(ALL_CHEMICALS.filter(chem => COMMON_CHEMICAL_IDS.includes(chem.id)));
    } else {
      const lowerCaseQuery = query.toLowerCase();
      const filtered = ALL_CHEMICALS.filter(chem =>
        chem.name.toLowerCase().includes(lowerCaseQuery) ||
        chem.formula.toLowerCase().includes(lowerCaseQuery) ||
        chem.type.toLowerCase().includes(lowerCaseQuery) ||
        chem.id.toLowerCase().includes(lowerCaseQuery)
      );
      setResults(filtered);
    }
    setIsSearching(false);
  };

  useEffect(() => {
    // Show common items on initial load
    filterChemicals('');
  }, []);

  const debouncedSearch = useDebouncedCallback((query: string) => {
    filterChemicals(query);
  }, 300);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchTerm(query);
    debouncedSearch(query);
  };
  
  return (
    <div className="min-h-screen bg-transparent text-foreground p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8 animate-fade-in-up">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-glow">Chemical Market</h1>
          <p className="text-muted-foreground mt-2 text-md md:text-lg">
            Browse and acquire reagents for your experiments from our virtual catalog.
          </p>
        </header>

        <div className="mb-8 max-w-lg mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="relative flex items-center">
            <Search className="absolute left-3 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name, formula, or type (e.g. 'hcl', 'strong acids')"
              className="w-full pl-10"
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

        {isSearching && (
          <div className="text-center col-span-full py-16">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground mt-4">Searching catalog...</p>
          </div>
        )}

        {!isSearching && results.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {results.map((chem, index) => {
              const isInInventory = inventoryChemicals.some(invChem => invChem.id === chem.id);
              return (
                <Card key={chem.id} className="flex flex-col card-entry-animation" style={{ animationDelay: `${index * 50}ms` }}>
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
                    <Button 
                      className="w-full" 
                      onClick={() => handleAddChemicalToInventory(chem)}
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
                          Add to Inventory
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
          <div className="text-center col-span-full py-16">
              <p className="text-muted-foreground">No chemicals found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
