
'use server';

export interface Model {
  id: string;
  name: string;
}

export interface TestResult {
    data?: any;
    error?: string;
}

export async function fetchOpenRouterModels(): Promise<TestResult & { data?: Model[] }> {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { error: `HTTP error! status: ${response.status} - ${errorText}` };
    }

    const data = await response.json();
    return { data: data.data || [] };
  } catch (error: any) {
    console.error("Error fetching models from server action:", error);
    return { error: error.message || 'An unknown error occurred' };
  }
};

export async function testOpenRouterPost(): Promise<TestResult> {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "z-ai/glm-4.5-air:free",
        messages: [{ role: "user", content: "Hello" }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
        return { error: `API returned an error. Status: ${response.status}`, data };
    }

    return { data };
  } catch (error: any) {
    console.error("Error in testOpenRouterPost server action:", error);
    return { error: error.message || 'An unknown server error occurred' };
  }
}
