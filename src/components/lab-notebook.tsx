'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import type { LabLog } from '@/lib/experiment';

type LabNotebookProps = {
  logs: LabLog[];
};

export function LabNotebook({ logs }: LabNotebookProps) {
  return (
    <div className="mt-4">
      <h3 className="mb-2 text-lg font-semibold">Lab Notebook</h3>
      <ScrollArea className="h-64 w-full rounded-md border p-2">
        <div className="flex flex-col gap-2">
          {logs.slice().reverse().map((log) => (
            <div key={log.id} className="text-sm">
              <span className="text-muted-foreground mr-2">{log.timestamp}</span>
              <span>{log.text}</span>
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
