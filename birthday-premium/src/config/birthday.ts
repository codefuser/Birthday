export interface BirthdayConfig {
  friendName: string
  birthdayDate: string
  birthDate: Date
  greetingMessages: {
    main: string
    sub: string
    final: string
  }
  photos: string[]
  videos: string[]
  backgroundMusic: string
  finalMessage: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
  }
}

function loadImages(): string[] {
  const images: string[] = []
  const imageContext = import.meta.glob('/public/assets/images/*.{jpeg,jpg,png,gif,webp}', {
    eager: true,
    query: '?url',
    import: 'default',
  })
  for (const path of Object.keys(imageContext)) {
    const mod = imageContext[path]
    if (typeof mod === 'string' && mod) images.push(mod)
  }
  return images
}

export const birthdayConfig: BirthdayConfig = {
  friendName: 'Birthday Star',
  birthdayDate: 'July 7, 2006',
  birthDate: new Date(2006, 6, 7),
  greetingMessages: {
    main: 'Happy Birthday!',
    sub: 'Another year of being amazing. Today we celebrate YOU.',
    final: 'Wishing you a year filled with love, laughter, and everything you deserve.',
  },
  photos: loadImages(),
  videos: [],
  backgroundMusic: '/assets/audio/HB_song.mp3',
  finalMessage: 'May your life be as beautiful as the joy you bring to others. Happy Birthday!',
  colors: {
    primary: '#f43f5e',
    secondary: '#fbbf24',
    accent: '#a78bfa',
    background: '#0a0a1a',
    text: '#faf9f5',
  },
}
