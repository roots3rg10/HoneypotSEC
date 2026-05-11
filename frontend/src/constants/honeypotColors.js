// Paleta de colores compartida entre AttackMap y HoneypotChart
export const HONEYPOT_COLORS = {
  cowrie:    { hex: '#10B981', rgb: [0.063, 0.725, 0.506] },
  dionaea:   { hex: '#3B82F6', rgb: [0.231, 0.510, 0.965] },
  honeytrap: { hex: '#8B5CF6', rgb: [0.545, 0.361, 0.965] },
  glastopf:  { hex: '#F97316', rgb: [0.976, 0.451, 0.086] },
  conpot:    { hex: '#EF4444', rgb: [0.937, 0.267, 0.267] },
  honeyd:    { hex: '#06B6D4', rgb: [0.024, 0.714, 0.831] },
}

const FALLBACK_HEX = ['#FBBF24', '#A78BFA', '#34D399', '#F472B6', '#60A5FA', '#FB923C']
const FALLBACK_RGB = [
  [0.984, 0.749, 0.141],
  [0.655, 0.545, 0.980],
  [0.204, 0.827, 0.600],
  [0.957, 0.443, 0.702],
  [0.376, 0.647, 0.980],
  [0.984, 0.573, 0.188],
]

export function honeypotHex(name) {
  if (!name) return FALLBACK_HEX[0]
  const key = name.toLowerCase()
  if (HONEYPOT_COLORS[key]) return HONEYPOT_COLORS[key].hex
  // Genera un color consistente para honeypots desconocidos
  const idx = [...key].reduce((a, c) => a + c.charCodeAt(0), 0) % FALLBACK_HEX.length
  return FALLBACK_HEX[idx]
}

export function honeypotRgb(name) {
  if (!name) return FALLBACK_RGB[0]
  const key = name.toLowerCase()
  if (HONEYPOT_COLORS[key]) return HONEYPOT_COLORS[key].rgb
  const idx = [...key].reduce((a, c) => a + c.charCodeAt(0), 0) % FALLBACK_RGB.length
  return FALLBACK_RGB[idx]
}
