'use client'

interface NewsTickerBarProps {
  headlines: { date: string; text: string }[]
}

export default function NewsTickerBar({ headlines }: NewsTickerBarProps) {
  if (!headlines || headlines.length === 0) return null

  const tickerContent = headlines.map(h => `${h.date} — ${h.text}`).join('   •   ')

  return (
    <div className="w-full overflow-hidden" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', height: 36 }}>
      <div className="flex items-center h-full" style={{ animation: 'ticker 30s linear infinite', whiteSpace: 'nowrap' } as React.CSSProperties}>
        <span className="font-mono-data text-xs px-4" style={{ color: 'var(--text-muted)' }}>
          {tickerContent}
        </span>
        <span className="font-mono-data text-xs px-4" style={{ color: 'var(--text-muted)' }}>
          {tickerContent}
        </span>
      </div>
    </div>
  )
}
