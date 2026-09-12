import { en } from './en'
import { as } from './as'
export type Lang = 'en' | 'as'
export const dictionaries = { en, as }
export function t(lang: Lang) {
  return dictionaries[lang]
}
export function formatDate(iso: string, lang: Lang): string {
  const d = new Date(iso)
  const locale = lang === 'as' ? 'as-IN' : 'en-IN'
  try {
    return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric' }).format(d)
  } catch {
    return d.toDateString()
  }
}
