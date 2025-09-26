
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot } from 'lucide-react';

export default function ProcedurePage() {

  return (
    <div className="min-h-screen bg-transparent text-foreground p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Procedure</h1>
          <p className="text-muted-foreground mt-2 text-md md:text-lg">
            View and manage your experiment procedure.
          </p>
        </header>
        
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bot className="h-6 w-6"/> AI Assistant Offline</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              The AI-powered procedure generator has been removed from this application.
              You can manually manage your experiment steps in a future update.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
