import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
}

export function GradientText({ children, className = '' }: Props) {
  return (
    <span className={`text-gradient-orange ${className}`}>
      {children}
    </span>
  )
}
