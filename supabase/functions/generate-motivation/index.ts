const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestBody {
  word: string;
  apiKey: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { word, apiKey }: RequestBody = await req.json();

    if (!word || !apiKey) {
      return new Response(
        JSON.stringify({ error: "Word and API key are required" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const prompt = `Generate 3 inspiring and motivational phrases related to the word "${word}". Make them uplifting, positive, and actionable. Return only the phrases, one per line, without numbering or bullet points.`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

    const geminiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      }),
    });

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.text();
      return new Response(
        JSON.stringify({ error: "Failed to generate phrases", details: errorData }),
        {
          status: geminiResponse.status,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const data = await geminiResponse.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No phrases generated";

    return new Response(
      JSON.stringify({ phrases: generatedText, word }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});