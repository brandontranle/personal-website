export interface Skill {
  icon: string
}

export interface Project {
  title: string
  type: string
  description: string
  link: string
  skills: Skill[]
}

export interface Experience {
  title: string
  role: string
  location: string
  description: string[]
  skills: Skill[]
}

export interface Social {
  label: string
  href: string
  handle: string
}

export interface Profile {
  name: string
  fullName: string
  role: string
  tagline: string
  status: string
  location: string
  resumeUrl: string
  outsideOfWork: string
  quote: string
  socials: Social[]
}

export interface Fact {
  label: string
  value: string
}

export interface About {
  heading: string
  paragraphs: string[]
  rig: string[]
  facts: Fact[]
}

export interface Contact {
  heading: string
  blurb: string
  email: string
}

export interface Quote {
  quote: string
  film: string
}

export interface SiteContent {
  profile: Profile
  about: About
  contact: Contact
  marquee: Quote[]
  projects: Project[]
  experiences: Experience[]
}
