// Enhanced Detectify AI Backend - The Ultimate AI Education Game
// Features: Diverse AI topics, difficulty progression, structured responses, local storage
// How to run:
// 1) Install Node.js (https://nodejs.org)
// 2) In this folder, run: npm init -y
// 3) Install deps: npm install express cors dotenv node-fetch@2
// 4) Create a .env file (copy .env.example) and set OPENAI_API_KEY
// 5) Start server: node server.js
// 6) Open http://localhost:3000 in your browser

const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fetch = require('node-fetch');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

// IMPORTANT: Do NOT commit your real API key.
// Put it in .env like:
// OPENAI_API_KEY=sk-REPLACE_WITH_YOUR_KEY

if (!OPENAI_API_KEY) {
  console.warn('[WARN] OPENAI_API_KEY is not set. Endpoints will fail until you add it to .env');
}

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Serve frontend
app.use(express.static(__dirname));

// Root route - serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Enhanced AI Topics for Diverse Learning
const AI_TOPICS = [
  'Temperature', 'Inference', 'Feature engineering', 'Hallucinations', 'Overfitting',
  'Adversarial attacks', 'Latent space', 'Explainable AI', 'Privacy', 'Bias in models',
  'Human in the loop', 'Transparency', 'Accountability', 'Recognising AI in everyday life',
  'Data quality', 'AI is probabilistic', 'Attention in Transformer models',
  'Zero-shot and few-shot learning', 'Responsible use of AI', 'Context window'
];

// Difficulty progression system
function getDifficulty(questionNumber) {
  if (questionNumber <= 3) return 'easy';
  if (questionNumber <= 6) return 'moderate';
  if (questionNumber <= 9) return 'hard';
  return 'extreme';
}

// Enhanced OpenAI API helpers
async function callChatCompletions(messages, temperature = 0.7) {
  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      temperature,
      response_format: { type: "json_object" }
    }),
  });
  
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`OpenAI chat error ${resp.status}: ${text}`);
  }
  
  const data = await resp.json();
  return data;
}

async function callDalle3Image(prompt) {
  const resp = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt,
      size: '1024x1024',
      n: 1,
    }),
  });
  
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`OpenAI image error ${resp.status}: ${text}`);
  }
  
  const data = await resp.json();
  const url = data?.data?.[0]?.url || '';
  return url;
}

// Enhanced question generation with diverse AI topics
app.post('/api/question', async (req, res) => {
  try {
    const { case_type = 'ai-choice', question_number = 1 } = req.body;
    
    const difficulty = getDifficulty(question_number);
    const selectedTopic = AI_TOPICS[Math.floor(Math.random() * AI_TOPICS.length)];
    
        const system = {
            role: "system",
            content: `You are an expert AI educator creating questions for "Detectify AI — Understanding AI Concepts" for children in Years 7-10 (Australian NSW curriculum level). 

            Create a ${difficulty} difficulty question about "${selectedTopic}" that tests understanding of AI concepts appropriate for 12-16 year old students.

            CRITICAL:
            - The correct answer must be UNAMBIGUOUSLY correct. 
            - The "correct" field must be the exact index (0–3) of the correct option from the "options" array. 
            - Double-check that the correct index matches the best answer.
            - Use age-appropriate language and examples suitable for Years 7-10 NSW students.

            IMPORTANT: Return ONLY valid JSON in this exact format:
            {
              "id": "unique_id_${Date.now()}",
              "topic": "${selectedTopic}",
              "difficulty": "${difficulty}",
              "question": "Clear, specific question about the AI concept",
              "options": [
                {
                  "label": "Short answer option",
                  "explanation": "Brief explanation of what this option means and why it's relevant"
                },
                {
                  "label": "Short answer option",
                  "explanation": "Brief explanation of what this option means and why it's relevant"
                },
                {
                  "label": "Short answer option",
                  "explanation": "Brief explanation of what this option means and why it's relevant"
                },
                {
                  "label": "Short answer option",
                  "explanation": "Brief explanation of what this option means and why it's relevant"
                }
              ],
              "correct": <index_of_correct_option>,
              "explanations": {
                "if_correct": "Teacher-style explanation that congratulates the student, shows how this concept appears in real life, and encourages them to apply it in other examples.",
                "if_incorrect": "Teacher-style explanation that gently explains why their choice is wrong, gives the correct answer, and shows how to think about this next time."
              },
              "case_type": "${case_type}"
            }

            Guidelines:
            - Make questions practical and relatable to real AI applications that Years 7-10 students encounter
            - Use examples from social media, gaming, streaming services, and school technology
            - The correct answer must be UNAMBIGUOUSLY the best choice
            - Make distractors plausible but clearly inferior
            - For bias questions, focus on obvious bias scenarios relevant to teenagers
            - For technical topics, use accessible language suitable for NSW curriculum levels
            - Avoid overly complex jargon - explain technical terms in simple ways
            - Difficulty should match the question number (${question_number}) and student age group
            - Make explanations educational, engaging, and relatable to teenage experiences
            - Use Australian spelling and terminology where appropriate
            - Explanations must be concise but informative (1–2 sentences max)`
        };

    const user = {
      role: "user",
      content: `Generate a ${difficulty} question about "${selectedTopic}" for question ${question_number}.`
    };

    const data = await callChatCompletions([system, user]);
    const content = data.choices?.[0]?.message?.content || '{}';
    
    // Parse and validate the response
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      // Try to extract JSON from code fences
      const match = content.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : {};
    }
    

    // Enhanced validation and fallback
    const result = {
      id: parsed.id || `q_${Date.now()}`,
      topic: parsed.topic || selectedTopic,
      difficulty: parsed.difficulty || difficulty,
      question: parsed.question || `What do you know about ${selectedTopic}?`,
      options: Array.isArray(parsed.options) && parsed.options.length === 4 ? 
        parsed.options.map(opt => {
          // Handle both string and object formats
          if (typeof opt === 'string') {
            return {
              label: opt,
              explanation: `This option: ${opt}`
            };
          } else {
            return {
              label: opt.label || opt,
              explanation: opt.explanation || `This option: ${opt.label || opt}`
            };
          }
        }) : [
          { label: 'Option A', explanation: 'This is the first option.' },
          { label: 'Option B', explanation: 'This is the second option.' },
          { label: 'Option C', explanation: 'This is the third option.' },
          { label: 'Option D', explanation: 'This is the fourth option.' }
        ],
      correct: typeof parsed.correct === 'number' && parsed.correct >= 0 && parsed.correct < 4 ? 
        parsed.correct : 0,
      explanations: {
        if_correct: parsed.explanations?.if_correct || 'Great job! You understand this AI concept well.',
        if_incorrect: parsed.explanations?.if_incorrect || 'Not quite right. Let\'s learn from this mistake and try to think about it differently next time.'
      },
      case_type: case_type
    };

    res.json(result);
  } catch (err) {
    console.error('Error generating question:', err);
    res.status(500).json({ error: 'Failed to generate question' });
  }
});

// Image generation endpoint (keeping for compatibility)
app.post('/api/image', async (req, res) => {
  try {
    const { image_prompt } = req.body || {};
    if (!image_prompt) {
      return res.status(400).json({ error: 'image_prompt required' });
    }
    const url = await callDalle3Image(image_prompt);
    res.json({ url });
  } catch (err) {
    console.error('Error generating image:', err);
    res.status(500).json({ error: 'Failed to generate image' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    topics: AI_TOPICS.length,
    api_key_configured: !!OPENAI_API_KEY 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Enhanced Detectify AI Server running on http://localhost:${PORT}`);
  console.log(`📚 Supporting ${AI_TOPICS.length} AI topics with difficulty progression`);
  console.log(`🔑 API Key configured: ${!!OPENAI_API_KEY}`);
});