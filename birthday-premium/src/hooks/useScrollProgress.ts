import { useState, useEffect, useRef } from 'react'

export function useScrollProgress() {
  const [progress, setProgress] = useState(0)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const update = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      setProgress(docHeight > 0 ? scrollTop / docHeight : 0)
      rafRef.current = requestAnimationFrame(update)
    }
    rafRef.current = requestAnimationFrame(update)
    return () => cancelAnimationFrame(rafRef.current!)
  }, [])

  return progress
}
