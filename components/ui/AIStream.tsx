'use client'
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface AIStreamProps {
  content: string
  isStreaming: boolean
}

export default function AIStream({ content, isStreaming }: AIStreamProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [displayedContent, setDisplayedContent] = useState('')

  useEffect(() => {
    setDisplayedContent(content)
  }, [content])

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [displayedContent])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass-card p-6 overflow-y-auto"
      ref={containerRef}
      style={{ maxHeight: 500 }}
    >
      <div className="text-sm leading-7 whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
        {displayedContent}
        {isStreaming && (
          <span
            className="inline-block w-2 h-5 ml-1 align-middle"
            style={{
              background: 'var(--accent)',
              animation: 'cursorBlink 1s step-end infinite',
            }}
          />
        )}
      </div>
      {!isStreaming && !content && (
        <div className="flex items-center gap-3" style={{ color: 'var(--text-muted)' }}>
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--accent)' }} />
          <span className="text-sm">Waiting for AI analysis...</span>
        </div>
      )}
    </motion.div>
  )
}
