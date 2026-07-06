import { cn } from '../../lib/utils'

export function CakeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={cn('w-32 h-32', className)}>
      <defs>
        <linearGradient id="cake-top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbcfe8" />
          <stop offset="100%" stopColor="#f472b6" />
        </linearGradient>
        <linearGradient id="cake-mid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f9a8d4" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
        <linearGradient id="cake-bot" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f472b6" />
          <stop offset="100%" stopColor="#db2777" />
        </linearGradient>
        <radialGradient id="candle-glow">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="100" cy="170" rx="80" ry="12" fill="#1a1a2e" opacity="0.3" />
      <rect x="30" y="145" width="140" height="25" rx="4" fill="url(#cake-bot)" />
      <rect x="25" y="125" width="150" height="22" rx="6" fill="url(#cake-mid)" />
      <rect x="35" y="95" width="130" height="32" rx="8" fill="url(#cake-top)" />
      <ellipse cx="100" cy="95" rx="65" ry="6" fill="#fbcfe8" />
      <circle cx="70" cy="105" r="6" fill="#fbbf24" opacity="0.6" />
      <circle cx="100" cy="100" r="5" fill="#fbbf24" opacity="0.5" />
      <circle cx="130" cy="108" r="7" fill="#fbbf24" opacity="0.4" />
      <circle cx="85" cy="115" r="4" fill="#34d399" opacity="0.5" />
      <circle cx="115" cy="112" r="5" fill="#60a5fa" opacity="0.5" />
      <rect x="96" y="68" width="8" height="28" rx="3" fill="#fff" />
      <ellipse cx="100" cy="68" rx="4" ry="6" fill="#f97316" />
      <ellipse cx="100" cy="66" rx="2" ry="3" fill="#fcd34d" />
      <circle cx="100" cy="64" r="15" fill="url(#candle-glow)" />
      <circle cx="100" cy="95" r="3" fill="#fff" opacity="0.8" />
      <circle cx="100" cy="120" r="2" fill="#fff" opacity="0.6" />
      <circle cx="100" cy="138" r="3" fill="#fff" opacity="0.5" />
      <circle cx="100" cy="155" r="2" fill="#fff" opacity="0.4" />
    </svg>
  )
}

export function GiftIcon({ className, color = '#f43f5e' }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={cn('w-28 h-28', className)}>
      <defs>
        <linearGradient id={`gift-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={`${color}88`} />
        </linearGradient>
      </defs>
      <rect x="40" y="100" width="120" height="80" rx="6" fill={`url(#gift-${color})`} />
      <rect x="40" y="90" width="120" height="18" rx="4" fill={color} />
      <rect x="90" y="90" width="20" height="90" fill="#fcd34d" />
      <rect x="40" y="100" width="120" height="4" fill="#fcd34d" opacity="0.3" />
      <ellipse cx="100" cy="100" rx="50" ry="8" fill="#1a1a2e" opacity="0.2" />
      <rect x="95" y="45" width="10" height="55" rx="5" fill="#fcd34d" />
      <path d="M100 45 Q130 30 150 50 Q130 60 100 55" fill="#fcd34d" opacity="0.6" />
      <path d="M100 45 Q70 30 50 50 Q70 60 100 55" fill="#fcd34d" opacity="0.6" />
      <circle cx="100" cy="48" r="3" fill="#fcd34d" />
      <circle cx="90" cy="60" r="2" fill="#fcd34d" opacity="0.5" />
      <circle cx="110" cy="62" r="1.5" fill="#fcd34d" opacity="0.4" />
    </svg>
  )
}

export function TeddyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={cn('w-32 h-32', className)}>
      <defs>
        <radialGradient id="teddy-body" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#d4a574" />
          <stop offset="100%" stopColor="#b88352" />
        </radialGradient>
        <radialGradient id="teddy-inner" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#e8c49a" />
          <stop offset="100%" stopColor="#d4a574" />
        </radialGradient>
      </defs>
      <ellipse cx="100" cy="160" rx="42" ry="30" fill={useColor('#b88352')} />
      <ellipse cx="100" cy="130" rx="35" ry="40" fill={useColor('#d4a574')} />
      <circle cx="100" cy="75" r="40" fill="url(#teddy-body)" />
      <circle cx="100" cy="82" r="22" fill="url(#teddy-inner)" />
      <ellipse cx="76" cy="62" rx="16" ry="20" fill="url(#teddy-body)" />
      <ellipse cx="124" cy="62" rx="16" ry="20" fill="url(#teddy-body)" />
      <ellipse cx="76" cy="62" rx="10" ry="14" fill="#e8c49a" />
      <ellipse cx="124" cy="62" rx="10" ry="14" fill="#e8c49a" />
      <circle cx="86" cy="68" r="4" fill="#2d1a0e" />
      <circle cx="114" cy="68" r="4" fill="#2d1a0e" />
      <circle cx="87" cy="67" r="1.5" fill="#fff" />
      <circle cx="115" cy="67" r="1.5" fill="#fff" />
      <ellipse cx="90" cy="74" rx="6" ry="2" fill="#2d1a0e" opacity="0.8" />
      <ellipse cx="110" cy="74" rx="6" ry="2" fill="#2d1a0e" opacity="0.8" />
      <ellipse cx="100" cy="78" rx="5" ry="3" fill="#e88d8d" />
      <path d="M96 80 Q100 85 104 80" fill="none" stroke="#2d1a0e" strokeWidth="1" strokeLinecap="round" />
      <circle cx="100" cy="55" r="5" fill="#d4a574" />
      <circle cx="92" cy="50" r="3" fill="#d4a574" />
      <circle cx="108" cy="50" r="3" fill="#d4a574" />
    </svg>
  )

  function useColor(c: string) { return c }
}

export function HeartIcon({ className, animate = true }: { className?: string; animate?: boolean }) {
  return (
    <svg viewBox="0 0 200 200" className={cn('w-16 h-16', className)}>
      <defs>
        <radialGradient id="heart-grad" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#fb7185" />
          <stop offset="100%" stopColor="#e11d48" />
        </radialGradient>
        <filter id="heart-glow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <path
        d="M100 170 C40 120 10 80 30 50 C50 20 100 40 100 70 C100 40 150 20 170 50 C190 80 160 120 100 170Z"
        fill="url(#heart-grad)"
        filter={animate ? 'url(#heart-glow)' : undefined}
      >
        {animate && (
          <>
            <animate attributeName="d" dur="2s" repeatCount="indefinite"
              values="M100 170 C40 120 10 80 30 50 C50 20 100 40 100 70 C100 40 150 20 170 50 C190 80 160 120 100 170Z;
                      M100 175 C35 115 5 75 25 45 C45 15 100 35 100 65 C100 35 155 15 175 45 C195 75 165 115 100 175Z;
                      M100 170 C40 120 10 80 30 50 C50 20 100 40 100 70 C100 40 150 20 170 50 C190 80 160 120 100 170Z" />
          </>
        )}
      </path>
    </svg>
  )
}

export function StarIcon({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const dims = size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-12 h-12' : 'w-8 h-8'
  return (
    <svg viewBox="0 0 100 100" className={cn(dims, className)}>
      <defs>
        <radialGradient id="star-grad" cx="40%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#f59e0b" />
        </radialGradient>
        <filter id="star-glow">
          <feGaussianBlur stdDeviation="3" />
          <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <path
        d="M50 5 L63 35 L95 38 L70 60 L76 93 L50 77 L24 93 L30 60 L5 38 L37 35Z"
        fill="url(#star-grad)"
        filter="url(#star-glow)"
      />
    </svg>
  )
}

export function CrownIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 120" className={cn('w-24 h-16', className)}>
      <defs>
        <linearGradient id="crown-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fcd34d" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>
      <path d="M10 100 L30 30 L60 60 L100 10 L140 60 L170 30 L190 100 Z" fill="url(#crown-grad)" />
      <circle cx="100" cy="10" r="8" fill="#fef08a" />
      <circle cx="60" cy="60" r="5" fill="#fef08a" opacity="0.7" />
      <circle cx="140" cy="60" r="5" fill="#fef08a" opacity="0.7" />
      <circle cx="30" cy="30" r="4" fill="#fef08a" opacity="0.5" />
      <circle cx="170" cy="30" r="4" fill="#fef08a" opacity="0.5" />
      <rect x="30" y="100" width="140" height="8" rx="3" fill="#f59e0b" opacity="0.6" />
      {[...Array(5)].map((_, i) => (
        <circle key={i} cx={50 + i * 25} cy={105} r="2" fill="#fef08a" opacity={0.3 + i * 0.1} />
      ))}
    </svg>
  )
}

export function SparkleParticle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn('w-4 h-4', className)}>
      <path d="M20 0 L22 18 L40 20 L22 22 L20 40 L18 22 L0 20 L18 18Z" fill="#fcd34d" />
    </svg>
  )
}

export function BalloonIcon({ className, color = '#f43f5e' }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 60 80" className={cn('w-12 h-16', className)}>
      <ellipse cx="30" cy="30" rx="22" ry="28" fill={color} />
      <ellipse cx="30" cy="25" rx="14" ry="18" fill={`${color}44`} />
      <path d="M30 55 L30 78" stroke={color} strokeWidth="1" fill="none" />
      <path d="M30 58 L25 65 M30 58 L35 65" stroke={color} strokeWidth="0.8" fill="none" />
    </svg>
  )
}

export function RibbonIcon({ className, color = '#f43f5e' }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={cn('w-16 h-16', className)}>
      <path d="M20 50 Q50 20 80 50 Q50 80 20 50" fill="none" stroke={color} strokeWidth="3" />
      <path d="M30 50 Q50 30 70 50 Q50 70 30 50" fill="none" stroke={`${color}88`} strokeWidth="2" />
      <circle cx="50" cy="50" r="6" fill={color} />
      <path d="M45 45 L55 55 M55 45 L45 55" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function ConfettiPiece({ className, color = '#fcd34d' }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={cn('w-3 h-3', className)}>
      <rect x="2" y="2" width="16" height="16" rx="3" fill={color} transform="rotate(45 10 10)" />
    </svg>
  )
}

export function FlowerIcon({ className, color = '#f472b6' }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 60 60" className={cn('w-10 h-10', className)}>
      {[0, 60, 120, 180, 240, 300].map((angle) => (
        <ellipse
          key={angle}
          cx="30"
          cy="30"
          rx="12"
          ry="6"
          fill={color}
          transform={`rotate(${angle} 30 30) translate(0 -10)`}
          opacity="0.7"
        />
      ))}
      <circle cx="30" cy="30" r="5" fill="#fcd34d" />
    </svg>
  )
}

export function ButterflyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 60" className={cn('w-16 h-12', className)}>
      <path d="M40 30 Q20 0 10 15 Q0 30 40 30" fill="#a78bfa" opacity="0.7" />
      <path d="M40 30 Q60 0 70 15 Q80 30 40 30" fill="#c4b5fd" opacity="0.7" />
      <path d="M40 30 Q20 60 10 45 Q0 30 40 30" fill="#8b5cf6" opacity="0.6" />
      <path d="M40 30 Q60 60 70 45 Q80 30 40 30" fill="#a78bfa" opacity="0.6" />
      <line x1="40" y1="30" x2="40" y2="10" stroke="#6d28d9" strokeWidth="2" />
      <line x1="40" y1="30" x2="40" y2="50" stroke="#6d28d9" strokeWidth="1.5" />
      <ellipse cx="40" cy="26" rx="2" ry="4" fill="#6d28d9" />
    </svg>
  )
}
