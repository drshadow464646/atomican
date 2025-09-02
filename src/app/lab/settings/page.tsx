
'use client';

import { SettingsForm } from '@/components/settings-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function SettingsPage() {

  return (
    <div className="min-h-screen bg-transparent text-foreground p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Customize your lab experience.
          </p>
        </header>
        <Separator className="mb-8" />
        <SettingsForm />
      </div>
    </div>
  );
}
