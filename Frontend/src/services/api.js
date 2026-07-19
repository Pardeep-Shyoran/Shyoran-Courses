const getApiBaseUrl = () => {
  const url = import.meta.env.VITE_API_URL;
  return url.endsWith('/api') || url.endsWith('/api/')
    ? url
    : `${url.replace(/\/$/, '')}/api`;
};

const API_BASE = getApiBaseUrl();

async function request(path, { method = 'GET', body, headers = {} } = {}) {
  const token = localStorage.getItem('token')
  const authHeaders = {
    'Content-Type': 'application/json',
    ...headers,
  }

  if (token) {
    authHeaders.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: authHeaders,
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const message = data?.message || 'Request failed'
    throw new Error(message)
  }

  return data
}

export function loginUser(payload) {
  return request('/auth/login', { method: 'POST', body: payload })
}

export function registerUser(payload) {
  return request('/auth/register', { method: 'POST', body: payload })
}

// Course endpoints
export function getCourses() {
  return request('/courses')
}

export function getPublicCourses() {
  return request('/courses/public')
}

export function enrollInCourse(id) {
  return request(`/courses/${id}/enroll`, { method: 'POST' })
}

export function getCourseById(id) {
  return request(`/courses/${id}`)
}

export function createCourse(payload) {
  return request('/courses', { method: 'POST', body: payload })
}

export function importPlaylistPreview(url) {
  return request('/courses/import-playlist', { method: 'POST', body: { url } })
}

export function updateCourse(id, payload) {
  return request(`/courses/${id}`, { method: 'PUT', body: payload })
}

export function deleteCourse(id) {
  return request(`/courses/${id}`, { method: 'DELETE' })
}

export function refreshCoursePlaylist(id) {
  return request(`/courses/${id}/refresh`, { method: 'POST' })
}

export function toggleVideoCompleted(courseId, videoId) {
  return request(`/courses/${courseId}/videos/${videoId}/toggle`, { method: 'PATCH' })
}

export function updateVideoNotes(courseId, videoId, notes) {
  return request(`/courses/${courseId}/videos/${videoId}/notes`, { method: 'PATCH', body: { notes } })
}

export function updateProfile(payload) {
  return request('/auth/profile', { method: 'PUT', body: payload })
}

export function getUserProfile() {
  return request('/auth/me')
}

// AI Assistant endpoints
export function getVideoSummary(videoId, payload) {
  return request(`/ai/video/${videoId}/summary`, { method: 'POST', body: payload })
}

export function chatWithAITutor(videoId, payload) {
  return request(`/ai/video/${videoId}/chat`, { method: 'POST', body: payload })
}

export function getVideoFlashcards(videoId, payload) {
  return request(`/ai/video/${videoId}/flashcards`, { method: 'POST', body: payload })
}

export function getVideoQuiz(videoId, payload) {
  return request(`/ai/video/${videoId}/quiz`, { method: 'POST', body: payload })
}

// Consistency Heatmap & Study Tracker endpoints
export function getStudyTrackerStats(todayStr) {
  return request(`/courses/stats/study-tracker?today=${todayStr}`)
}

// Certificate endpoints
export function getUserCertificates() {
  return request('/certificates')
}

export function getCertificateById(id) {
  return request(`/certificates/${id}`)
}

// Todo List endpoints
export function getTodos() {
  return request('/todos')
}

export function createTodo(text) {
  return request('/todos', { method: 'POST', body: { text } })
}

export function toggleTodo(id) {
  return request(`/todos/${id}/toggle`, { method: 'PATCH' })
}

export function deleteTodo(id) {
  return request(`/todos/${id}`, { method: 'DELETE' })
}

