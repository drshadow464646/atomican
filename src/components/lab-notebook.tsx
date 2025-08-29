'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import type { LabLog } from '@/lib/experiment';
import { cn } from '@/lib/utils';
import { Notebook, User } from 'lucide-react';

type LabNotebookProps = {
  logs: LabLog[];
};

export function LabNotebook({ logs }: LabNotebookProps) {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <h3 className="mb-2 font-medium flex items-center gap-2">
        <Notebook className="h-4 w-4" />
        Lab Notebook
      </h3>
      <ScrollArea className="flex-1 rounded-md border bg-muted/20 p-2">
        <div className="flex flex-col gap-2">
          {logs.slice().reverse().map((log) => (
            <div key={log.id} className={cn(
              "text-sm flex gap-2 items-start p-2 rounded-md",
               log.isCustom ? "bg-primary/10" : "bg-background/50"
            )}>
              {log.isCustom && <User className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />}
              <div className="flex-1">
                <span className="font-mono text-xs text-muted-foreground mr-2">{log.timestamp.toLocaleTimeString()}</span>
                <span>{log.text}</span>
              </div>
            </div>
          ))}
           {logs.length === 0 && (
            <p className="text-sm text-muted-foreground text-center p-4">Your experiment logs will appear here.</p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
