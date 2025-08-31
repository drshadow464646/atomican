
'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Palette, User, Sun, Moon, Laptop, Sparkles, Waves, Type } from 'lucide-react';

type Settings = {
  displayName: string;
  appearanceMode: 'light' | 'dark' | 'system';
  baseGradient: 'moon' | 'sunset' | 'dawn';
  uiMotionLevel: 'low' | 'medium' | 'high';
  typographyMode: 'default' | 'serif' | 'monospace';
};

export function SettingsForm() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const [settings, setSettings] = useState<Settings>({
    displayName: 'Astera',
    appearanceMode: 'system',
    baseGradient: 'moon',
    uiMotionLevel: 'medium',
    typographyMode: 'default',
  });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const savedSettings = localStorage.getItem('labSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);
  
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('labSettings', JSON.stringify(settings));
      setTheme(settings.appearanceMode);
      document.body.dataset.gradient = settings.baseGradient;

      if (settings.typographyMode === 'serif') {
        document.body.classList.remove('font-mono');
        document.body.classList.add('font-serif');
      } else if (settings.typographyMode === 'monospace') {
        document.body.classList.remove('font-serif');
        document.body.classList.add('font-mono');
      } else {
        document.body.classList.remove('font-serif', 'font-mono');
      }
    }
  }, [settings, isClient, setTheme]);
  
  const handleInputChange = (key: keyof Settings, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    localStorage.setItem('labSettings', JSON.stringify(settings));
    toast({
      title: 'Settings Saved',
      description: 'Your preferences have been updated and saved.',
    });
  };

  if (!isClient) {
    return null; // or a loading skeleton
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
             <User className="w-6 h-6" />
            <div>
              <CardTitle>Your Name</CardTitle>
              <CardDescription>
                This is how your name will appear on the leaderboard.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Input 
            value={settings.displayName} 
            onChange={e => handleInputChange('displayName', e.target.value)}
            placeholder="Enter display name" 
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Palette className="w-6 h-6" />
            <div>
              <CardTitle>Aesthetic & Interface</CardTitle>
               <CardDescription>
                Customize the look and feel of the application.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="flex flex-col md:flex-row justify-between md:items-center space-y-4 md:space-y-0">
            <div>
              <Label className="font-semibold text-base flex items-center gap-2"><Sparkles className="w-4 h-4" /> Appearance Mode</Label>
              <p className="text-sm text-muted-foreground">
                Choose between light and dark mode.
              </p>
            </div>
            <RadioGroup 
              value={settings.appearanceMode} 
              onValueChange={value => handleInputChange('appearanceMode', value)}
              className="flex gap-4"
            >
                <Label className="flex items-center gap-2 cursor-pointer rounded-md p-2 border border-transparent hover:border-border transition-colors">
                  <RadioGroupItem value="light" />
                  <Sun className="w-4 h-4" /> Light
                </Label>
                <Label className="flex items-center gap-2 cursor-pointer rounded-md p-2 border border-transparent hover:border-border transition-colors">
                  <RadioGroupItem value="dark" />
                  <Moon className="w-4 h-4" /> Dark
                </Label>
                <Label className="flex items-center gap-2 cursor-pointer rounded-md p-2 border border-transparent hover:border-border transition-colors">
                  <RadioGroupItem value="system" />
                  <Laptop className="w-4 h-4" /> System
                </Label>
            </RadioGroup>
          </div>
          <Separator />
          <div className="flex flex-col md:flex-row justify-between md:items-center space-y-4 md:space-y-0">
            <div>
                <Label className="font-semibold text-base flex items-center gap-2"><Sparkles className="w-4 h-4" /> Base Gradient</Label>
                <p className="text-sm text-muted-foreground">
                    Choose the background gradient for the app.
                </p>
            </div>
            <RadioGroup 
              value={settings.baseGradient}
              onValueChange={value => handleInputChange('baseGradient', value)}
              className="flex gap-4"
            >
                 <Label className="flex items-center gap-2 cursor-pointer rounded-md p-2 border border-transparent hover:border-border transition-colors">
                  <RadioGroupItem value="moon" />
                  <Moon className="w-4 h-4" /> Moon
                </Label>
                <Label className="flex items-center gap-2 cursor-pointer rounded-md p-2 border border-transparent hover:border-border transition-colors">
                  <RadioGroupItem value="sunset" />
                  <Sun className="w-4 h-4" /> Sunset
                </Label>
                <Label className="flex items-center gap-2 cursor-pointer rounded-md p-2 border border-transparent hover:border-border transition-colors">
                  <RadioGroupItem value="dawn" />
                  <Laptop className="w-4 h-4" /> Dawn
                </Label>
            </RadioGroup>
          </div>
          <Separator />
          <div className="flex flex-col md:flex-row justify-between md:items-center space-y-4 md:space-y-0">
            <div>
              <Label className="font-semibold text-base flex items-center gap-2"><Waves className="w-4 h-4" /> UI Motion Level</Label>
              <p className="text-sm text-muted-foreground">
                Adjust animation intensity. &apos;Low&apos; reduces most animations.
              </p>
            </div>
            <Select 
              value={settings.uiMotionLevel} 
              onValueChange={value => handleInputChange('uiMotionLevel', value)}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Select motion level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Separator />
          <div className="flex flex-col md:flex-row justify-between md:items-center space-y-4 md:space-y-0">
            <div>
              <Label className="font-semibold text-base flex items-center gap-2"><Type className="w-4 h-4" /> Typography Mode</Label>
              <p className="text-sm text-muted-foreground">
                Choose your preferred font style for the application.
              </p>
            </div>
            <Select 
              value={settings.typographyMode}
              onValueChange={value => handleInputChange('typographyMode', value)}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Select font style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default (Sans-serif)</SelectItem>
                <SelectItem value="serif">Serif</SelectItem>
                <SelectItem value="monospace">Monospace</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
