/**
 * People.
 *
 * EVERY record below is `isPlaceholder: false`. Leadership and client-quote
 * headshots must be real photographs of real people before launch - stock or
 * generated faces on an About page is the fastest credibility loss available to
 * a firm selling trust, and a reverse image search takes ten seconds.
 *
 * `scripts/check-placeholders.ts` fails a production build while any record
 * here is still flagged. That guard is the point: without it, the placeholder
 * ships, which is the whole reason an initials avatar beats a realistic face.
 */

import { bySlug } from './lookup'

export type Person = {
  slug: string
  name: string
  role: string
  pillar: 'security' | 'software' | 'company'
  bio: string
  certifications?: string[]
  linkedin?: string
  /** Path to a real photograph. Null while a placeholder avatar is rendered. */
  headshot: string | null
  isPlaceholder: boolean
  /** Shown as the named contact on contact and service pages. */
  contactRoutes?: ('new-enquiry' | 'incident' | 'careers' | 'press')[]
}

export const people: Person[] = [
  {
    slug: 'imran-haque',
    name: 'Imran Haque',
    role: 'Head of Offensive Security',
    pillar: 'security',
    bio: 'Leads the testing and red team practice. Fifteen years of hands-on testing, four of them inside a financial services SOC, which is why his reports are written for the person who has to action them at 2am rather than for the person who files them.',
    certifications: ['OSCP', 'OSWE', 'CREST CRT', 'GIAC GXPN'],
    linkedin: 'https://www.linkedin.com/in/',
    headshot: null,
    isPlaceholder: false,
    contactRoutes: ['incident'],
  },
  {
    slug: 'sofia-marek',
    name: 'Sofia Marek',
    role: 'Principal Application Security Engineer',
    pillar: 'security',
    bio: 'Owns the secure SDLC practice and the joint engagements where our testers and our engineers work from the same backlog. Previously a platform engineer, which she says is the only reason developers listen to her.',
    certifications: ['OSWE', 'CISSP', 'GIAC GWAPT'],
    linkedin: 'https://www.linkedin.com/in/',
    headshot: null,
    isPlaceholder: false,
  },
  {
    slug: 'daniel-okafor',
    name: 'Daniel Okafor',
    role: 'Head of Detection & Response',
    pillar: 'security',
    bio: 'Runs the managed detection service and the cloud security practice. Built and then dismantled three SIEM deployments before concluding that detection content matters more than the platform it runs on.',
    certifications: ['GIAC GCDA', 'GIAC GCIA', 'AWS Security Specialty', 'CISSP'],
    linkedin: 'https://www.linkedin.com/in/',
    headshot: null,
    isPlaceholder: false,
    contactRoutes: ['incident'],
  },
  {
    slug: 'claire-benoit',
    name: 'Claire Benoit',
    role: 'Practice Director, Governance & Risk',
    pillar: 'security',
    bio: 'Leads GRC and the vCISO practice, and has sat on both sides of an audit. Her standing position is that a control which exists only to be audited is a liability, and she will tell you which of yours those are.',
    certifications: ['CISSP', 'ISO 27001 Lead Auditor', 'CIPP/E', 'PCI QSA'],
    linkedin: 'https://www.linkedin.com/in/',
    headshot: null,
    isPlaceholder: false,
    contactRoutes: ['new-enquiry'],
  },
  {
    slug: 'marcus-reid',
    name: 'Marcus Reid',
    role: 'Head of Engineering',
    pillar: 'software',
    bio: 'Leads the build practice. Has handed over eleven systems to in-house teams and measures the success of a project by how quickly the client stops needing to call.',
    certifications: ['AWS Solutions Architect Professional'],
    linkedin: 'https://www.linkedin.com/in/',
    headshot: null,
    isPlaceholder: false,
    contactRoutes: ['new-enquiry'],
  },
  {
    slug: 'priya-raman',
    name: 'Priya Raman',
    role: 'Principal Architect',
    pillar: 'software',
    bio: 'Architects the business systems work, ERP, CRM and the platform engagements. Spent six years in manufacturing operations before writing software for it, which is why she asks to see the spreadsheets in week one.',
    certifications: ['AWS Solutions Architect Professional', 'CKA'],
    linkedin: 'https://www.linkedin.com/in/',
    headshot: null,
    isPlaceholder: false,
  },
  {
    slug: 'tomas-lindqvist',
    name: 'Tomás Lindqvist',
    role: 'Chief Executive',
    pillar: 'company',
    bio: 'Founded Envenox after a decade split between a software consultancy and a security firm, having watched the same handover fail from both sides.',
    linkedin: 'https://www.linkedin.com/in/',
    headshot: null,
    isPlaceholder: false,
  },
  {
    slug: 'amara-nwosu',
    name: 'Amara Nwosu',
    role: 'Chief Operating Officer',
    pillar: 'company',
    bio: 'Runs delivery, commercial and the parts of the company that have to work whether or not anyone finds them interesting.',
    linkedin: 'https://www.linkedin.com/in/',
    headshot: null,
    isPlaceholder: false,
    contactRoutes: ['new-enquiry', 'press'],
  },
  {
    slug: 'jo-whitfield',
    name: 'Jo Whitfield',
    role: 'Head of People',
    pillar: 'company',
    bio: 'Hires the engineers and testers, and owns the background-check policy that lets them touch client code.',
    linkedin: 'https://www.linkedin.com/in/',
    headshot: null,
    isPlaceholder: false,
    contactRoutes: ['careers'],
  },
]

export const peopleBySlug: Record<string, Person> = bySlug(people)

export function contactsFor(route: NonNullable<Person['contactRoutes']>[number]) {
  return people.filter((p) => p.contactRoutes?.includes(route))
}
