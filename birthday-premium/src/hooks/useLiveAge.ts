import { useState, useEffect } from 'react'
import { calculateAge, type LiveAge, BIRTH_DATE } from '../lib/ageCalculator'

export function useLiveAge(): LiveAge {
  const [age, setAge] = useState<LiveAge>(() => calculateAge(new Date()))

  useEffect(() => {
    const timer = setInterval(() => {
      setAge(calculateAge(new Date()))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return age
}
