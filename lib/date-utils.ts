import { parseISO } from 'date-fns'

export const CAIRO_TIMEZONE = 'Africa/Cairo'

// Fake date system for testing
let fakeCurrentDate: Date | null = null

export function setFakeDate(date: Date | null): void {
  fakeCurrentDate = date
}

export function getFakeDate(): Date | null {
  return fakeCurrentDate
}

function getCurrentDate(): Date {
  return fakeCurrentDate || new Date()
}

export function formatDateTimeCairo(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  
  // Use a consistent format that works the same on server and client
  // Format to avoid hydration mismatch by using explicit formatting
  const formatter = new Intl.DateTimeFormat('ar-US', {
    timeZone: CAIRO_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
  
  // Get the formatted string and normalize it to avoid server/client differences
  const formatted = formatter.format(dateObj)
  
  // Remove inconsistent punctuation that can vary between server/client
  return formatted.replace(/،\s*/g, ' ').replace(/\s+/g, ' ').trim()
}

export function formatDateCairo(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  
  const formatter = new Intl.DateTimeFormat('ar-US', {
    timeZone: CAIRO_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
  
  // Get the formatted string and normalize it to avoid server/client differences
  const formatted = formatter.format(dateObj)
  
  // Remove inconsistent punctuation that can vary between server/client
  return formatted.replace(/،\s*/g, ' ').replace(/\s+/g, ' ').trim()
}

export function formatTimeCairo(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  
  const formatter = new Intl.DateTimeFormat('ar-US', {
    timeZone: CAIRO_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
  
  // Get the formatted string and normalize it to avoid server/client differences
  const formatted = formatter.format(dateObj)
  
  // Remove inconsistent punctuation that can vary between server/client
  return formatted.replace(/،\s*/g, ' ').replace(/\s+/g, ' ').trim()
}

export function getCurrentDateTimeCairo(): string {
  return getCurrentDate().toISOString()
}

export function getDateStringCairo(date?: Date): string {
  const targetDate = date || getCurrentDate()
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: CAIRO_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(targetDate)
}

export function isToday(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  const today = getCurrentDate()
  return getDateStringCairo(dateObj) === getDateStringCairo(today)
}

export function isYesterday(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  const yesterday = getCurrentDate()
  yesterday.setDate(yesterday.getDate() - 1)
  return getDateStringCairo(dateObj) === getDateStringCairo(yesterday)
}

export function isPastDate(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  const today = getCurrentDate()
  return getDateStringCairo(dateObj) < getDateStringCairo(today)
}
