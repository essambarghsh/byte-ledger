'use client'

import { User } from 'lucide-react'
import Image from 'next/image'

interface EmployeeAvatarProps {
  name: string
  avatar: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showName?: boolean
  nameClassName?: string
  updatedAt?: string
}

const sizeClasses = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-8 h-8 text-sm',
  lg: 'w-10 h-10 text-base',
  xl: 'w-12 h-12 text-lg'
}

const iconSizes = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
  xl: 'w-6 h-6'
}

export function EmployeeAvatar({ 
  name, 
  avatar, 
  size = 'md', 
  className = '',
  showName = false,
  nameClassName = '',
  updatedAt
}: EmployeeAvatarProps) {
  const getAvatarUrl = () => {
    if (avatar.startsWith('/avatars/') && !avatar.includes('default')) {
      // Add timestamp to bust browser cache using updatedAt only (avoid Date.now() for SSR)
      if (updatedAt) {
        const timestamp = new Date(updatedAt).getTime()
        return `/api${avatar}?t=${timestamp}`
      }
      // If no updatedAt, return without cache busting to avoid hydration mismatch
      return `/api${avatar}`
    }
    return null
  }

  const avatarUrl = getAvatarUrl()
  const sizeClass = sizeClasses[size]
  const iconSize = iconSizes[size]

  if (showName) {
    return (
      <div className={`flex items-center space-x-2 rtl:space-x-reverse ${className}`}>
        <div className={`rounded-full overflow-hidden bg-primary/10 border border-border flex items-center justify-center ${sizeClass}`}>
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={`${name} avatar`}
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className={`text-muted-foreground ${iconSize}`} />
          )}
        </div>
        <span className={`font-medium ${nameClassName}`}>{name}</span>
      </div>
    )
  }

  return (
    <div className={`rounded-full overflow-hidden bg-primary/10 border border-border flex items-center justify-center ${sizeClass} ${className}`}>
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={`${name} avatar`}
          width={48}
          height={48}
          className="w-full h-full object-cover"
        />
      ) : (
        <User className={`text-muted-foreground ${iconSize}`} />
      )}
    </div>
  )
}
