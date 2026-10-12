import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));

// Initialize Google GenAI client if GEMINI_API_KEY is available
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// API Health Check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasGemini: !!aiClient,
  });
});

// Server-side Gemini Chat & Coaching endpoint
app.post('/api/ai/chat', async (req, res) => {
  try {
    if (!aiClient) {
      if (process.env.GEMINI_API_KEY) {
        aiClient = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY,
          httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
        });
      } else {
        return res.status(400).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
      }
    }

    const { messages, systemInstruction } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Missing or invalid messages array.' });
    }

    // Format contents for generateContent
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: systemInstruction || 'You are Speakly, an empathetic, encouraging English speaking coach for Bangla-speaking learners. Provide concise, clear feedback with Bangla explanations when helpful.',
      },
    });

    const reply = response.text || '';
    return res.json({ text: reply });
  } catch (error: any) {
    console.error('Gemini chat error:', error);
    return res.status(500).json({ error: error.message || 'Internal AI error' });
  }
});

// Server-side Audio Transcription endpoint (fallback for non-Chrome or failed Web Speech)
app.post('/api/ai/transcribe', async (req, res) => {
  try {
    if (!aiClient) {
      if (process.env.GEMINI_API_KEY) {
        aiClient = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY,
          httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
        });
      } else {
        return res.status(400).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
      }
    }

    const { audioBase64, mimeType } = req.body;
    if (!audioBase64) {
      return res.status(400).json({ error: 'Missing audio data.' });
    }

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType || 'audio/webm',
              data: audioBase64,
            },
          },
          { text: 'Transcribe the spoken English accurately. Return only the transcription without extra commentary or markdown formatting.' },
        ],
      },
    });

    const text = (response.text || '').trim();
    return res.json({ text });
  } catch (error: any) {
    console.error('Gemini transcribe error:', error);
    // If gemini-3.5-transcribe fails or isn't enabled, fallback to gemini-3.8-flash
    try {
      const { audioBase64, mimeType } = req.body;
      const fallbackResponse = await aiClient!.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: mimeType || 'audio/webm',
                data: audioBase64,
              },
            },
            { text: 'Transcribe the user audio in plain text. Return just the transcribed English words.' },
          ],
        },
      });
      return res.json({ text: (fallbackResponse.text || '').trim() });
    } catch (fbErr: any) {
      return res.status(500).json({ error: error.message || 'Transcription failed' });
    }
  }
});

// Mount Vite middleware in development or serve static in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Speakly Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
