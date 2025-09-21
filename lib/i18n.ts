import arDict from '@/dictionaries/ar.json'

type Dictionary = typeof arDict

export function getDictionary(): Dictionary {
  return arDict
}

export function t(key: string, dict: Dictionary = getDictionary()): string {
  const keys = key.split('.')
  let value: unknown = dict
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = (value as Record<string, unknown>)[k]
    } else {
      return key // Return key if not found
    }
  }
  
  return typeof value === 'string' ? value : key
}
