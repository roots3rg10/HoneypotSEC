let ws = null
const listeners = new Set()

export function connectWS() {
  const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'
  ws = new WebSocket(`${proto}://${window.location.host}/ws/attacks`)

  ws.onmessage = (e) => {
    const data = JSON.parse(e.data)
    listeners.forEach(fn => fn(data))
  }

  ws.onclose = () => {
    setTimeout(connectWS, 3000)
  }
}

export function onAttack(fn)    { listeners.add(fn) }
export function offAttack(fn)   { listeners.delete(fn) }
