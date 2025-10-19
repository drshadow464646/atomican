
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import { fetchOpenRouterModels, testOpenRouterPost, type Model, type TestResult } from '@/app/model-test-actions';

type TestStatus = 'idle' | 'loading' | 'success' | 'error';

export default function ModelTestPage() {
  const [modelList, setModelList] = useState<Model[]>([]);
  const [listStatus, setListStatus] = useState<TestStatus>('idle');
  const [primaryModelFound, setPrimaryModelFound] = useState<boolean | null>(null);
  const [secondaryModelFound, setSecondaryModelFound] = useState<boolean | null>(null);

  const [postStatus, setPostStatus] = useState<TestStatus>('idle');
  const [postResponse, setPostResponse] = useState<TestResult | null>(null);

  const primaryModelId = "z-ai/glm-4.5-air:free";
  const secondaryModelId = "cognitivecomputations/dolphin-mistral-24b-venice-edition:free";

  const fetchModels = async () => {
    setListStatus('loading');
    setPrimaryModelFound(null);
    setSecondaryModelFound(null);
    try {
      const result = await fetchOpenRouterModels();
      if(result.error) {
        throw new Error(result.error);
      }
      
      const models = result.data || [];
      setModelList(models);

      setPrimaryModelFound(models.some(model => model.id === primaryModelId));
      setSecondaryModelFound(models.some(model => model.id === secondaryModelId));
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
      const result = await testOpenRouterPost();
      setPostResponse(result);
      if(result.error) {
        setPostStatus('error');
      } else {
        setPostStatus('success');
      }
    } catch (error: any) {
      setPostStatus('error');
      setPostResponse({ error: error.message });
      console.error("Error testing POST:", error);
    }
  };

  useEffect(() => {
    fetchModels();
    testPost();
  }, []);

  const StatusIcon = ({ status }: { status: TestStatus }) => {
    if (status === 'loading') return <Loader2 className="h-5 w-5 animate-spin" />;
    if (status === 'success') return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (status === 'error') return <XCircle className="h-5 w-5 text-destructive" />;
    return <HelpCircle className="h-5 w-5 text-muted-foreground" />;
  };

  const ModelStatusCheck = ({ found, name }: { found: boolean | null, name: string }) => {
    if (found === null) return null;
    return (
        <div className="mt-4 flex items-center space-x-3 p-4 bg-muted/50 rounded-md">
            {found ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-destructive" />}
            <p>
                Model <strong>{name}</strong> was {found ? '' : 'not'} found in the list.
            </p>
        </div>
    );
  };

  return (
    <div className="min-h-screen bg-transparent text-foreground p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-glow">OpenRouter Model Test</h1>
          <p className="text-muted-foreground mt-2 text-md md:text-lg">
            Diagnosing model availability for your API key. Tests run automatically on page load.
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
               <Button onClick={fetchModels} disabled={listStatus === 'loading'} variant="outline">
                {listStatus === 'loading' ? 'Checking...' : 'Check Again'}
              </Button>
            </div>
            {listStatus === 'success' && (
              <>
                <ModelStatusCheck found={primaryModelFound} name={primaryModelId} />
                <ModelStatusCheck found={secondaryModelFound} name={secondaryModelId} />
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Test Chat Completions (POST)</CardTitle>
            <CardDescription>
              This attempts to send a simple &quot;Hello&quot; message to the model via a secure server action.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <div className="flex items-center space-x-3 p-4 bg-muted rounded-md mb-4">
              <StatusIcon status={postStatus} />
              <div className="flex-1">
                {postStatus === 'loading' && <p>Sending request...</p>}
                {postStatus === 'success' && <p>Received a successful response!</p>}
                {postStatus === 'error' && <p>Test failed or returned an error.</p>}
                {postStatus === 'idle' && <p>Ready to test.</p>}
              </div>
               <Button onClick={testPost} disabled={postStatus === 'loading'}>
                {postStatus === 'loading' ? 'Testing...' : 'Test Again'}
              </Button>
            </div>
            {postResponse && (
                <div className="mt-4 p-4 bg-muted/50 rounded-md text-sm">
                    <p className="font-semibold">Raw JSON Response:</p>
                    <pre className="whitespace-pre-wrap break-all text-xs mt-2">
                      {JSON.stringify(postResponse, null, 2)}
                    </pre>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
