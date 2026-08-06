import { GoogleGenerativeAI } from "@google/generative-ai";
import config from "../config/config.js";

// Initialize Gemini client if API key is present
let genAI = null;
if (config.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
}

/**
 * Ensures Gemini is configured before running queries.
 */
function checkAIClient() {
  if (!genAI) {
    throw new Error(
      "GEMINI_API_KEY is not configured on the backend. Please add GEMINI_API_KEY=your_key to your Backend .env file."
    );
  }
}

/**
 * Generates AI Complete Step-by-Step Video Notes for a video.
 * @param {string} videoTitle 
 * @param {string} transcriptText 
 * @returns {Promise<string>}
 */
export async function generateSummary(videoTitle, transcriptText) {
  checkAIClient();
  const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });

  let prompt = "";
  if (transcriptText && transcriptText.trim().length > 0) {
    prompt = `
You are an elite educational AI assistant and expert note-taker. 
Your task is to transform the provided YouTube video transcript into **AI Complete Step-by-Step Video Notes**. 

CRITICAL DIRECTIVES:
1. DO NOT INCLUDE timestamps (such as [01:23] or [MM:SS]). Focus purely on textbook-quality content, clean explanations, and structured layout.
2. Ensure EVERY single topic and concept discussed in the video is fully covered topic-by-topic so a student can completely revise the video using these notes alone.
3. Use clean Markdown with clear headings, bullet points, bold key terms, blockquotes for important tips, and syntax-highlighted code blocks.

Video Title: "${videoTitle}"

Transcript text:
"""
${transcriptText}
"""

Please format your response strictly using Markdown with the following exact section headers (so automated section filtering works seamlessly):

# 🎓 AI Complete Video Notes: ${videoTitle}

## 📌 1. Executive Summary & Core Objectives
- Write a 3-4 sentence comprehensive overview explaining the core theme, target audience, and key goals of this lesson.
- List 3 primary learning outcomes.

## 🎯 2. Essential Key Takeaways & Core Rules
- Provide 4-6 high-impact bullet points summarizing the most critical rules, concepts, or formulas taught in this video.

## 📋 3. Comprehensive Topic-by-Topic Breakdown
Break down the video content into distinct, logical topics in sequential order. 
For EACH topic discussed in the video:
- Use a clear header: ### Topic: [Name of Topic]
- Provide a thorough, step-by-step detailed explanation of what was taught under this topic.
- Include complete code snippets, terminal commands, or structured bullet points.
- Add a blockquote (> 💡 **Pro-Tip / Key Note:** ...) highlighting best practices or common pitfalls for this topic.

## 💡 4. Technical Terms & Revision Cheat Sheet
- Create a Markdown table or definition list defining every technical term, command, function, or framework mentioned in the video.

## 🛠️ 5. Hands-on Practice & Code Exercises
- Provide a practical hands-on challenge, code exercise, or self-directed project based directly on the video contents. Include complete code solutions or starter templates.

## ❓ 6. Active Recall & Self-Check Questions
- Provide 4 test-your-knowledge questions with answers to help students test their memory during revision.

Tone: Clear, encouraging, textbook-quality, and extremely comprehensive.
`;
  } else {
    // Fallback if transcript isn't available
    prompt = `
You are an expert educational AI tutor. The student requested complete video notes for "${videoTitle}", but video captions were not directly available.

Please generate a comprehensive, structured Markdown revision guide and topic-by-topic notes based *only* on the video title.

DO NOT include timestamps. Ensure maximum clarity, code examples, and structured layout.

# 🎓 AI Complete Video Notes: ${videoTitle}
*(Generated based on topic & video title)*

## 📌 1. Executive Summary & Core Objectives
- Overview of expected concepts for "${videoTitle}".

## 🎯 2. Essential Key Takeaways & Core Rules
- Key principles and foundational concepts to master.

## 📋 3. Comprehensive Topic-by-Topic Breakdown
- ### Topic: Foundational Setup & Architecture
  Detailed explanations and best practices.
- ### Topic: Core Implementation & Key Concepts
  Full explanation and sample code blocks.
- ### Topic: Advanced Techniques & Pitfalls
  Common errors and how to avoid them.

## 💡 4. Technical Terms & Revision Cheat Sheet
- Technical definitions and quick reference terms.

## 🛠️ 5. Hands-on Practice & Code Exercises
- Practice exercise with step-by-step instructions.

## ❓ 6. Active Recall & Self-Check Questions
- 4 self-assessment revision questions with answers.
`;
  }

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

/**
 * Handles interactive tutor chat.
 * @param {object} params
 * @param {string} params.videoTitle
 * @param {string} params.transcriptText
 * @param {string} params.notesText
 * @param {Array} params.chatHistory - Array of { role: 'user'|'assistant', content: string }
 * @param {string} params.userPrompt
 * @returns {Promise<string>}
 */
export async function chatWithTutor({ videoTitle, transcriptText, notesText, chatHistory, userPrompt }) {
  checkAIClient();

  const systemInstruction = `
You are "Shyoran AI Tutor", a helpful, highly knowledgeable, and friendly academic learning assistant. 
Your goal is to answer the student's questions regarding their course video.
You have access to the video transcript and the student's personal study notes for context. 

Guidelines:
1. Be encouraging, clear, and academic yet approachable.
2. Use the provided transcript and the student's notes as your primary source of truth.
3. If the answer is not in the transcript or notes, use your general knowledge to answer, but clarify that you are expanding beyond the video contents.
4. If code is requested, provide clean, well-commented code blocks.
5. Format your answers beautifully using Markdown.
6. Keep your responses focused and concise—avoid overly wordy explanations unless the student asks for a deep dive.
`;

  const model = genAI.getGenerativeModel({
    model: "gemini-3.1-flash-lite",
    systemInstruction,
  });

  // Build the initial context as a system introduction in history or as part of the prompt
  const hasTranscript = transcriptText && transcriptText.trim().length > 0;
  const hasNotes = notesText && notesText.trim().length > 0;

  const contextMessage = `
[CONTEXT FOR THIS CONVERSATION]
Active Video: "${videoTitle}"
${hasTranscript ? `Video Transcript: """\n${transcriptText.substring(0, 40000)}\n"""` : "Video Transcript: [Unavailable]"}
${hasNotes ? `Student's Personal Notes: """\n${notesText}\n"""` : "Student's Personal Notes: [None written yet]"}
`;

  // Map chatHistory to Gemini API format. 
  // We prepend the context message as a user/model interaction or inject it into the history
  const formattedHistory = [
    {
      role: "user",
      parts: [{ text: `Here is the context for our learning session:\n${contextMessage}\nPlease acknowledge that you have read this context.` }]
    },
    {
      role: "model",
      parts: [{ text: `I have received the context for the video "${videoTitle}". I am ready to assist you. Ask me anything about the content, code, or concept, and I'll guide you through it!` }]
    }
  ];

  // Add the actual conversation history
  if (chatHistory && Array.isArray(chatHistory)) {
    chatHistory.forEach(msg => {
      // Avoid duplicate context setup if they sent it
      formattedHistory.push({
        role: msg.role === "assistant" || msg.role === "model" ? "model" : "user",
        parts: [{ text: msg.content }]
      });
    });
  }

  const chat = model.startChat({
    history: formattedHistory
  });

  const result = await chat.sendMessage(userPrompt);
  const response = await result.response;
  return response.text();
}

/**
 * Generates an array of flashcards for active recall.
 * @param {string} videoTitle 
 * @param {string} transcriptText 
 * @returns {Promise<Array>}
 */
export async function generateFlashcards(videoTitle, transcriptText) {
  checkAIClient();
  const model = genAI.getGenerativeModel({
    model: "gemini-3.1-flash-lite",
    generationConfig: { responseMimeType: "application/json" }
  });

  const prompt = `
You are an expert study assistant. Based on the video "${videoTitle}", generate 5-8 educational flashcards for study.
Return a JSON array of objects. Each object MUST have:
- "front": A clear, concise question or prompt (1 sentence max).
- "back": A clear, informative answer or explanation (1-2 sentences).

Focus on key concepts, vocabulary, code techniques, or definitions from the video content.
Here is the transcript:
"""
${transcriptText || "[No transcript available, base flashcards on title]"}
"""
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  try {
    return JSON.parse(text);
  } catch (err) {
    console.error("Failed to parse flashcards JSON:", text);
    throw new Error("Failed to parse AI generated flashcards.");
  }
}

/**
 * Generates an array of multiple-choice questions for quizzes.
 * @param {string} videoTitle 
 * @param {string} transcriptText 
 * @returns {Promise<Array>}
 */
export async function generateQuiz(videoTitle, transcriptText) {
  checkAIClient();
  const model = genAI.getGenerativeModel({
    model: "gemini-3.1-flash-lite",
    generationConfig: { responseMimeType: "application/json" }
  });

  const prompt = `
You are an expert tutor. Based on the video "${videoTitle}", generate 5 multiple choice questions (MCQs) to test the student's understanding.
Return a JSON array of objects. Each object MUST have:
- "question": The question text.
- "options": An array of exactly 4 choices/options.
- "correctAnswerIndex": The 0-based index of the correct option (0, 1, 2, or 3).
- "explanation": A brief explanation of why this answer is correct and why the others are incorrect.

Focus on testing comprehension, not trivial details.
Here is the transcript:
"""
${transcriptText || "[No transcript available, base quiz on title]"}
"""
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  try {
    return JSON.parse(text);
  } catch (err) {
    console.error("Failed to parse quiz JSON:", text);
    throw new Error("Failed to parse AI generated quiz.");
  }
}

