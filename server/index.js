import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Configurable Local AI / Remote AI settings
const LOCAL_AI_ENDPOINT = process.env.LOCAL_AI_ENDPOINT || 'http://localhost:11434'; // Default Ollama port
const LOCAL_AI_MODEL = process.env.LOCAL_AI_MODEL || 'llama3';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

app.use(cors());
app.use(express.json({ limit: '10mb' }));

/**
 * Health check endpoint reporting available AI providers
 */
app.get('/api/health', async (req, res) => {
  let isLocalAiReachable = false;
  try {
    const localCheck = await fetch(`${LOCAL_AI_ENDPOINT}/api/tags`, { signal: AbortSignal.timeout(1000) });
    if (localCheck.ok) isLocalAiReachable = true;
  } catch (_) {}

  res.json({
    status: 'ok',
    service: 'FridgeWise AI API',
    hasGeminiKey: Boolean(GEMINI_API_KEY),
    isLocalAiReachable,
    localAiEndpoint: LOCAL_AI_ENDPOINT,
    localAiModel: LOCAL_AI_MODEL
  });
});

/**
 * Helper to build recipe prompt
 */
function buildRecipePrompt(inventory, preferences) {
  const itemsSummary = inventory
    .filter(i => i.status !== 'consumed' && i.status !== 'discarded')
    .map(i => `- ${i.name} (${i.quantity || 1} ${i.unit || 'pcs'}, stored in ${i.location || 'fridge'}, urgency: ${i.urgency?.label || 'normal'})`)
    .join('\n');

  const cuisinePref = preferences.cuisine || 'Any/Indian or Global';
  const dietPref = preferences.diet || 'Vegetarian or flexible';
  const allergies = preferences.allergies || 'None declared';
  const targetServing = preferences.servings || 2;

  return `You are an expert zero-waste chef for FridgeWise AI.
The user wants to cook using ingredients they ALREADY OWN to eliminate food waste.
Prioritize ingredients marked as needing attention or urgent.
Exclude any user-declared allergens: ${allergies}.
Diet preference: ${dietPref}. Preferred cuisine: ${cuisinePref}. Target servings: ${targetServing}.

User's available inventory:
${itemsSummary}

Respond ONLY with valid JSON matching this exact structure (do NOT include markdown code blocks or backticks, just raw JSON):
{
  "recipes": [
    {
      "id": "ai-unique-id",
      "name": "Recipe Name",
      "description": "Short appetizing description",
      "cuisine": "Indian or Global",
      "diet": "Vegetarian or Non-vegetarian",
      "prepTimeMinutes": 10,
      "cookTimeMinutes": 20,
      "servings": 2,
      "whyRecommended": "Clear explanation of which urgent ingredients this rescues",
      "requiredIngredients": [
        { "name": "Ingredient Name", "keywords": ["keyword1"], "quantity": 200, "unit": "g", "optional": false }
      ],
      "instructions": [
        "Step 1 instruction...",
        "Step 2 instruction..."
      ],
      "substitutions": "Optional tips or substitutions"
    }
  ]
}`;
}

/**
 * AI Recipe Generation Endpoint
 * Multi-provider adapter:
 * 1. Checks Local AI (Ollama/LM Studio on LOCAL_AI_ENDPOINT)
 * 2. If not reachable, checks Google Gemini API
 * 3. Graceful fallback to built-in recipe engine
 */
app.post('/api/recipes/ai', async (req, res) => {
  try {
    const { inventory = [], preferences = {} } = req.body;

    if (!Array.isArray(inventory) || inventory.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide at least one active inventory item.'
      });
    }

    const promptText = buildRecipePrompt(inventory, preferences);

    // --- Provider 1: Attempt Local AI (Ollama / Local LLM) ---
    try {
      const localResponse = await fetch(`${LOCAL_AI_ENDPOINT}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: LOCAL_AI_MODEL,
          prompt: promptText,
          stream: false,
          format: 'json'
        }),
        signal: AbortSignal.timeout(12000) // 12s timeout for local model
      });

      if (localResponse.ok) {
        const localData = await localResponse.json();
        const rawOutput = localData.response;
        if (rawOutput) {
          const clean = rawOutput.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(clean);
          if (parsed.recipes && Array.isArray(parsed.recipes)) {
            return res.json({
              success: true,
              isAiGenerated: true,
              provider: `Local AI (${LOCAL_AI_MODEL})`,
              recipes: parsed.recipes
            });
          }
        }
      }
    } catch (_) {
      // Local AI not active or timed out, proceed to Remote / Gemini or Fallback
    }

    // --- Provider 2: Attempt Google Gemini API ---
    if (GEMINI_API_KEY) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        const geminiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: { temperature: 0.3, responseMimeType: 'application/json' }
          }),
          signal: AbortSignal.timeout(10000)
        });

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            const clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(clean);
            if (parsed.recipes && Array.isArray(parsed.recipes)) {
              return res.json({
                success: true,
                isAiGenerated: true,
                provider: 'Google Gemini 2.5 Flash',
                recipes: parsed.recipes
              });
            }
          }
        }
      } catch (geminiErr) {
        console.warn('Gemini API call failed:', geminiErr);
      }
    }

    // --- Provider 3: Fallback ---
    return res.json({
      success: false,
      fallback: true,
      message: 'Local AI and cloud API keys are currently offline. Displaying built-in verified rescue recipes.'
    });
  } catch (error) {
    console.error('AI Recipe endpoint error:', error);
    return res.json({
      success: false,
      fallback: true,
      message: 'Server error generating recipes. Using verified built-in templates.'
    });
  }
});

// Serve frontend dist if available (production mode)
const distPath = path.resolve(__dirname, '../dist');
app.use(express.static(distPath));

// Fallback SPA routing for production
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('FridgeWise AI API running. Start frontend using "npm run dev".');
    }
  });
});

app.listen(PORT, () => {
  console.log(`[FridgeWise AI] Server running on http://localhost:${PORT}`);
});
