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
You are an elite educational AI tutor and expert note-taker. 
Your task is to transform the provided YouTube video transcript into **Simple, Easy-to-Understand Detailed Sequential Notes**. 

CRITICAL DIRECTIVES:
1. STRICT CONTENT FOCUS: Focus ONLY on creating comprehensive, detailed notes of the actual video content. DO NOT include extraneous meta information about the video (such as target audience overviews, executive summaries, reviews of the video, active recall quiz questions, or invented practice assignments).
2. SIMPLE & EASY TO UNDERSTAND: Write in crystal-clear, beginner-friendly, simple language. Avoid dense academic jargon or overly complicated phrasing. Break down complex ideas into simple step-by-step explanations, bite-sized bullet points, and plain-English logic so anyone can master the material effortlessly.
3. STRICT SEQUENCE: Present the notes in the EXACT chronological sequence that the concepts, steps, and topics are taught in the video transcript from beginning to end.
4. NO TIMESTAMPS: Do NOT include timestamps (such as [01:23] or [MM:SS]). Focus purely on clean, highly readable layout.
5. THOROUGH & COMPLETE: Ensure EVERY single concept, rule, formula, code snippet, or command discussed in the video is fully explained in simple terms step-by-step in sequence so a student can learn and revise the lesson using these notes alone.
6. FORMATTING: Use clean Markdown with clear section headers, bullet points, bold key terms, blockquotes (> 💡 **Simple Takeaway:** ...), and syntax-highlighted code blocks with helpful comments.

Video Title: "${videoTitle}"

Transcript text:
"""
${transcriptText}
"""

Please format your response strictly using Markdown with the following structured sequential layout:

# 🎓 Detailed Video Notes: ${videoTitle}

## 📋 1. Chronological Topic-by-Topic Detailed Notes
Break down the video content into clear, logical sections strictly following the exact sequence of presentation from beginning to end.
For EACH topic or step presented in the video, in exact chronological order:
- Use a clear header: ### Section [Number]: [Topic Name]
- Provide a simple, easy-to-understand, step-by-step detailed explanation of what was taught.
- Include complete code snippets with clear comments, terminal commands, or structured bullet points as presented.
- Use blockquotes (> 💡 **Simple Rule / Key Takeaway:** ...) highlighting essential rules in plain English.

## 💡 2. Technical Terms & Definitions Glossary
- Provide a clean Markdown table or definition list defining every technical term, command, function, or framework taught in the video using simple, beginner-friendly definitions in the order introduced.

Tone: Simple, crystal-clear, encouraging, and strictly focused on the detailed video notes in exact sequence.
`;
  } else {
    // Fallback if transcript isn't available
    prompt = `
You are an expert educational AI tutor. The student requested detailed video notes for "${videoTitle}", but video captions were not directly available.

Please generate simple, easy-to-understand, topic-by-topic sequential notes based *only* on the video title.

STRICT DIRECTIVES:
1. Focus strictly on simple, clear detailed notes for "${videoTitle}". Do NOT include self-check quizzes, video reviews, or invented assignments.
2. Present the notes in a logical, step-by-step sequential learning order using simple language.
3. DO NOT include timestamps. Ensure maximum clarity, code examples, and structured layout.

# 🎓 Detailed Video Notes: ${videoTitle}
*(Generated based on topic & video title)*

## 📋 1. Chronological Topic-by-Topic Detailed Notes
- ### Section 1: Core Fundamentals & Setup
  Simple explanations, key principles, and structured notes in plain English.
- ### Section 2: Core Concepts & Step-by-Step Implementation
  Clear explanations, commented code snippets, and key formulas.
- ### Section 3: Advanced Concepts, Best Practices & Common Pitfalls
  Easy-to-digest notes on advanced techniques and edge cases.

## 💡 2. Technical Terms & Definitions Glossary
- Simple technical definitions and quick reference glossary.
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

/**
 * Generates personalized AI study insights based on user learning analytics.
 * @param {object} analyticsData
 * @returns {Promise<object>}
 */
export async function generateAIStudyInsights(analyticsData) {
  if (!genAI) {
    // Fallback if Gemini key is missing
    const peak = analyticsData.peakTimeSlot || "Evening";
    const topCat = analyticsData.topCategory || "General";
    return {
      headline: `⚡ Peak Performance Learner (${peak})`,
      peakWindow: peak,
      insightsText: `You show highest productivity during ${peak} hours. You've made solid progress in "${topCat}". Keep up your steady momentum!`,
      recommendation: `Schedule your hardest topics during ${peak} to maximize comprehension and retention.`
    };
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-3.1-flash-lite",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
You are an expert AI Learning Coach. Analyze this student's learning analytics data and return personalized, encouraging study insights.

Student Analytics Data:
- Weekly Completed Lessons: ${analyticsData.currentWeekCompletions} (Vs Last Week: ${analyticsData.previousWeekCompletions})
- Learning Velocity Trend: ${analyticsData.velocityChangePercent}%
- Peak Study Window: ${analyticsData.peakTimeSlot}
- Top Category Studied: ${analyticsData.topCategory}
- Goal Adherence Rate: ${analyticsData.goalCompletionRate}%

Return a JSON object with EXACTLY these keys:
- "headline": Short catchy banner title (e.g. "⚡ Night Owl Deep Work Specialist!")
- "peakWindow": Short string summarizing peak time (e.g. "Evening (6 PM - 10 PM)")
- "insightsText": 2-3 sentence personalized evaluation of their weekly study velocity, habits, and momentum.
- "recommendation": 1 actionable tip for their next study session.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return JSON.parse(text);
  } catch (err) {
    console.warn("AI Study Insights fallback triggered:", err.message);
    const peak = analyticsData.peakTimeSlot || "Evening";
    const topCat = analyticsData.topCategory || "General";
    return {
      headline: `⚡ Consistent Momentum Learner`,
      peakWindow: peak,
      insightsText: `Your study data indicates peak learning activity during ${peak}. You have completed ${analyticsData.currentWeekCompletions} lessons recently, focusing on ${topCat}.`,
      recommendation: `Keep breaking complex modules into 25-minute focused bursts during your ${peak} window.`
    };
  }
}


