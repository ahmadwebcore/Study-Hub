import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatScore(score: number, total: number = 100): string {
  return `${Math.round((score / total) * 100)}%`
}

export function getGradeBadge(percentage: number): { label: string; color: string; bg: string } {
  if (percentage >= 90) return { label: 'A+ (Outstanding)', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' }
  if (percentage >= 80) return { label: 'A (Excellent)', color: 'text-emerald-600', bg: 'bg-emerald-50/80 border-emerald-200' }
  if (percentage >= 70) return { label: 'B (Good)', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' }
  if (percentage >= 60) return { label: 'C (Average)', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' }
  return { label: 'Needs Improvement', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' }
}
