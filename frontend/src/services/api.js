import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' })

// Adjunta el JWT en cada petición si existe
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auth
export const loginApi    = (username, password) =>
  api.post('/auth/login', new URLSearchParams({ username, password }), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
export const getMeApi    = () => api.get('/auth/me')
export const logoutApi   = () => api.post('/auth/logout')
export const registerApi = (data) => api.post('/auth/register', data)

// Attacks
export const getAttacks       = (params) => api.get('/attacks', { params })
export const getAttack        = (id)     => api.get(`/attacks/${id}`)
export const getPublicAttacks = (limit = 25) => api.get('/attacks/public', { params: { limit } })

// Stats
export const getSummary  = ()       => api.get('/stats/summary')
export const getTimeline = ()       => api.get('/stats/timeline')
export const getHoneypots = ()      => api.get('/stats/honeypots')
export const getCountries            = () => api.get('/stats/countries')
export const getCountriesByHoneypot  = () => api.get('/stats/countries-by-honeypot')
export const getTopIPs   = ()       => api.get('/stats/top-ips')
export const getTopPorts = ()       => api.get('/stats/top-ports')
export const getOverview = ()       => api.get('/stats/overview')

// Education
export const getArticles   = (params) => api.get('/education/articles', { params })
export const getArticle    = (slug)   => api.get(`/education/articles/${slug}`)
export const getCategories = ()       => api.get('/education/categories')

// News
export const getNews = () => api.get('/news')

// Quiz
export const getQuiz       = (slug)    => api.get(`/education/articles/${slug}/quiz`)
export const submitQuiz    = (slug, answers) => api.post(`/education/articles/${slug}/quiz`, { answers })
export const getQuizResults   = ()        => api.get('/education/quiz-results/all')
export const getMyQuizResults = ()        => api.get('/education/quiz-results/me')

// Admin — employees
export const getEmployees      = ()     => api.get('/auth/admin/employees')
export const createEmployeeApi = (data) => api.post('/auth/admin/create-employee', data)

// Admin — clients
export const getAdminClients  = ()   => api.get('/auth/admin/clients')
export const getAdminClient   = (id) => api.get(`/auth/admin/clients/${id}`)
