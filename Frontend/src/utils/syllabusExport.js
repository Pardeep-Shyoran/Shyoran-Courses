// Syllabus PDF exporter utility using jsPDF and jspdf-autotable
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { calculateCourseDurations } from './duration'

export function exportCourseSyllabus(course) {
  if (!course) return

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  const durations = calculateCourseDurations(course.videos || [])
  const totalCount = course.videos ? course.videos.length : 0
  const completedCount = course.videos ? course.videos.filter(v => v.completed).length : 0
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // 1. Header Banner
  doc.setFillColor(15, 23, 42) // Deep Slate (#0f172a)
  doc.rect(0, 0, pageWidth, 42, 'F')

  // Accent Line
  doc.setFillColor(226, 88, 62) // Primary Coral (#e2583e)
  doc.rect(0, 42, pageWidth, 3, 'F')

  // Brand Name
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(234, 158, 36) // Gold (#ea9e24)
  doc.text('SHYORAN COURSES • CURRICULUM ROADMAP', 14, 14)

  // Course Title
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(255, 255, 255)
  const titleLines = doc.splitTextToSize(course.title || 'Course Syllabus', pageWidth - 28)
  doc.text(titleLines[0] || '', 14, 24)
  if (titleLines[1]) {
    doc.setFontSize(12)
    doc.text(titleLines[1], 14, 32)
  }

  // Instructor / Category
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(148, 163, 184) // Slate 400
  const authorText = course.user?.name ? `Instructor: ${course.user.name}  |  ` : ''
  const categoryText = `Category: ${course.category || 'Self-Paced'}`
  doc.text(`${authorText}${categoryText}`, 14, 38)

  let currentY = 54

  // 2. Metrics / Stats Bar
  doc.setFillColor(248, 250, 252) // Light Slate (#f8fafc)
  doc.setDrawColor(226, 232, 240)
  doc.roundedRect(14, currentY, pageWidth - 28, 18, 3, 3, 'FD')

  doc.setFontSize(9)
  doc.setTextColor(100, 116, 139)

  const colWidth = (pageWidth - 28) / 4

  // Stat 1: Total Lessons
  doc.setFont('helvetica', 'normal')
  doc.text('Total Lessons', 14 + colWidth * 0 + 6, currentY + 6)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(15, 23, 42)
  doc.text(`${totalCount} Videos`, 14 + colWidth * 0 + 6, currentY + 13)

  // Stat 2: Total Duration
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 116, 139)
  doc.text('Total Runtime', 14 + colWidth * 1 + 6, currentY + 6)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(15, 23, 42)
  doc.text(durations.totalFormatted || 'N/A', 14 + colWidth * 1 + 6, currentY + 13)

  // Stat 3: Completion Progress
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 116, 139)
  doc.text('Completion Status', 14 + colWidth * 2 + 6, currentY + 6)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(completedCount === totalCount && totalCount > 0 ? 16 : 226, completedCount === totalCount && totalCount > 0 ? 185 : 88, completedCount === totalCount && totalCount > 0 ? 129 : 62)
  doc.text(`${completionPercentage}% (${completedCount}/${totalCount})`, 14 + colWidth * 2 + 6, currentY + 13)

  // Stat 4: Generated Date
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 116, 139)
  doc.text('Export Date', 14 + colWidth * 3 + 6, currentY + 6)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(15, 23, 42)
  doc.text(new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), 14 + colWidth * 3 + 6, currentY + 13)

  currentY += 26

  // 3. Course Description (if available)
  if (course.description && course.description.trim().length > 0) {
    doc.setFillColor(254, 242, 242) // light red tint
    doc.setDrawColor(254, 202, 202)
    doc.roundedRect(14, currentY, pageWidth - 28, 16, 2, 2, 'FD')

    // Left accent bar
    doc.setFillColor(226, 88, 62)
    doc.rect(14, currentY, 3, 16, 'F')

    doc.setFont('helvetica', 'italic')
    doc.setFontSize(8.5)
    doc.setTextColor(51, 65, 85)
    const descLines = doc.splitTextToSize(course.description.trim(), pageWidth - 42)
    doc.text(descLines.slice(0, 2), 22, currentY + 6)

    currentY += 22
  }

  // 4. Syllabus Table using autoTable
  const videoUrls = []
  const tableRows = (course.videos || []).map((vid, idx) => {
    const lessonNum = String(idx + 1).padStart(2, '0')
    const title = vid.title || `Lesson ${idx + 1}`
    const duration = vid.duration || '--:--'
    const isDone = Boolean(vid.completed)
    const youtubeUrl = vid.youtubeId ? `https://www.youtube.com/watch?v=${vid.youtubeId}` : ''
    videoUrls.push(youtubeUrl)

    return [
      lessonNum,
      title,
      duration,
      {
        content: isDone ? 'Completed' : 'Pending',
        styles: {
          textColor: isDone ? [16, 185, 129] : [100, 116, 139],
          fontStyle: isDone ? 'bold' : 'normal',
          halign: 'center'
        }
      },
      {
        content: youtubeUrl ? 'Watch Video >' : '—',
        styles: {
          textColor: youtubeUrl ? [226, 88, 62] : [148, 163, 184],
          fontStyle: youtubeUrl ? 'bold' : 'normal',
          halign: 'center'
        }
      }
    ]
  })

  autoTable(doc, {
    startY: currentY,
    head: [['#', 'Lesson Title', 'Duration', 'Status', 'Video Link']],
    body: tableRows,
    margin: { left: 14, right: 14, bottom: 20 },
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 8.5,
      cellPadding: 3.5,
      valign: 'middle',
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.2
    },
    headStyles: {
      fillColor: [226, 88, 62], // Primary Coral (#e2583e)
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'center',
      valign: 'middle'
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { cellWidth: 98 },
      2: { halign: 'center', cellWidth: 22 },
      3: { halign: 'center', cellWidth: 24 },
      4: { halign: 'center', cellWidth: 28 }
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    didDrawCell: (data) => {
      // Make Video Link cell clickable by adding an invisible PDF link annotation
      if (data.section === 'body' && data.column.index === 4) {
        const url = videoUrls[data.row.index]
        if (url) {
          doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, { url })
        }
      }
    },
    didDrawPage: (data) => {
      // Footer page numbering
      const pageStr = `Page ${doc.internal.getNumberOfPages()}`
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(148, 163, 184)
      doc.text(pageStr, pageWidth - 14, pageHeight - 8, { align: 'right' })
      doc.text('Generated by Shyoran Courses • Keep Learning Every Day', 14, pageHeight - 8)
    }
  })

  // 5. Save and trigger direct PDF file download
  const safeTitle = (course.title || 'Course').replace(/[^a-z0-9_-]/gi, '_')
  doc.save(`${safeTitle}_Syllabus.pdf`)
}
