// Utility: Merge Tailwind class names (like shadcn/ui cn())
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Format currency
export function formatPrice(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

// Format discount percentage
export function formatDiscount(original, sale) {
  const pct = Math.round(((original - sale) / original) * 100)
  return `${pct}% OFF`
}

// Truncate text
export function truncate(str, length = 60) {
  if (!str) return ''
  return str.length > length ? `${str.slice(0, length)}...` : str
}

// Debounce
export function debounce(fn, delay = 300) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

// Generate slug from string
export function toSlug(str) {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

// Get rating stars array (for rendering)
export function getRatingStars(rating) {
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5 ? 1 : 0
  const empty = 5 - full - half
  return { full, half, empty }
}

// localStorage helpers
export function getFromStorage(key, fallback = null) {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : fallback
  } catch {
    return fallback
  }
}

export function setToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    console.warn('localStorage unavailable')
  }
}
