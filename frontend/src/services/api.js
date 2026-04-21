import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

export const getAttacks     = (params)  => api.get('/attacks', { params })
export const getAttack      = (id)      => api.get(`/attacks/${id}`)
export const getSummary     = ()        => api.get('/stats/summary')
export const getTimeline    = ()        => api.get('/stats/timeline')
export const getHoneypots   = ()        => api.get('/stats/honeypots')
export const getCountries   = ()        => api.get('/stats/countries')
export const getTopIPs      = ()        => api.get('/stats/top-ips')
export const getTopPorts    = ()        => api.get('/stats/top-ports')
export const getArticles    = (params)  => api.get('/education/articles', { params })
export const getArticle     = (slug)    => api.get(`/education/articles/${slug}`)
export const getCategories  = ()        => api.get('/education/categories')
