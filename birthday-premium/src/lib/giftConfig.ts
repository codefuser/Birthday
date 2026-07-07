export interface GiftData {
  id: number
  title: string
  subtitle: string
  color: string
  displayTitle: string
  message: string
}

export const gifts: GiftData[] = [
  { id: 1, title: 'Joy', subtitle: 'Sweet Memories', color: '#f43f5e', displayTitle: 'Sweet Memories', message: 'May your life always be filled with sweetness.' },
  { id: 2, title: 'Love', subtitle: 'Forever Protected', color: '#d946ef', displayTitle: 'Forever Protected', message: 'May happiness always hug your heart.' },
  { id: 3, title: 'Success', subtitle: 'Precious Moments', color: '#fbbf24', displayTitle: 'Precious Moments', message: 'May love stay with you forever.' },
  { id: 4, title: 'Happiness', subtitle: 'Sweet Happiness', color: '#34d399', displayTitle: 'Sweet Happiness', message: 'Enjoy every little moment.' },
  { id: 5, title: 'Prosperity', subtitle: 'Bloom Beautifully', color: '#60a5fa', displayTitle: 'Bloom Beautifully', message: 'Keep shining wherever you go.' },
  { id: 6, title: 'Adventure', subtitle: 'Celebrate Every Dream', color: '#fb923c', displayTitle: 'Celebrate Every Dream', message: 'May all your dreams come true.' },
]
