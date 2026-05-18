'use client'
import { useEffect, useState } from 'react'

interface MarketItem {
  symbol: string
  name: string
  price: number
  changePercent: number
  isCrypto?: boolean
}

const INITIAL_ITEMS: MarketItem[] = [
  { symbol: 'NIFTY 50', name: 'Nifty Index', price: 22480, changePercent: 0.35 },
  { symbol: 'BTC', name: 'Bitcoin', price: 5642100, changePercent: 1.22, isCrypto: true },
  { symbol: 'ETH', name: 'Ethereum', price: 284320, changePercent: -0.45, isCrypto: true },
  { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2940, changePercent: 0.78 },
  { symbol: 'GOLD (24K)', name: 'Gold Spot', price: 7250, changePercent: 0.12 },
  { symbol: 'TATA MOTORS', name: 'Tata Motors', price: 960, changePercent: -1.48 },
  { symbol: 'FINX INDEX', name: 'FINX Intelligent Basket', price: 12840, changePercent: 3.42 },
]

export default function LiveMarketTicker() {
  const [items, setItems] = useState<MarketItem[]>(INITIAL_ITEMS)

  useEffect(() => {
    const interval = setInterval(() => {
      setItems(prev =>
        prev.map(item => {
          const jitterPercent = (Math.random() - 0.5) * 0.15 // small random fluctuation
          const newPrice = Math.max(1, item.price * (1 + jitterPercent / 100))
          const newChange = item.changePercent + jitterPercent
          return {
            ...item,
            price: Math.round(newPrice * 100) / 100,
            changePercent: Math.round(newChange * 100) / 100,
          }
        })
      )
    }, 2500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full overflow-hidden flex items-center border-b select-none" 
      style={{ 
        background: 'rgba(9, 13, 23, 0.85)', 
        borderColor: 'var(--border-color)', 
        height: 40,
        backdropFilter: 'blur(8px)'
      }}>
      
      {/* Ticker Tape animation wrapper */}
      <div className="flex whitespace-nowrap items-center gap-12 px-6 py-2"
        style={{
          animation: 'ticker 45s linear infinite',
        }}>
        
        {/* Double-render items to form a seamless loop */}
        {[...items, ...items].map((item, idx) => {
          const isPositive = item.changePercent >= 0
          return (
            <div key={idx} className="inline-flex items-center gap-2 text-xs font-medium">
              <span className="font-mono-data" style={{ color: 'var(--text-primary)' }}>{item.symbol}</span>
              <span className="font-mono-data font-bold" style={{ color: 'var(--text-secondary)' }}>
                ₹{item.price.toLocaleString('en-IN', { maximumFractionDigits: item.price > 1000 ? 0 : 2 })}
              </span>
              <span className="font-mono-data flex items-center gap-0.5 rounded px-1.5 py-0.5" 
                style={{ 
                  background: isPositive ? 'rgba(0, 229, 160, 0.08)' : 'rgba(255, 77, 109, 0.08)',
                  color: isPositive ? 'var(--positive)' : 'var(--negative)' 
                }}>
                {isPositive ? '▲' : '▼'} {Math.abs(item.changePercent).toFixed(2)}%
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
