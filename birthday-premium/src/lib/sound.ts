import { Howl } from 'howler'

class SoundManager {
  private static instance: SoundManager
  private sounds: Map<string, Howl> = new Map()
  private _muted = false
  private bgm: Howl | null = null

  static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager()
    }
    return SoundManager.instance
  }

  get muted(): boolean {
    return this._muted
  }

  toggleMute(): boolean {
    this._muted = !this._muted
    Howler.mute(this._muted)
    return this._muted
  }

  play(name: string, src?: string) {
    if (!src) return
    if (this.sounds.has(name)) {
      const s = this.sounds.get(name)!
      s.play()
      return
    }
    const sound = new Howl({ src: [src], volume: 0.3 })
    this.sounds.set(name, sound)
    sound.play()
  }

  playBGM(src: string) {
    if (this.bgm) {
      this.bgm.stop()
      this.bgm.unload()
    }
    this.bgm = new Howl({
      src: [src],
      loop: true,
      volume: 0.15,
    })
    if (!this._muted) this.bgm.play()
  }

  playTick() {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 800
    osc.type = 'sine'
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.1)
  }

  playFirework() {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const bufferSize = ctx.sampleRate * 0.3
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 3)
    }
    const source = ctx.createBufferSource()
    source.buffer = buffer
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.2, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
    source.connect(gain)
    gain.connect(ctx.destination)
    source.start()
  }

  playSparkle() {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 2000 + Math.random() * 2000
    osc.type = 'sine'
    gain.gain.setValueAtTime(0.1, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.15)
  }

  playCelebration() {
    this.playFirework()
    setTimeout(() => this.playFirework(), 200)
    setTimeout(() => this.playFirework(), 500)
  }

  destroy() {
    this.sounds.forEach((s) => s.unload())
    if (this.bgm) this.bgm.unload()
    this.sounds.clear()
  }
}

export const soundManager = SoundManager.getInstance()
