// Backend: Gemini Mock Interview Service with Session Tracking and Response Parsing
// File: backend/geminiService.js

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables from .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY_1);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// In-memory chat session store (keyed by sessionId)
const chatSessions = {};

// Function to parse AI response using regex
function parseInterviewResponse(aiResponse) {
  const response = {
    feedback: null,
    improvedAnswer: null,
    nextQuestion: null,
    isFirstQuestion: false,
    rawResponse: aiResponse
  };

  // Check if it's the first question (no feedback section)
  const firstQuestionRegex = /\*\*Interview Question:\*\*\s*([\s\S]*?)(?=\*\*Instructions:\*\*|$)/i;
  const firstQuestionMatch = aiResponse.match(firstQuestionRegex);
  
  if (firstQuestionMatch) {
    response.isFirstQuestion = true;
    response.nextQuestion = firstQuestionMatch[1].trim();
    return response;
  }

  // Parse feedback section
  const feedbackRegex = /\*\*Feedback on Your Previous Answer:\*\*\s*([\s\S]*?)(?=\*\*Improved Answer Suggestion:\*\*|$)/i;
  const feedbackMatch = aiResponse.match(feedbackRegex);
  if (feedbackMatch) {
    response.feedback = feedbackMatch[1].trim();
  }

  // Parse improved answer section
  const improvedAnswerRegex = /\*\*Improved Answer Suggestion:\*\*\s*([\s\S]*?)(?=\*\*Next Interview Question:\*\*|$)/i;
  const improvedAnswerMatch = aiResponse.match(improvedAnswerRegex);
  if (improvedAnswerMatch) {
    response.improvedAnswer = improvedAnswerMatch[1].trim();
  }

  // Parse next question section
  const nextQuestionRegex = /\*\*Next Interview Question:\*\*\s*([\s\S]*?)$/i;
  const nextQuestionMatch = aiResponse.match(nextQuestionRegex);
  if (nextQuestionMatch) {
    response.nextQuestion = nextQuestionMatch[1].trim();
  }

  // Alternative parsing if the above doesn't work (fallback patterns)
  if (!response.nextQuestion) {
    // Try different question patterns
    const altQuestionPatterns = [
      /Question:\s*([\s\S]*?)(?=\n\n|$)/i,
      /\*\*Question:\*\*\s*([\s\S]*?)(?=\n\n|$)/i,
      /Next Question:\s*([\s\S]*?)(?=\n\n|$)/i
    ];
    
    for (const pattern of altQuestionPatterns) {
      const match = aiResponse.match(pattern);
      if (match) {
        response.nextQuestion = match[1].trim();
        break;
      }
    }
  }

  if (!response.improvedAnswer) {
    // Try alternative improved answer patterns
    const altImprovedPatterns = [
      /Improved Answer:\s*([\s\S]*?)(?=\*\*Next|Next|Question|$)/i,
      /\*\*Improved Answer:\*\*\s*([\s\S]*?)(?=\*\*Next|Next|Question|$)/i,
      /Better Response:\s*([\s\S]*?)(?=\*\*Next|Next|Question|$)/i
    ];
    
    for (const pattern of altImprovedPatterns) {
      const match = aiResponse.match(pattern);
      if (match) {
        response.improvedAnswer = match[1].trim();
        break;
      }
    }
  }

  return response;
}

// Function to clean up text (remove extra whitespace, markdown formatting)
function cleanText(text) {
  if (!text) return null;
  return text
    .replace(/\*\*/g, '') // Remove bold markdown
    .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines with double newlines
    .trim();
}

// Endpoint: POST /ask
app.post('/ask', async (req, res) => {
  const { sessionId, jobTitle, jobDescription, userAnswer, isFirstQuestion } = req.body;

  if (!sessionId || !jobTitle || !jobDescription) {
    return res.status(400).json({ 
      error: 'Missing required fields: sessionId, jobTitle, jobDescription' 
    });
  }

  try {
    // Create new session if not existing
    if (!chatSessions[sessionId]) {
      chatSessions[sessionId] = model.startChat({
        history: [
          {
            role: 'user',
            parts: [
              { text: `You are an AI Mock Interview Conductor for the position: ${jobTitle}` },
              { text: `Job Description: ${jobDescription}` },
              { text: `
                You are an AI Mock Interview Conductor. Your role is to conduct a professional, structured interview simulation.

                INTERVIEW PROCESS:
                1. FIRST INTERACTION: Ask ONE relevant interview question based on the job role
                2. SUBSEQUENT INTERACTIONS: 
                   - Provide constructive feedback on the previous answer
                   - Ask the next relevant interview question

                RESPONSE FORMAT - FOLLOW THIS EXACTLY:
                For First Question:
                **Interview Question:**
                [Your question here]

                **Instructions:** Please provide your answer, and I'll give you feedback along with the next question.

                For Follow-up Responses:
                **Feedback on Your Previous Answer:**
                [Constructive feedback - what was good, what could be improved]

                **Improved Answer Suggestion:**
                [A better version of their answer or specific improvements]

                **Next Interview Question:**
                [Next relevant question]

                GUIDELINES:
                - Ask questions directly relevant to the job role and requirements
                - Provide specific, actionable feedback
                - Progress from basic to more complex questions
                - Include technical, behavioral, and situational questions
                - Keep feedback constructive and encouraging
                - Cover 8-12 questions total
                - ALWAYS follow the exact format above

                Begin the mock interview by asking your first question.
              ` }
            ]
          }
        ]
      });
    }

    // Get the chat session
    const chatSession = chatSessions[sessionId];
    let result;

    if (isFirstQuestion) {
      // For first question, ask AI to start
      result = await chatSession.sendMessage("Start the interview with your first question.");
    } else {
      // For subsequent questions, send user's answer
      if (!userAnswer) {
        return res.status(400).json({ error: 'userAnswer is required for follow-up questions' });
      }
      result = await chatSession.sendMessage(userAnswer);
    }

    const response = await result.response;
    const aiResponseText = response.text();
    
    console.log('Raw Gemini Response:', aiResponseText);

    // Parse the response using regex
    const parsedResponse = parseInterviewResponse(aiResponseText);
    
    // Clean up the parsed text
    const cleanedResponse = {
      feedback: cleanText(parsedResponse.feedback),
      improvedAnswer: cleanText(parsedResponse.improvedAnswer),
      nextQuestion: cleanText(parsedResponse.nextQuestion),
      isFirstQuestion: parsedResponse.isFirstQuestion,
      rawResponse: aiResponseText,
      sessionId: sessionId
    };

    console.log('Parsed Response:', cleanedResponse);

    res.json(cleanedResponse);

  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: 'Something went wrong with the interview service' });
  }
});

// Endpoint to get session info
app.get('/session/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const sessionExists = !!chatSessions[sessionId];
  res.json({ sessionExists, sessionId });
});

// Endpoint to delete/reset session
app.delete('/session/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  if (chatSessions[sessionId]) {
    delete chatSessions[sessionId];
    res.json({ message: 'Session deleted successfully', sessionId });
  } else {
    res.status(404).json({ error: 'Session not found', sessionId });
  }
});

// Health check
app.get('/', (req, res) => {
  res.send('Mock Interview Backend connected successfully');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;