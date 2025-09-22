'use client'

import { cn } from '@/lib/utils'
import { User } from 'lucide-react'
import Image from 'next/image'

interface EmployeeAvatarProps {
  name: string
  avatar: string | null | undefined
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showName?: boolean
  nameClassName?: string
  updatedAt?: string
}

const sizeClasses = {
  sm: 'size-12 text-xs',
  md: 'size-16 text-sm',
  lg: 'size-20 text-base',
  xl: 'size-24 text-lg'
}

const iconSizes = {
  sm: 'size-12',
  md: 'size-16',
  lg: 'size-20',
  xl: 'size-24'
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
    if (avatar && avatar.startsWith('/avatars/') && !avatar.includes('default')) {
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
      <div className={cn('flex items-center', className)}>
        <div className={`rounded-full overflow-hidden bg-primary/15 flex items-center justify-center ${sizeClass}`}>
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={`${name} avatar`}
              width={250}
              height={250}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className={`text-muted-foreground ${iconSize}`} />
          )}
        </div>
        <span className={`font-medium mr-3 ${nameClassName}`}>{name}</span>
      </div>
    )
  }

  return (
    <div className={`rounded-full overflow-hidden bg-primary/15 flex items-center justify-center ${sizeClass} ${className}`}>
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={`${name} avatar`}
          width={250}
          height={250}
          className="w-full h-full object-cover"
        />
      ) : (
        <User className={`text-muted-foreground ${iconSize}`} />
      )}
    </div>
  )
}
