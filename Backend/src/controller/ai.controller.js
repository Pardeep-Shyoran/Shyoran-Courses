import Course from "../models/course.model.js";
import Enrollment from "../models/enrollment.model.js";
import { getYoutubeTranscript } from "../utils/transcript.js";
import { generateSummary, chatWithTutor, generateFlashcards, generateQuiz } from "../utils/ai.js";

/**
 * Helper to fetch a student's personal notes for a specific video.
 */
async function fetchVideoNotes(userId, courseId, videoId, youtubeId) {
  let notes = "";
  // Check enrollment notes first
  const enrollment = await Enrollment.findOne({ user: userId, course: courseId }).lean();
  if (enrollment) {
    const vp = (enrollment.videoProgress || []).find(p => 
      (p.videoId && p.videoId.toString() === videoId) || 
      p.youtubeId === youtubeId
    );
    notes = vp ? vp.notes : "";
  } else {
    // Check if the user is the course owner
    const course = await Course.findOne({ _id: courseId, user: userId }).lean();
    if (course) {
      const video = (course.videos || []).find(v => 
        (v._id && v._id.toString() === videoId) || 
        v.youtubeId === youtubeId
      );
      notes = video ? video.notes : "";
    }
  }
  return notes;
}

/**
 * Generates an AI summary for a video.
 * Body parameters: courseId, youtubeId, title
 */
export async function handleGetSummary(req, res) {
  try {
    const { videoId } = req.params;
    const { courseId, youtubeId, title } = req.body;
    const userId = req.user._id;

    if (!courseId || !youtubeId || !title) {
      return res.status(400).json({ message: "courseId, youtubeId, and title are required in request body" });
    }

    // 1. Fetch the transcript. If it fails, fallback to empty string and let AI know.
    let transcriptText = "";
    let transcriptError = null;
    try {
      transcriptText = await getYoutubeTranscript(youtubeId);
    } catch (err) {
      console.warn(`Transcript unavailable for ${youtubeId}:`, err.message);
      transcriptError = err.message;
    }

    // 2. Generate the summary using Gemini
    const summary = await generateSummary(title, transcriptText);

    res.json({
      summary,
      transcriptFetched: !!transcriptText,
      transcriptError
    });
  } catch (error) {
    console.error("AI Summary Error:", error);
    res.status(500).json({ message: error.message || "Failed to generate video summary" });
  }
}

/**
 * Handles interactive tutor chat.
 * Body parameters: courseId, youtubeId, title, messages, currentNotes
 */
export async function handleChatWithTutor(req, res) {
  try {
    const { videoId } = req.params;
    const { courseId, youtubeId, title, messages, currentNotes } = req.body;
    const userId = req.user._id;

    if (!courseId || !youtubeId || !title || !messages) {
      return res.status(400).json({ message: "courseId, youtubeId, title, and messages array are required" });
    }

    // 1. Fetch transcript (with fallback if disabled)
    let transcriptText = "";
    try {
      transcriptText = await getYoutubeTranscript(youtubeId);
    } catch (err) {
      console.warn(`Transcript unavailable for chat on ${youtubeId}:`, err.message);
    }

    // 2. Get notes (use current notes from frontend if passed, otherwise fall back to db)
    const notesText = currentNotes !== undefined ? currentNotes : await fetchVideoNotes(userId, courseId, videoId, youtubeId);

    // 3. Request completion from Gemini
    const aiResponse = await chatWithTutor({
      videoTitle: title,
      transcriptText,
      notesText,
      chatHistory: messages,
      userPrompt: messages[messages.length - 1]?.content || ""
    });

    res.json({ response: aiResponse });
  } catch (error) {
    console.error("AI Tutor Chat Error:", error);
    res.status(500).json({ message: error.message || "AI Tutor service error" });
  }
}

/**
 * Generates flashcards for a video.
 * Body parameters: courseId, youtubeId, title
 */
export async function handleGetFlashcards(req, res) {
  try {
    const { videoId } = req.params;
    const { courseId, youtubeId, title } = req.body;

    if (!courseId || !youtubeId || !title) {
      return res.status(400).json({ message: "courseId, youtubeId, and title are required in request body" });
    }

    let transcriptText = "";
    try {
      transcriptText = await getYoutubeTranscript(youtubeId);
    } catch (err) {
      console.warn(`Transcript unavailable for flashcards ${youtubeId}:`, err.message);
    }

    const flashcards = await generateFlashcards(title, transcriptText);
    res.json({ flashcards });
  } catch (error) {
    console.error("AI Flashcards Error:", error);
    res.status(500).json({ message: error.message || "Failed to generate study flashcards" });
  }
}

/**
 * Generates quiz questions for a video.
 * Body parameters: courseId, youtubeId, title
 */
export async function handleGetQuiz(req, res) {
  try {
    const { videoId } = req.params;
    const { courseId, youtubeId, title } = req.body;

    if (!courseId || !youtubeId || !title) {
      return res.status(400).json({ message: "courseId, youtubeId, and title are required in request body" });
    }

    let transcriptText = "";
    try {
      transcriptText = await getYoutubeTranscript(youtubeId);
    } catch (err) {
      console.warn(`Transcript unavailable for quiz ${youtubeId}:`, err.message);
    }

    const quiz = await generateQuiz(title, transcriptText);
    res.json({ quiz });
  } catch (error) {
    console.error("AI Quiz Error:", error);
    res.status(500).json({ message: error.message || "Failed to generate practice quiz" });
  }
}
