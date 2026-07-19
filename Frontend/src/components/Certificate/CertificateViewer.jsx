import React from "react";
import styles from "./CertificateViewer.module.css";

const CertificateViewer = ({ certificate, onClose, studentNameFallback }) => {
  if (!certificate) return null;

  const { certificateId, completedAt, course, user, isPreview } = certificate;
  const courseTitle = course?.title || "Course Roadmap";
  const studentName = user?.name || studentNameFallback || "Student";

  const formattedDate = completedAt
    ? new Date(completedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  const handlePrint = (e) => {
    e.preventDefault();
    if (isPreview) return;
    window.print();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.certificateFrame}>
          {isPreview && (
            <div className={styles.watermark}>
              Preview Draft
            </div>
          )}
          
          <div className={styles.certHeader}>
            <div className={styles.certMotif}>🔱</div>
            <h1 className={styles.certTitle}>Certificate of Completion</h1>
            <p className={styles.certSubtitle}>Shyoran Courses Roadmap Academy</p>
          </div>

          <div className={styles.certBody}>
            <p className={styles.presentedTo}>This is proudly presented to</p>
            <h2 className={styles.studentName}>{studentName}</h2>
            <p className={styles.completionText}>
              for successfully completing all videos, study checklists, and curriculum roadmaps for the interactive course:
            </p>
            <h3 className={styles.courseTitle}>“{courseTitle}”</h3>
          </div>

          <div className={styles.certFooter}>
            <div className={styles.footerCol}>
              <div className={styles.signatureLine}></div>
              <div className={styles.signText}>
                <span className={styles.signTitle}>Academic Director</span>
              </div>
            </div>

            <div className={styles.footerColCenter}>
              <div className={styles.sealWrapper}>
                <div className={styles.verifiedSeal}>
                  {isPreview ? (
                    <>
                      Preview
                      <br />
                      Draft
                    </>
                  ) : (
                    <>
                      Verified
                      <br />
                      Program
                    </>
                  )}
                </div>
                <div className={styles.signText}>
                  <span className={styles.signTitle}>Shyoran Hub</span>
                </div>
              </div>
            </div>

            <div className={styles.footerColRight}>
              <div className={styles.signatureLine}></div>
              <div className={styles.signText}>
                <span className={styles.signTitle}>Verification Authority</span>
              </div>
            </div>
          </div>

          <div className={styles.metaInfo}>
            <div className={styles.metaItem}>
              <strong>Date:</strong> {formattedDate}
            </div>
            <div className={styles.metaItem}>
              <strong>Credential ID:</strong> {isPreview ? "PREVIEW-PENDING" : certificateId}
            </div>
            <div className={styles.metaItem}>
              <strong>Status:</strong> {isPreview ? "In Progress" : "Verified Active"}
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          {!isPreview ? (
            <button onClick={handlePrint} className={styles.printBtn}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
              </svg>
              Print / Save PDF
            </button>
          ) : (
            <span className={styles.previewMessage}>🔒 Complete this course to unlock printing</span>
          )}
          <button onClick={onClose} className={styles.closeBtn}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CertificateViewer;
