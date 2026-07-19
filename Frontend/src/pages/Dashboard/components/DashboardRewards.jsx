import React, { useState, useEffect } from "react";
import { getUserCertificates } from "../../../services/api";
import CertificateViewer from "../../../components/Certificate/CertificateViewer";
import styles from "./DashboardRewards.module.css";

const DashboardRewards = ({ user, courses, streak }) => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCertificate, setSelectedCertificate] = useState(null);

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

  // Define Badges
  const badges = [
    {
      id: "curious_mind",
      name: "Curious Mind",
      desc: "Unlocked by completing your first video lesson.",
      icon: "🌱",
      unlocked: totalCompletedVideos >= 1,
      requirement: "Complete 1 video",
    },
    {
      id: "habit_builder",
      name: "Habit Builder",
      desc: "Unlocked by maintaining a 3-day study streak.",
      icon: "🔥",
      unlocked: streak >= 3,
      requirement: "3-day streak",
    },
    {
      id: "dedicated_learner",
      name: "Dedicated Learner",
      desc: "Unlocked by maintaining a 7-day study streak.",
      icon: "⚡",
      unlocked: streak >= 7,
      requirement: "7-day streak",
    },
    {
      id: "roadmap_finisher",
      name: "Roadmap Finisher",
      desc: "Earned by completing a course roadmap at 100%.",
      icon: "🏆",
      unlocked: certificates.length >= 1,
      requirement: "1 Course Certificate",
    },
    {
      id: "scholar",
      name: "Scholar",
      desc: "Unlocked by earning 500 or more XP.",
      icon: "🎓",
      unlocked: userXp >= 500,
      requirement: "Earn 500 XP",
    },
    {
      id: "polymath",
      name: "Polymath",
      desc: "Unlocked by completing 3 distinct course roadmaps.",
      icon: "👑",
      unlocked: certificates.length >= 3,
      requirement: "3 Course Certificates",
    },
  ];

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <div className={styles.container}>
      <div className={styles.paneHeader}>
        <div>
          <h2 className={styles.paneTitle}>Rewards & Achievements</h2>
          <p className={styles.paneSubtitle}>Track your learning milestones, XP progress, and certifications.</p>
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
            <div className={styles.statIcon}>📜</div>
            <div className={styles.statInfo}>
              <span>Certificates Earned</span>
              <h4>{certificates.length}</h4>
            </div>
          </div>
        </div>
      </div>

      {/* Badges/Achievements Grid */}
      <section>
        <h3 className={styles.sectionTitle}>
          <span>🎖️</span> Achievements & Badges
        </h3>
        <div className={styles.badgesGrid}>
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`${styles.badgeCard} ${
                badge.unlocked ? styles.badgeCardUnlocked : styles.badgeCardLocked
              }`}
            >
              <div className={styles.badgeIcon}>{badge.icon}</div>
              <h4 className={styles.badgeName}>{badge.name}</h4>
              <p className={styles.badgeDesc}>{badge.desc}</p>
              <span
                className={`${styles.badgeStatus} ${
                  badge.unlocked ? styles.statusUnlocked : styles.statusLocked
                }`}
              >
                {badge.unlocked ? "Unlocked" : `Req: ${badge.requirement}`}
              </span>
            </div>
          ))}
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
