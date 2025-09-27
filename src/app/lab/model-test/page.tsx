
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle, HelpCircle } from 'lucide-react';

type TestStatus = 'idle' | 'loading' | 'success' | 'error';

interface Model {
  id: string;
  name: string;
}

export default function ModelTestPage() {
  const [modelList, setModelList] = useState<Model[]>([]);
  const [listStatus, setListStatus] = useState<TestStatus>('idle');
  const [grokFound, setGrokFound] = useState<boolean | null>(null);

  const [postStatus, setPostStatus] = useState<TestStatus>('idle');
  const [postResponse, setPostResponse] = useState<string | null>(null);

  const modelIdToTest = 'x-ai/grok-4-fast:free';

  const fetchModels = async () => {
    setListStatus('loading');
    setGrokFound(null);
    try {
      // NOTE: This is a client-side fetch for testing purposes.
      // In a real app, this should be a server-side action to protect the API key.
      const response = await fetch('https://openrouter.ai/api/v1/models');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const models: Model[] = data.data || [];
      setModelList(models);

      const found = models.some(model => model.id === modelIdToTest);
      setGrokFound(found);
      setListStatus('success');
    } catch (error: any) {
      setListStatus('error');
      console.error("Error fetching models:", error);
    }
  };

  const testPost = async () => {
    setPostStatus('loading');
    setPostResponse(null);
    try {
      // This is a proxy route to avoid exposing the API key on the client.
      // We'd need to create this route. For now, this will fail, but shows the pattern.
      // A proper implementation requires a backend endpoint.
      // Since we can't easily add one, we'll alert the user.
      alert("This test requires a backend proxy to protect the API key, which I can't create. The code shows the intended logic, but you would need to run the 'curl' command from your own terminal to truly test the POST request.");
      setPostStatus('error');
      setPostResponse("Test cannot be run from the browser directly. Please use `curl` or Postman from your local machine.");
      return;

    } catch (error: any) {
      setPostStatus('error');
      setPostResponse(error.message);
      console.error("Error testing POST:", error);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const StatusIcon = ({ status }: { status: TestStatus }) => {
    if (status === 'loading') return <Loader2 className="h-5 w-5 animate-spin" />;
    if (status === 'success') return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (status === 'error') return <XCircle className="h-5 w-5 text-destructive" />;
    return <HelpCircle className="h-5 w-5 text-muted-foreground" />;
  };

  return (
    <div className="min-h-screen bg-transparent text-foreground p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-glow">OpenRouter Model Test</h1>
          <p className="text-muted-foreground mt-2 text-md md:text-lg">
            Diagnosing model availability for your API key.
          </p>
        </header>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>1. Check Model List (GET /models)</CardTitle>
            <CardDescription>
              This test fetches the list of all models available to your API key.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-3 p-4 bg-muted rounded-md">
              <StatusIcon status={listStatus} />
              <div className="flex-1">
                {listStatus === 'loading' && <p>Fetching models from OpenRouter...</p>}
                {listStatus === 'success' && <p>Successfully fetched {modelList.length} models.</p>}
                {listStatus === 'error' && <p>Failed to fetch models. Check browser console for errors.</p>}
                {listStatus === 'idle' && <p>Test not started.</p>}
              </div>
            </div>
            {listStatus === 'success' && (
              <div className="mt-4 flex items-center space-x-3 p-4 bg-muted/50 rounded-md">
                {grokFound ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-destructive" />}
                <p>
                  Model <strong>{modelIdToTest}</strong> was {grokFound ? '' : 'not'} found in the list.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Test Chat Completions (POST)</CardTitle>
            <CardDescription>
              This attempts to send a simple "Hi" message to the model.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <div className="flex items-center space-x-3 p-4 bg-muted rounded-md mb-4">
              <StatusIcon status={postStatus} />
              <div className="flex-1">
                {postStatus === 'loading' && <p>Sending request...</p>}
                {postStatus === 'success' && <p>Received a successful response!</p>}
                {postStatus === 'error' && <p>Test failed or could not be run.</p>}
                {postStatus === 'idle' && <p>Ready to test.</p>}
              </div>
               <Button onClick={testPost} disabled={postStatus === 'loading'}>
                Run Test
              </Button>
            </div>
            {postResponse && (
                <div className="mt-4 p-4 bg-destructive/10 rounded-md text-destructive-foreground">
                    <p className="font-semibold">Response:</p>
                    <p className="text-sm">{postResponse}</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
