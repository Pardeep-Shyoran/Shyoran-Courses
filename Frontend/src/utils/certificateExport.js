// Certificate PDF exporter utility using jsPDF
import { jsPDF } from 'jspdf'
import { QUICK_IMPORT_PRESETS } from '../data/quickImportPresets'

/**
 * Resolves the YouTube channel name / creator for a course
 * @param {Object} course - Course object
 * @returns {string} YouTube Channel name or author
 */
export function resolveChannelName(course) {
  if (!course) return ''

  // 1. Explicit channelTitle or author fields on course
  if (course.channelTitle && typeof course.channelTitle === 'string' && course.channelTitle.trim()) {
    return course.channelTitle.trim()
  }
  if (course.channelName && typeof course.channelName === 'string' && course.channelName.trim()) {
    return course.channelName.trim()
  }
  if (course.author && typeof course.author === 'string' && course.author.trim()) {
    return course.author.trim()
  }
  if (course.instructor && typeof course.instructor === 'string' && course.instructor.trim()) {
    return course.instructor.trim()
  }

  // 2. Check video-level channelTitle (from YouTube API / scraper)
  if (Array.isArray(course.videos)) {
    const videoWithChannel = course.videos.find(v => v?.channelTitle && v.channelTitle.trim())
    if (videoWithChannel) {
      return videoWithChannel.channelTitle.trim()
    }
  }

  // 3. Match against known presets in QUICK_IMPORT_PRESETS
  const title = (course.title || '').toLowerCase()
  const preset = QUICK_IMPORT_PRESETS.find(p => {
    const pTitle = p.title.toLowerCase()
    return title.includes(pTitle) || pTitle.includes(title) || (course.playlistId && p.playlistUrl && p.playlistUrl.includes(course.playlistId))
  })
  if (preset && preset.author) {
    return preset.author
  }

  // 4. Regex extraction from title (e.g. "Crash Course By Sandeep Siwach Sir", "Python Tutorial by CodeWithHarry")
  const byMatch = (course.title || '').match(/(?:by|By|BY)\s+([^|\-[\]()]+)/)
  if (byMatch && byMatch[1] && byMatch[1].trim()) {
    return byMatch[1].trim()
  }

  // 5. Pipe delimiter in title (e.g. "... | Sandeep Siwach Sir")
  const pipeMatch = (course.title || '').match(/\|\s*([^|\-[\]()]+)$/)
  if (pipeMatch && pipeMatch[1] && pipeMatch[1].trim()) {
    return pipeMatch[1].trim()
  }

  // 6. Check course.user if created by instructor
  if (course.user?.name && course.user.name !== 'Student' && course.user.name !== 'Admin') {
    return course.user.name
  }

  return ''
}

/**
 * Builds and returns the jsPDF document object for a certificate
 * @param {Object} certificate - Certificate data object
 * @param {string} studentNameFallback - Fallback name if user object is not fully populated
 * @returns {{ doc: jsPDF, fileName: string }}
 */
export function createCertificatePdfDocument(certificate, studentNameFallback) {
  if (!certificate) return null

  const {
    certificateId,
    completedAt,
    course,
    user,
    isPreview = false
  } = certificate

  const courseTitle = course?.title || 'Interactive Course Curriculum'
  const studentName = user?.name || studentNameFallback || 'Student of Excellence'
  const channelName = resolveChannelName(course)

  const formattedDate = completedAt
    ? new Date(completedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })

  // Create A4 Landscape PDF (297mm x 210mm)
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  })

  const pageWidth = doc.internal.pageSize.getWidth() // 297
  const pageHeight = doc.internal.pageSize.getHeight() // 210
  const centerX = pageWidth / 2

  // 1. Certificate Background (Soft Ivory / Pristine Canvas)
  doc.setFillColor(254, 254, 252)
  doc.rect(0, 0, pageWidth, pageHeight, 'F')

  // Subtle corner tint gradients/accents
  doc.setFillColor(250, 246, 238)
  doc.rect(4, 4, pageWidth - 8, pageHeight - 8, 'F')
  doc.setFillColor(255, 255, 255)
  doc.rect(7, 7, pageWidth - 14, pageHeight - 14, 'F')

  // 2. Elegant Multi-Layer Luxury Borders
  // Outer Solid Gold Border
  doc.setDrawColor(212, 175, 55) // Rich Gold
  doc.setLineWidth(1.6)
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20, 'S')

  // Secondary Thin Deep Navy / Slate Line
  doc.setDrawColor(15, 23, 42) // Slate 900
  doc.setLineWidth(0.4)
  doc.rect(12.5, 12.5, pageWidth - 25, pageHeight - 25, 'S')

  // Inner Ornate Thin Gold Line
  doc.setDrawColor(180, 142, 38)
  doc.setLineWidth(0.6)
  doc.rect(14.5, 14.5, pageWidth - 29, pageHeight - 29, 'S')

  // Corner Decorative Florets / Ornaments (pure vector diamonds, no unicode glyphs)
  const cornerOffset = 14.5
  const corners = [
    [cornerOffset, cornerOffset],
    [pageWidth - cornerOffset, cornerOffset],
    [cornerOffset, pageHeight - cornerOffset],
    [pageWidth - cornerOffset, pageHeight - cornerOffset]
  ]

  corners.forEach(([cx, cy]) => {
    doc.setFillColor(212, 175, 55)
    doc.setDrawColor(15, 23, 42)
    doc.setLineWidth(0.3)
    
    // Draw small diamond
    const dSize = 2.5
    doc.triangle(cx - dSize, cy, cx + dSize, cy, cx, cy - dSize, 'FD')
    doc.triangle(cx - dSize, cy, cx + dSize, cy, cx, cy + dSize, 'FD')

    // Concentric micro-dot
    doc.setFillColor(15, 23, 42)
    doc.circle(cx, cy, 0.7, 'F')
  })

  // 3. Header Emblem & Academy Brand (Standard ASCII & Vector Geometry only)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(170, 124, 17) // Antique Gold
  doc.text('SHYORAN COURSES ROADMAP ACADEMY', centerX, 23, { align: 'center' })

  // Pure Vector Ornamental Divider (replaces any unicode star glyphs that cause artifacts)
  const ornamentY = 28
  doc.setDrawColor(212, 175, 55)
  doc.setFillColor(212, 175, 55)
  doc.setLineWidth(0.6)
  doc.line(centerX - 35, ornamentY, centerX + 35, ornamentY)
  
  // Center diamond motif
  doc.triangle(centerX - 2, ornamentY, centerX + 2, ornamentY, centerX, ornamentY - 2, 'FD')
  doc.triangle(centerX - 2, ornamentY, centerX + 2, ornamentY, centerX, ornamentY + 2, 'FD')
  
  // Symmetrical accent dots
  doc.circle(centerX - 12, ornamentY, 0.8, 'F')
  doc.circle(centerX + 12, ornamentY, 0.8, 'F')
  doc.circle(centerX - 35, ornamentY, 0.6, 'F')
  doc.circle(centerX + 35, ornamentY, 0.6, 'F')

  // Main Certificate Title
  doc.setFont('times', 'bold')
  doc.setFontSize(28)
  doc.setTextColor(15, 23, 42) // Navy slate
  doc.text('CERTIFICATE OF COMPLETION', centerX, 41, { align: 'center' })

  // Golden accent bar under title
  doc.setDrawColor(212, 175, 55)
  doc.setLineWidth(0.8)
  doc.line(centerX - 46, 45, centerX + 46, 45)
  doc.setFillColor(212, 175, 55)
  doc.circle(centerX, 45, 1.2, 'F')
  doc.circle(centerX - 46, 45, 0.7, 'F')
  doc.circle(centerX + 46, 45, 0.7, 'F')

  // Subtitle / Dedication statement
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(100, 116, 139) // Slate 500
  doc.text('THIS IS PROUDLY PRESENTED TO', centerX, 55, { align: 'center' })

  // 4. Recipient Name
  doc.setFont('times', 'bold')
  doc.setFontSize(26)
  doc.setTextColor(19, 22, 39) // Deep Midnight
  doc.text(studentName, centerX, 68, { align: 'center' })

  // Name underline flourish with centered ornament
  const nameWidth = Math.min(Math.max(doc.getTextWidth(studentName) + 20, 70), 180)
  const nameLineY = 72
  doc.setDrawColor(212, 175, 55)
  doc.setLineWidth(0.6)
  doc.line(centerX - nameWidth / 2, nameLineY, centerX + nameWidth / 2, nameLineY)
  
  doc.setFillColor(212, 175, 55)
  doc.triangle(centerX - 2, nameLineY, centerX + 2, nameLineY, centerX, nameLineY - 1.5, 'F')
  doc.triangle(centerX - 2, nameLineY, centerX + 2, nameLineY, centerX, nameLineY + 1.5, 'F')

  // 5. Achievement Description
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  doc.setTextColor(71, 85, 105) // Slate 600
  doc.text(
    'for successfully mastering all curriculum roadmaps, study checklists, and video lectures for:',
    centerX,
    81,
    { align: 'center' }
  )

  // 6. Course Title (Prominent, with auto-wrap if long)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.setTextColor(226, 88, 62) // Signature Coral (#e2583e)
  
  const cleanCourseTitle = `"${courseTitle.replace(/[“”]/g, '"')}"`
  const maxTitleWidth = pageWidth - 60
  const titleLines = doc.splitTextToSize(cleanCourseTitle, maxTitleWidth)

  let titleY = 90
  titleLines.forEach((line) => {
    doc.text(line, centerX, titleY, { align: 'center' })
    titleY += 6.5
  })

  // 7. YouTube Channel Accreditation & Creator Attribution
  if (channelName) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(170, 124, 17) // Antique Gold
    doc.text(`YouTube Channel: ${channelName}`, centerX, titleY + 1.5, { align: 'center' })
    titleY += 6.5
  }

  // Secondary acknowledgement line
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(8.5)
  doc.setTextColor(100, 116, 139)
  doc.text('demonstrating outstanding commitment, self-discipline, and subject mastery.', centerX, titleY + 1, {
    align: 'center'
  })

  // 8. Official Seal & Signatures Area (Y ~ 140 - 176)
  const signBaseY = 152

  // --- Left Signature: Academic Director ---
  const leftColX = 58
  doc.setFont('times', 'italic')
  doc.setFontSize(14)
  doc.setTextColor(51, 65, 85)
  doc.text('Pardeep Shyoran', leftColX, signBaseY - 4, { align: 'center' })

  doc.setDrawColor(148, 163, 184) // Slate 400
  doc.setLineWidth(0.4)
  doc.line(leftColX - 32, signBaseY, leftColX + 32, signBaseY)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(15, 23, 42)
  doc.text('Academic Director', leftColX, signBaseY + 5, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(100, 116, 139)
  doc.text('Shyoran Learning Academy', leftColX, signBaseY + 9, { align: 'center' })

  // --- Center Official Verified Seal (Pure Vector Construction) ---
  const sealX = centerX
  const sealY = signBaseY - 2
  const sealRadius = 14

  // Ribbon tails below seal
  doc.setFillColor(212, 175, 55)
  doc.setDrawColor(180, 142, 38)
  doc.setLineWidth(0.2)
  // Left ribbon
  doc.triangle(sealX - 8, sealY + 8, sealX - 2, sealY + 8, sealX - 9, sealY + 22, 'FD')
  // Right ribbon
  doc.triangle(sealX + 2, sealY + 8, sealX + 8, sealY + 8, sealX + 9, sealY + 22, 'FD')

  // Outer Seal Rosette Ring
  doc.setFillColor(254, 249, 235) // Gold cream
  doc.setDrawColor(212, 175, 55) // Gold border
  doc.setLineWidth(1)
  doc.circle(sealX, sealY, sealRadius, 'FD')

  // Inner concentric ring
  doc.setDrawColor(180, 142, 38)
  doc.setLineWidth(0.3)
  doc.circle(sealX, sealY, sealRadius - 2, 'S')

  // Draw 3 sharp vector star florets (zero font encoding artifacts)
  const starOffsets = [-6, 0, 6]
  starOffsets.forEach((offset) => {
    const sx = sealX + offset
    const sy = sealY - 6.5
    doc.setFillColor(212, 175, 55)
    doc.triangle(sx - 1.1, sy, sx + 1.1, sy, sx, sy - 1.4, 'F')
    doc.triangle(sx - 1.1, sy, sx + 1.1, sy, sx, sy + 1.4, 'F')
  })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(15, 23, 42)
  doc.text('VERIFIED', sealX, sealY - 1.5, { align: 'center' })

  doc.setFontSize(6.5)
  doc.setTextColor(212, 175, 55)
  doc.text('PROGRAM', sealX, sealY + 2.5, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(5.5)
  doc.setTextColor(100, 116, 139)
  doc.text('SHYORAN HUB', sealX, sealY + 6.5, { align: 'center' })

  // --- Right Signature: Verification Authority ---
  const rightColX = pageWidth - 58
  doc.setFont('times', 'italic')
  doc.setFontSize(14)
  doc.setTextColor(51, 65, 85)
  doc.text('Authenticity Board', rightColX, signBaseY - 4, { align: 'center' })

  doc.setDrawColor(148, 163, 184)
  doc.setLineWidth(0.4)
  doc.line(rightColX - 32, signBaseY, rightColX + 32, signBaseY)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(15, 23, 42)
  doc.text('Verification Authority', rightColX, signBaseY + 5, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(100, 116, 139)
  doc.text('Curriculum Quality Council', rightColX, signBaseY + 9, { align: 'center' })

  // 9. Footer Metadata & Verification Bar
  const footerY = 188
  doc.setFillColor(248, 250, 252) // Light subtle background bar
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.3)
  doc.roundedRect(18, footerY - 4, pageWidth - 36, 10, 1.5, 1.5, 'FD')

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(100, 116, 139)

  // Date
  doc.text('Issued Date:', 22, footerY + 2.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(15, 23, 42)
  doc.text(formattedDate, 38, footerY + 2.5)

  // Credential ID
  const displayCertId = isPreview ? 'PREVIEW-DRAFT-NOT-ISSUED' : (certificateId || 'CERT-ACTIVE')
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 116, 139)
  const idLabel = 'Credential ID:'
  const idLabelWidth = doc.getTextWidth(idLabel)
  doc.text(idLabel, centerX - 32, footerY + 2.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(15, 23, 42)
  doc.text(displayCertId, centerX - 32 + idLabelWidth + 2, footerY + 2.5)

  // Verification Status / YouTube Channel attribution note
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 116, 139)
  doc.text('Status:', pageWidth - 70, footerY + 2.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(isPreview ? 226 : 16, isPreview ? 88 : 185, isPreview ? 62 : 129)
  doc.text(isPreview ? 'Draft Preview' : 'Verified Active', pageWidth - 60, footerY + 2.5)

  // 10. Watermark if Preview
  if (isPreview) {
    doc.saveGraphicsState && doc.saveGraphicsState()
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(44)
    doc.setTextColor(226, 88, 62)
    doc.text('PREVIEW - DRAFT ONLY', centerX, pageHeight / 2 + 10, {
      align: 'center',
      angle: 25
    })
    doc.restoreGraphicsState && doc.restoreGraphicsState()
  }

  // 11. Safe File Name
  const safeStudent = studentName.replace(/[^a-z0-9_-]/gi, '_')
  const safeCourse = courseTitle.replace(/[^a-z0-9_-]/gi, '_').substring(0, 30)
  const safeId = (certificateId || 'CERT').replace(/[^a-z0-9_-]/gi, '')
  const fileName = `Certificate_${safeStudent}_${safeCourse}_${safeId}.pdf`

  return { doc, fileName }
}

/**
 * Downloads the certificate as a PDF file
 * @param {Object} certificate - Certificate data object
 * @param {string} studentNameFallback - Fallback name
 */
export function exportCertificatePDF(certificate, studentNameFallback) {
  const result = createCertificatePdfDocument(certificate, studentNameFallback)
  if (!result) return
  result.doc.save(result.fileName)
}

/**
 * Generates the certificate PDF and directly triggers the browser's PDF print interface
 * @param {Object} certificate - Certificate data object
 * @param {string} studentNameFallback - Fallback name
 */
export function printCertificatePDF(certificate, studentNameFallback) {
  const result = createCertificatePdfDocument(certificate, studentNameFallback)
  if (!result) return
  const { doc } = result

  // Configure automatic print command on PDF open
  try {
    doc.autoPrint({ variant: 'non-conform' })
  } catch {
    doc.autoPrint()
  }

  const blob = doc.output('blob')
  const blobUrl = URL.createObjectURL(blob)

  // Open the rendered PDF in a dedicated print window / tab
  const printWindow = window.open(blobUrl, '_blank')
  if (printWindow) {
    printWindow.focus()
  } else {
    // Fallback using hidden iframe if popup is blocked
    const iframe = document.createElement('iframe')
    iframe.style.position = 'fixed'
    iframe.style.top = '-10000px'
    iframe.style.left = '-10000px'
    iframe.style.width = '1px'
    iframe.style.height = '1px'
    iframe.style.border = 'none'
    iframe.src = blobUrl

    iframe.onload = () => {
      setTimeout(() => {
        try {
          iframe.contentWindow.focus()
          iframe.contentWindow.print()
        } catch {
          window.location.href = blobUrl
        }
      }, 300)
    }

    document.body.appendChild(iframe)
  }
}
