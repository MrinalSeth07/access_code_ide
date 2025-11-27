import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, language, stdin = "" } = await req.json();

    if (!code || !language) {
      throw new Error("Code and language are required");
    }

    // Map our language names to Piston API language names
    const languageMap: Record<string, string> = {
      python: "python",
      javascript: "javascript",
      cpp: "cpp",
    };

    const pistonLanguage = languageMap[language];
    if (!pistonLanguage) {
      throw new Error(`Unsupported language: ${language}`);
    }

    // Call Piston API
    const pistonResponse = await fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        language: pistonLanguage,
        version: "*",
        files: [
          {
            content: code,
          },
        ],
        stdin: stdin,
      }),
    });

    if (!pistonResponse.ok) {
      throw new Error(`Piston API error: ${pistonResponse.statusText}`);
    }

    const result = await pistonResponse.json();

    // Combine stdout and stderr
    let output = "";
    if (result.run?.stdout) {
      output += result.run.stdout;
    }
    if (result.run?.stderr) {
      if (output) output += "\n";
      output += result.run.stderr;
    }
    if (result.compile?.stderr) {
      if (output) output += "\n";
      output += "Compilation errors:\n" + result.compile.stderr;
    }

    return new Response(
      JSON.stringify({ 
        output: output || "Code executed successfully with no output",
        success: !result.run?.stderr && !result.compile?.stderr
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error executing code:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        output: `Error: ${errorMessage}`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
