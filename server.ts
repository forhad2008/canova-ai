import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Helper to instantiate Gemini client with either request-provided user custom key or env key
function getGeminiClient(customApiKey?: string) {
  const apiKey = customApiKey?.trim() || process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 1. API route for Gemini conversational chat
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, systemInstruction, model, customApiKey } = req.body;
    const ai = getGeminiClient(customApiKey);

    if (!ai) {
      return res.status(200).json({
        fallback: true,
        message: 'No GEMINI_API_KEY configured. Fallback mode active.',
      });
    }

    // Format conversation history
    const contents = (messages || []).map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: model || 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction:
          systemInstruction ||
          'You are Canova AI, an ultra-smart, sleek executive AI work companion. Give structured, visually engaging, helpful, high-impact, and concise responses. Format key concepts cleanly with headings and lists when helpful.',
      },
    });

    const reply = response.text || 'I could not generate a response. Please try again.';
    return res.json({ text: reply, fallback: false });
  } catch (error: any) {
    console.error('Gemini API Chat Error:', error);
    return res.status(200).json({
      fallback: true,
      error: error.message || 'Gemini service temporarily unavailable',
    });
  }
});

// 2. Full-featured AI Work Tools execution endpoint
app.post('/api/ai/tool-execute', async (req, res) => {
  try {
    const { toolId, prompt, targetLang, customApiKey } = req.body;
    const ai = getGeminiClient(customApiKey);

    if (!ai) {
      return res.status(200).json({
        fallback: true,
        message: 'No GEMINI_API_KEY configured. Fallback mode active.',
      });
    }

    let systemInstruction = 'You are an expert AI work assistant.';
    let model = 'gemini-3.8-flash';
    let userPrompt = prompt;

    switch (toolId) {
      case 'code-assistant':
        systemInstruction =
          'You are a senior full-stack software engineer and system architect. Write clean, production-ready, type-safe code with comments, edge-case analysis, and performance considerations. Return formatted markdown with code blocks.';
        model = 'gemini-3.8-flash';
        break;
      case 'translator':
        systemInstruction = `You are a professional executive translator. Translate the text into ${targetLang || 'Japanese'} with natural business cadence, idiomatic accuracy, and contextual nuance. Provide phonetic pronunciation guide (e.g. Romaji/Pinyin) and cultural context if beneficial.`;
        break;
      case 'note-maker':
        systemInstruction =
          'You are an executive chief of staff. Convert raw notes, brainstorming thoughts, or meeting transcripts into high-impact, structured executive memos with: 1. Executive Summary, 2. Key Takeaways & Action Items, 3. Milestones & Timelines.';
        break;
      case 'web-search':
        systemInstruction =
          'You are an intelligence researcher. Synthesize fact-checked, structured market analysis, technology assessments, or data insights. Provide clear bullet points with practical next steps.';
        break;
      case 'image-gen':
        systemInstruction =
          'You are an award-winning creative art director and prompt engineer. Create an ultra-detailed, cinematic visual concept description, complete with lighting schemas, volumetric atmospheric smoke, color grades, and aspect ratio recommendations for photorealistic rendering.';
        break;
      case 'video-editor':
        systemInstruction =
          'You are an acclaimed motion designer and video director. Construct a detailed scene-by-scene storyboard with timing (seconds), camera angles, transitions, dynamic sound design, and color palettes.';
        break;
      default:
        systemInstruction = 'You are a high-performance productivity intelligence assistant.';
        break;
    }

    const response = await ai.models.generateContent({
      model,
      contents: userPrompt,
      config: {
        systemInstruction,
      },
    });

    return res.json({
      text: response.text || 'Process completed with empty response.',
      fallback: false,
    });
  } catch (error: any) {
    console.error('Gemini Tool Execute Error:', error);
    return res.status(200).json({
      fallback: true,
      error: error.message || 'Execution error encountered',
    });
  }
});

// 3. AI Task Breakdown Generator endpoint (Automates turning high level goals into tasks)
app.post('/api/ai/breakdown-tasks', async (req, res) => {
  try {
    const { goal, customApiKey } = req.body;
    const ai = getGeminiClient(customApiKey);

    if (!ai) {
      return res.status(200).json({
        fallback: true,
        tasks: [
          { title: `Research & plan: ${goal}`, category: 'Productivity', duration: '45 min' },
          { title: `Build core architecture: ${goal}`, category: 'Development', duration: '90 min' },
          { title: `Polish UI & verify deliverable: ${goal}`, category: 'Design', duration: '30 min' },
        ],
      });
    }

    const prompt = `Break down this work goal into 3 to 5 concrete actionable subtasks: "${goal}".
Return ONLY a valid JSON array of objects with the keys:
- title (concise task title)
- category ("Development" | "Design" | "Productivity" | "Search")
- duration (estimated time like "30 min" or "1 hour")
Do not enclose in markdown code fences if possible, or return parseable JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    let tasks = [];
    try {
      tasks = JSON.parse(response.text || '[]');
    } catch {
      tasks = [
        { title: `Plan & Outline: ${goal}`, category: 'Productivity', duration: '40 min' },
        { title: `Execute Phase 1: ${goal}`, category: 'Development', duration: '60 min' },
      ];
    }

    return res.json({ tasks, fallback: false });
  } catch (error: any) {
    console.error('Task breakdown error:', error);
    return res.status(200).json({
      fallback: true,
      tasks: [
        { title: `Plan sprint: ${req.body.goal || 'Work Project'}`, category: 'Productivity', duration: '45 min' },
        { title: `Review deliverables`, category: 'Design', duration: '30 min' },
      ],
    });
  }
});

// 4. API Key Verification test endpoint
app.post('/api/ai/verify-key', async (req, res) => {
  try {
    const { apiKey } = req.body;
    if (!apiKey) {
      return res.status(400).json({ valid: false, message: 'API key is required' });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: 'Respond with exactly the single word "VERIFIED".',
    });

    if (response.text?.includes('VERIFIED')) {
      return res.json({ valid: true, message: 'API Key authenticated successfully!' });
    }
    return res.json({ valid: true, message: 'Connection established.' });
  } catch (error: any) {
    return res.status(200).json({
      valid: false,
      message: error.message || 'Invalid API Key or quota exhausted',
    });
  }
});

// Vite middleware in development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Canova AI platform server running on port ${PORT}`);
  });
}

startServer();
