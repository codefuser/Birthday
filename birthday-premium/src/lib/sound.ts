class SoundManager {
  private static instance: SoundManager
  private _muted = false
  private bgmAudio: HTMLAudioElement | null = null
  private ctx: AudioContext | null = null
  private bgmSrc = ''

  static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager()
    }
    return SoundManager.instance
  }

  get muted(): boolean {
    return this._muted
  }

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      this.ctx = new AC()
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
    return this.ctx
  }

  unlock() {
    this.getContext()
  }

  playBGM(src: string) {
    if (this.bgmAudio && !this.bgmAudio.paused) return
    this.bgmSrc = src
    if (this.bgmAudio) {
      this.bgmAudio.pause()
      this.bgmAudio.src = ''
    }
    this.bgmAudio = new Audio(src)
    this.bgmAudio.loop = true
    this.bgmAudio.volume = 0.15
    this.bgmAudio.muted = this._muted
    this.bgmAudio.play().catch(() => {})
  }

  toggleMute(): boolean {
    this._muted = !this._muted
    if (this.bgmAudio) {
      this.bgmAudio.muted = this._muted
    }
    return this._muted
  }

  playTick() {
    try {
      const ctx = this.getContext()
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
    } catch {}
  }

  playFirework() {
    try {
      const ctx = this.getContext()
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
    } catch {}
  }

  playSparkle() {
    try {
      const ctx = this.getContext()
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
    } catch {}
  }

  playCelebration() {
    this.playFirework()
    setTimeout(() => this.playFirework(), 200)
    setTimeout(() => this.playFirework(), 500)
  }

  destroy() {
    if (this.bgmAudio) {
      this.bgmAudio.pause()
      this.bgmAudio.src = ''
      this.bgmAudio = null
    }
    if (this.ctx) {
      this.ctx.close()
      this.ctx = null
    }
  }
}

export const soundManager = SoundManager.getInstance()
