// Duration parser and formatter utilities

export function parseDurationToSeconds(durationStr) {
  if (!durationStr || typeof durationStr !== 'string') return 0
  const parts = durationStr.trim().split(':').map(Number)
  if (parts.some(isNaN)) return 0

  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2]
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1]
  }
  if (parts.length === 1) {
    return parts[0]
  }
  return 0
}

export function formatSecondsToHuman(totalSeconds) {
  if (!totalSeconds || totalSeconds <= 0) return '0m'
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`
  }
  if (hours > 0) {
    return `${hours}h`
  }
  return `${minutes}m`
}

export function calculateCourseDurations(videos = []) {
  let totalSeconds = 0
  let completedSeconds = 0

  for (const v of videos) {
    const sec = parseDurationToSeconds(v.duration)
    totalSeconds += sec
    if (v.completed) {
      completedSeconds += sec
    }
  }

  const remainingSeconds = Math.max(0, totalSeconds - completedSeconds)

  return {
    totalSeconds,
    completedSeconds,
    remainingSeconds,
    totalFormatted: formatSecondsToHuman(totalSeconds),
    remainingFormatted: formatSecondsToHuman(remainingSeconds),
    completedFormatted: formatSecondsToHuman(completedSeconds)
  }
}
