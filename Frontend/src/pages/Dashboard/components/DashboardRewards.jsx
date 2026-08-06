import React, { useState, useEffect } from "react";
import { getUserCertificates } from "../../../services/api";
import CertificateViewer from "../../../components/Certificate/CertificateViewer";
import styles from "./DashboardRewards.module.css";

const DashboardRewards = ({ user, courses, streak }) => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all"); // 'all', 'streak', 'learning', 'certificates'

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const data = await getUserCertificates();
        setCertificates(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load certificates.");
      } finally {
        setLoading(false);
      }
    };
    fetchCertificates();
  }, []);

  // Calculate Level and XP
  const userXp = user?.xp || 0;
  const currentLevel = Math.floor(userXp / 100) + 1;
  const currentLevelXp = userXp % 100;
  const xpForNextLevel = 100;
  const xpProgressPercent = Math.min(100, Math.max(0, (currentLevelXp / xpForNextLevel) * 100));

  // Calculate stats for badges
  let totalCompletedVideos = 0;
  courses.forEach((course) => {
    const completedCount = course.videos ? course.videos.filter((v) => v.completed).length : 0;
    totalCompletedVideos += completedCount;
  });

  const certCount = certificates.length;

  // Complete List of Badges including 365-Day Annual Streak Progression
  const badges = [
    // --- STREAK SYSTEM BADGES (365 DAYS) ---
    {
      id: "streak_3",
      category: "streak",
      name: "Spark of Passion",
      desc: "Maintain a 3-day continuous study streak.",
      icon: "🔥",
      target: 3,
      current: streak,
      unlocked: streak >= 3,
      unit: "days streak",
    },
    {
      id: "streak_7",
      category: "streak",
      name: "Week Warrior",
      desc: "Maintain a 7-day continuous study streak.",
      icon: "⚡",
      target: 7,
      current: streak,
      unlocked: streak >= 7,
      unit: "days streak",
    },
    {
      id: "streak_14",
      category: "streak",
      name: "Fortnight Focus",
      desc: "Maintain a 14-day continuous study streak.",
      icon: "🌟",
      target: 14,
      current: streak,
      unlocked: streak >= 14,
      unit: "days streak",
    },
    {
      id: "streak_30",
      category: "streak",
      name: "Monthly Master",
      desc: "Maintain a 30-day continuous study streak.",
      icon: "🏆",
      target: 30,
      current: streak,
      unlocked: streak >= 30,
      unit: "days streak",
    },
    {
      id: "streak_50",
      category: "streak",
      name: "50-Day Sentinel",
      desc: "Maintain a 50-day continuous study streak.",
      icon: "🛡️",
      target: 50,
      current: streak,
      unlocked: streak >= 50,
      unit: "days streak",
    },
    {
      id: "streak_100",
      category: "streak",
      name: "Centurion Scholar",
      desc: "Maintain a 100-day continuous study streak.",
      icon: "💯",
      target: 100,
      current: streak,
      unlocked: streak >= 100,
      unit: "days streak",
    },
    {
      id: "streak_150",
      category: "streak",
      name: "150-Day Titan",
      desc: "Maintain a 150-day continuous study streak.",
      icon: "⚔️",
      target: 150,
      current: streak,
      unlocked: streak >= 150,
      unit: "days streak",
    },
    {
      id: "streak_200",
      category: "streak",
      name: "Bicentennial Vanguard",
      desc: "Maintain a 200-day continuous study streak.",
      icon: "🔱",
      target: 200,
      current: streak,
      unlocked: streak >= 200,
      unit: "days streak",
    },
    {
      id: "streak_250",
      category: "streak",
      name: "Quarter-K Conqueror",
      desc: "Maintain a 250-day continuous study streak.",
      icon: "👑",
      target: 250,
      current: streak,
      unlocked: streak >= 250,
      unit: "days streak",
    },
    {
      id: "streak_300",
      category: "streak",
      name: "300-Day Paragon",
      desc: "Maintain a 300-day continuous study streak.",
      icon: "💎",
      target: 300,
      current: streak,
      unlocked: streak >= 300,
      unit: "days streak",
    },
    {
      id: "streak_350",
      category: "streak",
      name: "Apex Scholar",
      desc: "Maintain a 350-day continuous study streak.",
      icon: "🔮",
      target: 350,
      current: streak,
      unlocked: streak >= 350,
      unit: "days streak",
    },
    {
      id: "streak_365",
      category: "streak",
      name: "Year-Long Legend",
      desc: "Achieve a full 365-day (1 Year) non-stop study streak!",
      icon: "🌌",
      target: 365,
      current: streak,
      unlocked: streak >= 365,
      unit: "days streak",
    },

    // --- LEARNING & VIDEO BADGES ---
    {
      id: "curious_mind",
      category: "learning",
      name: "Curious Mind",
      desc: "Unlocked by completing your first video lesson.",
      icon: "🌱",
      target: 1,
      current: totalCompletedVideos,
      unlocked: totalCompletedVideos >= 1,
      unit: "videos",
    },
    {
      id: "video_scholar",
      category: "learning",
      name: "Video Scholar",
      desc: "Unlocked by completing 10 video lessons.",
      icon: "📹",
      target: 10,
      current: totalCompletedVideos,
      unlocked: totalCompletedVideos >= 10,
      unit: "videos",
    },
    {
      id: "knowledge_master",
      category: "learning",
      name: "Knowledge Master",
      desc: "Unlocked by completing 50 video lessons.",
      icon: "🧠",
      target: 50,
      current: totalCompletedVideos,
      unlocked: totalCompletedVideos >= 50,
      unit: "videos",
    },

    // --- CERTIFICATES & MASTERY ---
    {
      id: "roadmap_finisher",
      category: "certificates",
      name: "Roadmap Finisher",
      desc: "Earned by completing a course roadmap at 100%.",
      icon: "🏅",
      target: 1,
      current: certCount,
      unlocked: certCount >= 1,
      unit: "certificates",
    },
    {
      id: "polymath",
      category: "certificates",
      name: "Polymath",
      desc: "Unlocked by completing 3 distinct course roadmaps.",
      icon: "🎓",
      target: 3,
      current: certCount,
      unlocked: certCount >= 3,
      unit: "certificates",
    },
    {
      id: "grandmaster",
      category: "certificates",
      name: "Grandmaster",
      desc: "Unlocked by completing 5 distinct course roadmaps.",
      icon: "👑",
      target: 5,
      current: certCount,
      unlocked: certCount >= 5,
      unit: "certificates",
    },

    // --- XP & PROGRESSION ---
    {
      id: "xp_novice",
      category: "learning",
      name: "XP Novice",
      desc: "Earn your first 100 XP milestone.",
      icon: "✨",
      target: 100,
      current: userXp,
      unlocked: userXp >= 100,
      unit: "XP",
    },
    {
      id: "xp_scholar",
      category: "learning",
      name: "XP Scholar",
      desc: "Reach 500 total XP points.",
      icon: "⚡",
      target: 500,
      current: userXp,
      unlocked: userXp >= 500,
      unit: "XP",
    },
    {
      id: "xp_prodigy",
      category: "learning",
      name: "XP Prodigy",
      desc: "Reach 1,500 total XP points.",
      icon: "💎",
      target: 1500,
      current: userXp,
      unlocked: userXp >= 1500,
      unit: "XP",
    },
    {
      id: "xp_master",
      category: "learning",
      name: "XP Master",
      desc: "Reach 5,000 total XP points.",
      icon: "🚀",
      target: 5000,
      current: userXp,
      unlocked: userXp >= 5000,
      unit: "XP",
    },
  ];

  // Milestone nodes for 365-Day Roadmap Timeline
  const streakMilestones = [
    { day: 3, icon: "🔥", name: "3 Days" },
    { day: 7, icon: "⚡", name: "7 Days" },
    { day: 14, icon: "🌟", name: "14 Days" },
    { day: 30, icon: "🏆", name: "30 Days" },
    { day: 50, icon: "🛡️", name: "50 Days" },
    { day: 100, icon: "💯", name: "100 Days" },
    { day: 150, icon: "⚔️", name: "150 Days" },
    { day: 200, icon: "🔱", name: "200 Days" },
    { day: 250, icon: "👑", name: "250 Days" },
    { day: 300, icon: "💎", name: "300 Days" },
    { day: 350, icon: "🔮", name: "350 Days" },
    { day: 365, icon: "🌌", name: "365 Days" },
  ];

  // Filter badges based on selected category tab
  const filteredBadges = badges.filter((b) => {
    if (activeCategory === "all") return true;
    return b.category === activeCategory;
  });

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <div className={styles.container}>
      <div className={styles.paneHeader}>
        <div>
          <h2 className={styles.paneTitle}>Rewards & 365-Day Achievements</h2>
          <p className={styles.paneSubtitle}>
            Track your annual study streaks, level progression, and verified course certifications.
          </p>
        </div>
      </div>

      {/* Overview stats cards */}
      <div className={styles.overviewRow}>
        {/* XP Level Card */}
        <div className={styles.xpCard}>
          <div className={styles.levelBadgeWrapper}>
            <div className={styles.levelCircle}>
              <span className={styles.levelNum}>{currentLevel}</span>
              <span className={styles.levelLabel}>Level</span>
            </div>
          </div>
          <div className={styles.xpDetails}>
            <h3 className={styles.xpTitle}>Academic Progression</h3>
            <div className={styles.xpNumbers}>
              <span>XP: <strong>{userXp}</strong> total</span>
              <span>{xpForNextLevel - currentLevelXp} XP to Level {currentLevel + 1}</span>
            </div>
            <div className={styles.progressBarBg}>
              <div className={styles.progressBar} style={{ width: `${xpProgressPercent}%` }}></div>
            </div>
          </div>
        </div>

        {/* Quick Summary Card */}
        <div className={styles.statsSummaryCard}>
          <div className={styles.statRow}>
            <div className={styles.statIcon}>🎖️</div>
            <div className={styles.statInfo}>
              <span>Unlocked Badges</span>
              <h4>{unlockedCount} / {badges.length}</h4>
            </div>
          </div>
          <div className={styles.statRow}>
            <div className={styles.statIcon}>🔥</div>
            <div className={styles.statInfo}>
              <span>Current Streak</span>
              <h4>{streak} {streak === 1 ? 'Day' : 'Days'}</h4>
            </div>
          </div>
          <div className={styles.statRow}>
            <div className={styles.statIcon}>📜</div>
            <div className={styles.statInfo}>
              <span>Certificates</span>
              <h4>{certificates.length}</h4>
            </div>
          </div>
        </div>
      </div>

      {/* 365-Day Annual Streak Roadmap Timeline */}
      <section className={styles.roadmapSection}>
        <div className={styles.roadmapHeader}>
          <h3 className={styles.roadmapTitle}>
            <span>🌌</span> 365-Day Annual Streak Journey
          </h3>
          <span className={styles.streakStatusBadge}>
            Current: <strong>{streak} / 365 Days</strong> ({Math.min(100, Math.round((streak / 365) * 100))}%)
          </span>
        </div>

        <div className={styles.timelineWrapper}>
          <div className={styles.timelineTrack}>
            <div
              className={styles.timelineProgressFill}
              style={{ width: `${Math.min(100, Math.max(2, (streak / 365) * 100))}%` }}
            ></div>
          </div>

          <div className={styles.nodesContainer}>
            {streakMilestones.map((m) => {
              const isUnlocked = streak >= m.day;
              const isNextTarget = !isUnlocked && streak < m.day && (streakMilestones.find(item => item.day > streak)?.day === m.day);

              return (
                <div
                  key={m.day}
                  className={`${styles.milestoneNode} ${
                    isUnlocked ? styles.nodeUnlocked : isNextTarget ? styles.nodeTarget : styles.nodeLocked
                  }`}
                  title={`${m.name}: ${isUnlocked ? 'Unlocked!' : `${m.day - streak} days remaining`}`}
                >
                  <div className={styles.nodeCircle}>
                    <span>{m.icon}</span>
                  </div>
                  <span className={styles.nodeLabel}>{m.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Category Filter & Badges Grid */}
      <section>
        <div className={styles.categorySectionHeader}>
          <h3 className={styles.sectionTitle}>
            <span>🎖️</span> Achievements & Badges
          </h3>

          <div className={styles.categoryTabs}>
            <button
              type="button"
              className={`${styles.categoryTab} ${activeCategory === "all" ? styles.activeCategoryTab : ""}`}
              onClick={() => setActiveCategory("all")}
            >
              All ({badges.length})
            </button>

            <button
              type="button"
              className={`${styles.categoryTab} ${activeCategory === "streak" ? styles.activeCategoryTab : ""}`}
              onClick={() => setActiveCategory("streak")}
            >
              🔥 Streak System ({badges.filter((b) => b.category === "streak").length})
            </button>

            <button
              type="button"
              className={`${styles.categoryTab} ${activeCategory === "learning" ? styles.activeCategoryTab : ""}`}
              onClick={() => setActiveCategory("learning")}
            >
              🧠 Learning & XP ({badges.filter((b) => b.category === "learning").length})
            </button>

            <button
              type="button"
              className={`${styles.categoryTab} ${activeCategory === "certificates" ? styles.activeCategoryTab : ""}`}
              onClick={() => setActiveCategory("certificates")}
            >
              📜 Certificates ({badges.filter((b) => b.category === "certificates").length})
            </button>
          </div>
        </div>

        <div className={styles.badgesGrid}>
          {filteredBadges.map((badge) => {
            const pct = Math.min(100, Math.round((badge.current / badge.target) * 100));

            return (
              <div
                key={badge.id}
                className={`${styles.badgeCard} ${
                  badge.unlocked ? styles.badgeCardUnlocked : styles.badgeCardLocked
                }`}
              >
                <div className={styles.badgeIcon}>{badge.icon}</div>
                <h4 className={styles.badgeName}>{badge.name}</h4>
                <p className={styles.badgeDesc}>{badge.desc}</p>

                {/* Progress bar inside card */}
                <div className={styles.badgeProgressContainer}>
                  <div className={styles.badgeProgressHeader}>
                    <span>Progress</span>
                    <span>
                      {badge.current} / {badge.target} {badge.unit}
                    </span>
                  </div>
                  <div className={styles.badgeProgressBarBg}>
                    <div
                      className={styles.badgeProgressBarFill}
                      style={{
                        width: `${pct}%`,
                        background: badge.unlocked
                          ? "linear-gradient(90deg, #d4af37, #f39c12)"
                          : "linear-gradient(90deg, #3498db, #2ecc71)",
                      }}
                    ></div>
                  </div>
                </div>

                <span
                  className={`${styles.badgeStatus} ${
                    badge.unlocked ? styles.statusUnlocked : styles.statusLocked
                  }`}
                >
                  {badge.unlocked ? "Unlocked ✨" : `${pct}% Completed`}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Certificates Gallery */}
      <section className={styles.certsSection}>
        <h3 className={styles.sectionTitle}>
          <span>📜</span> Your Course Certificates
        </h3>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>Loading certificates...</div>
        ) : error ? (
          <div style={{ color: "var(--primary-color)", padding: "20px" }}>{error}</div>
        ) : certificates.length === 0 ? (
          <div className={styles.emptyGrid}>
            <div className={styles.emptyIcon}>🎓</div>
            <h3>No Certificates Yet</h3>
            <p>Complete 100% of any enrolled course to earn your official certificate of completion!</p>
          </div>
        ) : (
          <div className={styles.certsGrid}>
            {certificates.map((cert) => (
              <div key={cert._id} className={styles.certCard}>
                <div className={styles.certHeaderMotif}>
                  🎓
                  <span className={styles.certBadge}>Verified</span>
                </div>
                <div className={styles.certInfo}>
                  <h4 className={styles.certCourseTitle}>{cert.course?.title || "Course Roadmap"}</h4>
                  <div className={styles.certMeta}>
                    <span>
                      Issued: <strong>{new Date(cert.completedAt).toLocaleDateString()}</strong>
                    </span>
                    <span>
                      ID: <strong>{cert.certificateId}</strong>
                    </span>
                  </div>
                  <button onClick={() => setSelectedCertificate(cert)} className={styles.viewCertBtn}>
                    👁️ View Certificate
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modal certificate viewer */}
      {selectedCertificate && (
        <CertificateViewer
          certificate={selectedCertificate}
          studentNameFallback={user?.name}
          onClose={() => setSelectedCertificate(null)}
        />
      )}
    </div>
  );
};

export default DashboardRewards;
