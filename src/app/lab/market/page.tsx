
'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Droplets, Plus, Search, Loader2, Check } from 'lucide-react';
import type { Chemical } from '@/lib/experiment';
import { useExperiment } from '@/hooks/use-experiment';
import { findChemicals } from '@/app/actions';
import { commonChemicals } from '@/lib/chemical-catalog';

export default function MarketPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, startSearchTransition] = useTransition();
  const [results, setResults] = useState<Chemical[]>(commonChemicals);
  const { handleAddChemicalToInventory, inventoryChemicals } = useExperiment();
  const [isAiSearch, setIsAiSearch] = useState(false);

  const performSearch = (query: string) => {
    if (!query) {
        setResults(commonChemicals);
        setIsAiSearch(false);
        return;
    }
    setIsAiSearch(true);
    startSearchTransition(async () => {
      const searchResults = await findChemicals(query);
      setResults(searchResults);
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchTerm(query);
    if (!query) {
      setResults(commonChemicals);
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
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-glow">Chemical Market</h1>
          <p className="text-muted-foreground mt-2 text-md md:text-lg">
            Browse and acquire reagents for your experiments from our virtual catalog.
          </p>
        </header>

        <form onSubmit={handleSearchSubmit} className="mb-8 max-w-lg mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="relative flex items-center gap-2">
            <Search className="absolute left-3 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name, formula, or type (e.g. 'hcl', 'strong acids')"
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
              <p className="text-muted-foreground">{isAiSearch ? 'AI could not find chemicals matching your search.' : 'No common chemicals loaded.'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
