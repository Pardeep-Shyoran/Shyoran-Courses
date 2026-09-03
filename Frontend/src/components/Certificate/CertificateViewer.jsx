import React, { useState } from "react";
import styles from "./CertificateViewer.module.css";
import { exportCertificatePDF, printCertificatePDF, resolveChannelName } from "../../utils/certificateExport";

const CertificateViewer = ({ certificate, onClose, studentNameFallback }) => {
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [printing, setPrinting] = useState(false);

  if (!certificate) return null;

  const { certificateId, completedAt, course, user, isPreview } = certificate;
  const courseTitle = course?.title || "Course Roadmap";
  const studentName = user?.name || studentNameFallback || "Student";
  const channelName = resolveChannelName(course);

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

  const handleDownloadPDF = async (e) => {
    e.preventDefault();
    if (downloading) return;
    try {
      setDownloading(true);
      exportCertificatePDF(certificate, studentNameFallback);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to generate certificate PDF:", err);
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = (e) => {
    e.preventDefault();
    if (isPreview || printing) return;
    try {
      setPrinting(true);
      printCertificatePDF(certificate, studentNameFallback);
    } catch (err) {
      console.error("Failed to print certificate PDF:", err);
    } finally {
      setTimeout(() => setPrinting(false), 1500);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.certificateFrame}>
          <div className={styles.innerNavyBorder}>
            <div className={styles.innerGoldBorder}>
              {/* Corner Diamond Ornaments */}
              <div className={`${styles.cornerDiamond} ${styles.cornerTopLeft}`} />
              <div className={`${styles.cornerDiamond} ${styles.cornerTopRight}`} />
              <div className={`${styles.cornerDiamond} ${styles.cornerBottomLeft}`} />
              <div className={`${styles.cornerDiamond} ${styles.cornerBottomRight}`} />

              {isPreview && (
                <div className={styles.watermark}>
                  PREVIEW &bull; DRAFT ONLY
                </div>
              )}
              
              {/* Header */}
              <div className={styles.certHeader}>
                <p className={styles.academyBrand}>SHYORAN COURSES ROADMAP ACADEMY</p>
                
                {/* Ornamental Vector Divider */}
                <div className={styles.ornamentDivider}>
                  <span className={styles.dividerDotSmall} />
                  <span className={styles.dividerDot} />
                  <span className={styles.dividerLine} />
                  <span className={styles.dividerDiamond} />
                  <span className={styles.dividerLine} />
                  <span className={styles.dividerDot} />
                  <span className={styles.dividerDotSmall} />
                </div>

                <h1 className={styles.certTitle}>Certificate of Completion</h1>
                
                <div className={styles.titleUnderline}>
                  <span className={styles.titleLine} />
                  <span className={styles.titleDot} />
                  <span className={styles.titleLine} />
                </div>
              </div>

              {/* Body */}
              <div className={styles.certBody}>
                <p className={styles.presentedTo}>THIS IS PROUDLY PRESENTED TO</p>
                <div className={styles.studentNameWrapper}>
                  <h2 className={styles.studentName}>{studentName}</h2>
                  <div className={styles.nameUnderline}>
                    <span className={styles.nameLine} />
                    <span className={styles.nameDiamond} />
                    <span className={styles.nameLine} />
                  </div>
                </div>

                <p className={styles.completionText}>
                  for successfully mastering all curriculum roadmaps, study checklists, and video lectures for:
                </p>

                <h3 className={styles.courseTitle}>"{courseTitle}"</h3>

                {channelName && (
                  <div className={styles.channelBadge}>
                    <span className={styles.ytPlayIcon}>▶</span>
                    <span>YouTube Channel: <strong>{channelName}</strong></span>
                  </div>
                )}

                <p className={styles.masteryText}>
                  demonstrating outstanding commitment, self-discipline, and subject mastery.
                </p>
              </div>

              {/* Signatures & Seal */}
              <div className={styles.certFooter}>
                <div className={styles.footerCol}>
                  <div className={styles.signatureScript}>Pardeep Shyoran</div>
                  <div className={styles.signatureLine}></div>
                  <div className={styles.signText}>
                    <span className={styles.signTitle}>Academic Director</span>
                    <span className={styles.signSub}>Shyoran Learning Academy</span>
                  </div>
                </div>

                <div className={styles.footerColCenter}>
                  <div className={styles.sealWrapper}>
                    <div className={styles.sealRibbons}>
                      <div className={styles.ribbonLeft}></div>
                      <div className={styles.ribbonRight}></div>
                    </div>
                    <div className={styles.verifiedSeal}>
                      <div className={styles.sealStars}>
                        <span>✦</span>
                        <span>✦</span>
                        <span>✦</span>
                      </div>
                      <span className={styles.sealVerified}>VERIFIED</span>
                      <span className={styles.sealProgram}>PROGRAM</span>
                      <span className={styles.sealHub}>SHYORAN HUB</span>
                    </div>
                  </div>
                </div>

                <div className={styles.footerColRight}>
                  <div className={styles.signatureScript}>Authenticity Board</div>
                  <div className={styles.signatureLine}></div>
                  <div className={styles.signText}>
                    <span className={styles.signTitle}>Verification Authority</span>
                    <span className={styles.signSub}>Curriculum Quality Council</span>
                  </div>
                </div>
              </div>

              {/* Verification & Metadata Bar */}
              <div className={styles.metaInfo}>
                <div className={styles.metaItem}>
                  <span>Issued Date:</span> <strong>{formattedDate}</strong>
                </div>
                <div className={styles.metaItem}>
                  <span>Credential ID:</span> <strong>{isPreview ? "PREVIEW-DRAFT-NOT-ISSUED" : certificateId}</strong>
                </div>
                {channelName && (
                  <div className={styles.metaItem}>
                    <span>Channel:</span> <strong>{channelName}</strong>
                  </div>
                )}
                <div className={styles.metaItem}>
                  <span>Status:</span> <strong className={isPreview ? styles.statusDraft : styles.statusActive}>{isPreview ? "Draft Preview" : "Verified Active"}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          {!isPreview ? (
            <>
              <button
                onClick={handleDownloadPDF}
                disabled={downloading}
                className={styles.downloadBtn}
                title="Generate and download official PDF certificate"
              >
                {downloading ? (
                  <>
                    <span className={styles.spinner}></span>
                    Generating PDF...
                  </>
                ) : downloadSuccess ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Downloaded!
                  </>
                ) : (
                  <>
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
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Download Certificate (PDF)
                  </>
                )}
              </button>

              <button
                onClick={handlePrint}
                disabled={printing}
                className={styles.printBtn}
                title="Print PDF Certificate"
              >
                {printing ? (
                  <>
                    <span className={styles.spinner}></span>
                    Preparing PDF...
                  </>
                ) : (
                  <>
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
                    Print PDF
                  </>
                )}
              </button>
            </>
          ) : (
            <span className={styles.previewMessage}>🔒 Complete this course to unlock certificate download</span>
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
