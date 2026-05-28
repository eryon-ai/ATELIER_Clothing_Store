import { useEffect, useRef, useState } from 'react'

const MESSAGES = [
  'Complimentary Worldwide Shipping on Orders Over $500',
  'New Season Collections Now Live',
  'Limited Edition Drops — First Come, First Served',
  'Free Returns Within 30 Days',
  'Join ATELIER Circle for Exclusive Early Access',
]

export default function AnnouncementBar() {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIdx(i => (i + 1) % MESSAGES.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-primary text-on-primary py-2 px-margin-desktop text-center overflow-hidden">
      <p
        key={idx}
        className="font-label-md text-label-md tracking-[0.2em] uppercase whitespace-nowrap animate-fade-in"
      >
        {MESSAGES[idx]}
      </p>
    </div>
  )
}
