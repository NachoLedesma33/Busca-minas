let ctx = null

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
  return ctx
}

function playTone(freq, duration, type = 'sine', volume = 0.15) {
  try {
    const c = getCtx()
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, c.currentTime)
    gain.gain.setValueAtTime(volume, c.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration)
    osc.connect(gain)
    gain.connect(c.destination)
    osc.start(c.currentTime)
    osc.stop(c.currentTime + duration)
  } catch {
  }
}

export function playReveal() {
  playTone(800, 0.06, 'sine', 0.08)
}

export function playFlag() {
  playTone(300, 0.1, 'triangle', 0.1)
}

export function playExplosion() {
  playTone(80, 0.4, 'sawtooth', 0.2)
  setTimeout(() => playTone(60, 0.3, 'sawtooth', 0.15), 100)
}

export function playVictory() {
  const notes = [523, 659, 784, 1047]
  notes.forEach((f, i) => {
    setTimeout(() => playTone(f, 0.3, 'sine', 0.12), i * 150)
  })
}

export function playChord() {
  playTone(600, 0.05, 'sine', 0.06)
}
