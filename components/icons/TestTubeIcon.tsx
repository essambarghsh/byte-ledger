import React from 'react'

interface TestTubeIconProps {
  className?: string
}

export function TestTubeIcon({ className = "h-4 w-4" }: TestTubeIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-5a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 1 .5-.5h5Z"/>
      <path d="M11 5v16a2 2 0 0 0 2 2 2 2 0 0 0 2-2V5"/>
      <circle cx="12" cy="17" r="1"/>
    </svg>
  )
}
