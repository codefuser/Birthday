export interface BirthdayConfig {
  friendName: string
  birthdayDate: string
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
    const url = imageContext[path] as string
    if (url) images.push(url)
  }
  return images
}

export const birthdayConfig: BirthdayConfig = {
  friendName: 'Birthday Star',
  birthdayDate: 'July 15, 2026',
  greetingMessages: {
    main: 'Happy Birthday!',
    sub: 'Another year of being amazing. Today we celebrate YOU.',
    final: 'Wishing you a year filled with love, laughter, and everything you deserve.',
  },
  photos: loadImages(),
  videos: [],
  backgroundMusic: '',
  finalMessage: 'May your life be as beautiful as the joy you bring to others. Happy Birthday!',
  colors: {
    primary: '#f43f5e',
    secondary: '#fbbf24',
    accent: '#a78bfa',
    background: '#0a0a1a',
    text: '#faf9f5',
  },
}
