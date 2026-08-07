import StudyActivity from "../models/studyActivity.model.js";
import Course from "../models/course.model.js";
import Enrollment from "../models/enrollment.model.js";
import User from "../models/user.model.js";
import { generateAIStudyInsights } from "../utils/ai.js";

/**
 * Helper to get date string YYYY-MM-DD for N days ago
 */
function getDateNDaysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split("T")[0];
}

/**
 * Get comprehensive learning analytics for the authenticated student.
 */
export async function getLearningAnalytics(req, res) {
  try {
    const userId = req.user._id;

    // 1. Fetch user data for study goals
    const user = await User.findById(userId).lean();
    const dailyGoal = user?.dailyGoal || 30; // target in minutes or goal index

    // 2. Fetch study activity for the last 14 days
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    fourteenDaysAgo.setHours(0, 0, 0, 0);

    const activities = await StudyActivity.find({
      user: userId,
      timestamp: { $gte: fourteenDaysAgo }
    }).sort({ timestamp: 1 }).lean();

    // 3. Calculate 14-day daily velocity breakdown
    const dailyVelocityMap = {};
    const dateList = [];
    for (let i = 13; i >= 0; i--) {
      const dateStr = getDateNDaysAgo(i);
      dateList.push(dateStr);
      dailyVelocityMap[dateStr] = 0;
    }

    let morningCount = 0;   // 06:00 - 11:59
    let afternoonCount = 0; // 12:00 - 17:59
    let eveningCount = 0;   // 18:00 - 23:59
    let nightCount = 0;     // 00:00 - 05:59
    const hourlyHistogram = new Array(24).fill(0);

    activities.forEach(act => {
      const dateStr = act.dateStr || (act.timestamp ? act.timestamp.toISOString().split("T")[0] : null);
      if (dateStr && dailyVelocityMap[dateStr] !== undefined) {
        dailyVelocityMap[dateStr] += 1;
      }

      if (act.timestamp) {
        const hour = new Date(act.timestamp).getHours();
        hourlyHistogram[hour] += 1;

        if (hour >= 6 && hour < 12) morningCount++;
        else if (hour >= 12 && hour < 18) afternoonCount++;
        else if (hour >= 18 && hour <= 23) eveningCount++;
        else nightCount++;
      }
    });

    const velocityTrend = dateList.map(dateStr => ({
      date: dateStr,
      label: new Date(dateStr).toLocaleDateString("en-US", { weekday: "short", month: "numeric", day: "numeric" }),
      count: dailyVelocityMap[dateStr] || 0
    }));

    // Split past 14 days into previous 7 days and current 7 days
    const previousWeekList = velocityTrend.slice(0, 7);
    const currentWeekList = velocityTrend.slice(7, 14);

    const previousWeekCompletions = previousWeekList.reduce((acc, curr) => acc + curr.count, 0);
    const currentWeekCompletions = currentWeekList.reduce((acc, curr) => acc + curr.count, 0);

    let velocityChangePercent = 0;
    if (previousWeekCompletions > 0) {
      velocityChangePercent = Math.round(((currentWeekCompletions - previousWeekCompletions) / previousWeekCompletions) * 100);
    } else if (currentWeekCompletions > 0) {
      velocityChangePercent = 100;
    }

    // Determine Peak Study Window
    const timeSlots = [
      { name: "Morning (6 AM - 12 PM)", count: morningCount },
      { name: "Afternoon (12 PM - 6 PM)", count: afternoonCount },
      { name: "Evening (6 PM - 12 AM)", count: eveningCount },
      { name: "Night (12 AM - 6 AM)", count: nightCount }
    ];
    timeSlots.sort((a, b) => b.count - a.count);
    const peakTimeSlot = timeSlots[0].count > 0 ? timeSlots[0].name : "Evening (6 PM - 12 AM)";

    // 4. Fetch Course & Category distribution
    const createdCourses = await Course.find({ user: userId }).lean();
    const enrollments = await Enrollment.find({ user: userId }).populate("course").lean();

    const categoryMap = {};
    let totalCompletedVideos = 0;

    const processCourseProgress = (courseObj, videoProgressList) => {
      const tags = (courseObj.tags && courseObj.tags.length > 0) ? courseObj.tags : ["General"];
      const primaryCategory = tags[0] || "General";

      let completedCount = 0;
      if (videoProgressList && Array.isArray(videoProgressList)) {
        completedCount = videoProgressList.filter(vp => vp.completed).length;
      } else if (courseObj.videos && Array.isArray(courseObj.videos)) {
        completedCount = courseObj.videos.filter(v => v.completed).length;
      }

      totalCompletedVideos += completedCount;
      categoryMap[primaryCategory] = (categoryMap[primaryCategory] || 0) + completedCount;
    };

    createdCourses.forEach(c => processCourseProgress(c, c.videos));
    enrollments.forEach(e => {
      if (e.course) processCourseProgress(e.course, e.videoProgress);
    });

    const categoryBreakdown = Object.keys(categoryMap).map(cat => ({
      category: cat,
      count: categoryMap[cat],
      percentage: totalCompletedVideos > 0 ? Math.round((categoryMap[cat] / totalCompletedVideos) * 100) : 0,
      estimatedMinutes: categoryMap[cat] * 15 // ~15 min average per lesson
    })).sort((a, b) => b.count - a.count);

    const topCategory = categoryBreakdown.length > 0 ? categoryBreakdown[0].category : "Web Development";

    // 5. Goal Adherence Rate
    const targetWeeklyLessons = Math.max(7, Math.round(dailyGoal / 10)); // e.g. 7-14 lessons/week
    const goalCompletionRate = Math.min(100, Math.round((currentWeekCompletions / targetWeeklyLessons) * 100));

    // Active days count in current week
    const activeDaysCount = currentWeekList.filter(d => d.count > 0).length;
    const consistencyIndex = Math.round((activeDaysCount / 7) * 100);

    const analyticsData = {
      currentWeekCompletions,
      previousWeekCompletions,
      velocityChangePercent,
      dailyAverageVelocity: (currentWeekCompletions / 7).toFixed(1),
      peakTimeSlot,
      topCategory,
      totalCompletedVideos,
      targetWeeklyLessons,
      goalCompletionRate,
      activeDaysCount,
      consistencyIndex,
      timeSlotsBreakdown: timeSlots,
      hourlyHistogram,
      velocityTrend: currentWeekList,
      fullVelocityTrend: velocityTrend,
      categoryBreakdown
    };

    res.json(analyticsData);
  } catch (error) {
    console.error("Error generating learning analytics:", error);
    res.status(500).json({ message: error.message || "Failed to generate learning analytics." });
  }
}

/**
 * Endpoint to fetch AI-generated Study Insights based on analytics data.
 */
export async function getAIInsights(req, res) {
  try {
    const userId = req.user._id;

    // Fetch quick summary analytics data
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const activities = await StudyActivity.find({
      user: userId,
      timestamp: { $gte: fourteenDaysAgo }
    }).lean();

    const createdCourses = await Course.find({ user: userId }).lean();
    const enrollments = await Enrollment.find({ user: userId }).populate("course").lean();

    // Quick calculations
    const last7DaysDate = getDateNDaysAgo(7);
    const currentWeekCount = activities.filter(a => a.dateStr >= last7DaysDate).length;
    const prevWeekCount = activities.length - currentWeekCount;
    let velocityChangePercent = prevWeekCount > 0 ? Math.round(((currentWeekCount - prevWeekCount) / prevWeekCount) * 100) : 100;

    let eveningCount = 0, morningCount = 0, afternoonCount = 0, nightCount = 0;
    activities.forEach(act => {
      if (act.timestamp) {
        const hour = new Date(act.timestamp).getHours();
        if (hour >= 6 && hour < 12) morningCount++;
        else if (hour >= 12 && hour < 18) afternoonCount++;
        else if (hour >= 18 && hour <= 23) eveningCount++;
        else nightCount++;
      }
    });

    const timeSlots = [
      { name: "Morning (6 AM - 12 PM)", count: morningCount },
      { name: "Afternoon (12 PM - 6 PM)", count: afternoonCount },
      { name: "Evening (6 PM - 12 AM)", count: eveningCount },
      { name: "Night (12 AM - 6 AM)", count: nightCount }
    ].sort((a, b) => b.count - a.count);

    const peakTimeSlot = timeSlots[0].count > 0 ? timeSlots[0].name : "Evening (6 PM - 12 AM)";

    const categoryMap = {};
    const extractTags = c => (c.tags && c.tags.length > 0) ? c.tags[0] : "General";
    createdCourses.forEach(c => { categoryMap[extractTags(c)] = (categoryMap[extractTags(c)] || 0) + 1; });
    enrollments.forEach(e => { if (e.course) categoryMap[extractTags(e.course)] = (categoryMap[extractTags(e.course)] || 0) + 1; });
    const sortedCats = Object.keys(categoryMap).sort((a, b) => categoryMap[b] - categoryMap[a]);
    const topCategory = sortedCats[0] || "Web Development";

    const aiInsights = await generateAIStudyInsights({
      currentWeekCompletions: currentWeekCount,
      previousWeekCompletions: prevWeekCount,
      velocityChangePercent,
      peakTimeSlot,
      topCategory,
      goalCompletionRate: Math.min(100, Math.round((currentWeekCount / 7) * 100))
    });

    res.json(aiInsights);
  } catch (error) {
    console.error("AI Insights Endpoint Error:", error);
    res.status(500).json({ message: error.message || "Failed to fetch AI study insights." });
  }
}
