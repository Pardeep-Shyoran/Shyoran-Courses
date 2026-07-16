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
 * Generates a structured Markdown study summary for a video.
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
You are an expert educational content writer. Your task is to write a comprehensive, high-quality, and structured Markdown study guide/summary for a YouTube video.

Video Title: "${videoTitle}"
Transcript:
"""
${transcriptText}
"""

Please format your response strictly using Markdown. The summary must include the following sections:
1. **Overview**: A clear, engaging 3-4 sentence paragraph summarizing the core purpose and goal of this video.
2. **Key Takeaways & Core Concepts**: Explain the main 3-5 concepts or lessons covered in the video, with a short explanation for each. Use bullet points.
3. **Structured Study Outline**: A logical breakdown of the topics in sequential order. Include brief bullet points explaining what is discussed in each topic.
4. **Glossary / Key Terms**: Define any technical terms, frameworks, commands, or jargon mentioned in the video.
5. **Practical Exercise or Study Prompt**: Suggest a quick hands-on exercise, project idea, or a self-reflection prompt for the student to practice what they learned.

Maintain a clear, academic, yet encouraging tone. Focus on educational utility. Use code blocks with appropriate syntax highlighting if code or commands are discussed.
`;
  } else {
    // Fallback if transcript isn't available
    prompt = `
You are an expert educational tutor. The student requested a summary for the video titled "${videoTitle}", but the video transcript is currently unavailable.

Please generate a high-quality Markdown study outline and resource guide based *only* on the video title.
Include:
1. **Expected Concepts**: What topics and concepts are usually covered under this title? Explain them briefly.
2. **Study Recommendations**: What key areas should the student focus on while watching this video?
3. **Glossary of Expected Terms**: Standard technical terms and definitions relevant to this topic.
4. **Practice Exercises**: Suggested tasks to try.

Note: Begin with a friendly, subtle banner stating: "*Note: This study guide was generated based on the video title because video captions were not available.*"
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
