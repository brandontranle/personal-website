export type SectionId = 'index' | 'work' | 'experience' | 'about' | 'contact'

export type NavHandler = (id: SectionId) => void

export const NAV: { id: SectionId; label: string; num: string }[] = [
  { id: 'index', label: 'Index', num: '01' },
  { id: 'work', label: 'Work', num: '02' },
  { id: 'experience', label: 'Experience', num: '03' },
  { id: 'about', label: 'About', num: '04' },
  { id: 'contact', label: 'Contact', num: '05' },
]
