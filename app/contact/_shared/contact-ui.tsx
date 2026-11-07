import { ArrowRight, Mail, PhoneCall } from 'lucide-react'
import Link from 'next/link'
import type { ContactRoute } from '@/lib/contact'
import type { Person } from '@/lib/people'
import { AvatarPlaceholder } from '@/components/ui/AvatarPlaceholder'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

/**
 * Presentation for /contact, /get-started and /book-a-call.
 *
 * THE EMERGENCY TREATMENT, and what it deliberately is not:
 *   --signal-critical is NOT used. `components/ui/Badge.tsx` holds the only
 *   licence for the semantic palette in this codebase, and spending red on page
 *   chrome here is exactly what makes a real Critical badge stop meaning
 *   anything. Urgency is carried by:
 *     · placement   - first band after the hero, and a strip above the fold
 *     · width       - the full container, where the other two routes share a row
 *     · weight      - a 2px border in --fg against the other cards' 1px hairline
 *     · scale       - the number set at display size, not as body copy
 *     · copy        - "Do not use the form", already written in lib/contact.ts
 */

const CSS = `
/* ---- the above-the-fold hotline strip ---- */
.ir-strip {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: var(--s2) var(--s4);
  margin-top: var(--s12);
  padding: var(--s4) var(--s6);
  border: 2px solid var(--fg);
  border-radius: var(--radius-md);
  background-color: var(--surface);
  color: var(--fg);
  text-decoration: none;
  transition:
    background-color var(--dur-base) var(--ease-out),
    border-color var(--dur-base) var(--ease-out);
}
.ir-strip:hover { background-color: color-mix(in oklab, var(--surface) 80%, var(--fg) 20%); }
.ir-strip__label {
  font-size: var(--text-xs);
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted-strong);
  flex: none;
}
.ir-strip__num {
  font-family: var(--font-inter-tight), var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  font-size: var(--text-xl);
  font-weight: 600;
  letter-spacing: var(--tracking-tight);
  white-space: nowrap;
}
.ir-strip__sla { font-size: var(--text-sm); color: var(--muted); }

/* ---- route cards ---- */
.route { display: grid; gap: var(--s4); }
.route__eyebrow {
  display: flex;
  align-items: center;
  gap: var(--s2);
  margin: 0;
  font-size: var(--text-xs);
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
}
.route__heading { margin: 0; font-size: var(--text-xl); max-width: 26ch; }
.route__body { margin: 0; color: var(--muted-strong); max-width: 64ch; }
.route__sla {
  margin: 0;
  padding-top: var(--s4);
  border-top: 1px solid var(--border);
  font-size: var(--text-sm);
  color: var(--muted);
}
.route__actions { display: flex; flex-wrap: wrap; align-items: center; gap: var(--s4); }
.route__secondary {
  display: inline-flex;
  align-items: center;
  gap: var(--s2);
  font-size: var(--text-sm);
  color: var(--muted-strong);
  text-decoration: none;
  transition: color var(--dur-base) var(--ease-out);
}
.route__secondary:hover { color: var(--fg); }

/* ---- the emergency card ---- */
.card.route-card--urgent { border-width: 2px; border-color: var(--fg); }
.route--urgent .route__eyebrow { color: var(--fg); }
.route--urgent .route__heading { font-size: var(--text-2xl); }
.route__tel {
  display: inline-block;
  font-family: var(--font-inter-tight), var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  font-size: clamp(var(--text-xl), 7.5vw, var(--text-4xl));
  font-weight: 700;
  letter-spacing: var(--tracking-tight);
  line-height: 1.05;
  color: var(--fg);
  text-decoration: none;
  overflow-wrap: anywhere;
  transition: color var(--dur-base) var(--ease-out);
}
.route__tel:hover { color: var(--accent); }
.route__telnote { margin: 0; font-size: var(--text-sm); color: var(--muted); }

.routes-grid { display: grid; gap: var(--s6); margin-top: var(--s6); }
@media (min-width: 900px) {
  .routes-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
.routes-grid__cell { display: grid; }
.routes-grid__cell > .card { height: 100%; }

/* ---- named humans ---- */
.route__people { display: flex; flex-wrap: wrap; gap: var(--s4); }
.person-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: var(--s4);
  align-items: start;
}
.person-row__name { margin: 0; font-size: var(--text-base); font-weight: 500; color: var(--fg); }
.person-row__name a { color: inherit; text-decoration: none; }
.person-row__name a:hover { color: var(--accent); }
.person-row__role { margin: 0; font-size: var(--text-sm); color: var(--muted); }
.person-row__certs {
  margin: var(--s2) 0 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: var(--s1) var(--s2);
  font-size: var(--text-xs);
  color: var(--muted);
}
.person-row__certs li::after { content: ' ·'; }
.person-row__certs li:last-child::after { content: ''; }

.people-groups { display: grid; gap: var(--s12); margin-top: var(--s12); }
@media (min-width: 900px) {
  .people-groups { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--s8); }
}
.people-group { display: grid; gap: var(--s6); align-content: start; }
.people-list { display: grid; gap: var(--s6); list-style: none; margin: 0; padding: 0; }

/* ---- the form band ---- */
.contact-split { display: grid; gap: var(--s12); }
@media (min-width: 900px) {
  .contact-split { grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr); gap: var(--s16); }
}
.contact-split__note { margin: var(--s4) 0 0; color: var(--muted); max-width: 40ch; }
.contact-aside {
  list-style: none;
  margin: var(--s8) 0 0;
  padding: 0;
  display: grid;
  gap: var(--s3);
  font-size: var(--text-sm);
}
.contact-aside li { display: flex; align-items: center; gap: var(--s2); min-width: 0; }
.contact-aside svg { flex: none; color: var(--muted); }
.contact-split__form { min-width: 0; }

/* ---- what happens next ---- */
.steps {
  list-style: none;
  margin: var(--s12) 0 0;
  padding: 0;
  display: grid;
  gap: var(--s8);
}
@media (min-width: 768px) {
  .steps { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--s12) var(--s8); }
}
@media (min-width: 1024px) {
  .steps { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}
.steps__item { display: grid; gap: var(--s2); align-content: start; padding-top: var(--s4); border-top: 1px solid var(--border); }
.steps__n { font-size: var(--text-sm); color: var(--accent); }
.steps__name { margin: 0; font-size: var(--text-lg); }
.steps__body { margin: 0; color: var(--muted); font-size: var(--text-sm); line-height: 1.55; }

/* ---- direct alternatives ---- */
.direct { list-style: none; margin: var(--s8) 0 0; padding: 0; display: grid; gap: var(--s4); }
@media (min-width: 640px) { .direct { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (min-width: 1024px) { .direct { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
.direct > li { display: grid; }
.direct .card { height: 100%; }
.direct__value {
  margin: var(--s3) 0 0;
  font-family: var(--font-inter-tight), var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  font-size: var(--text-lg);
  font-weight: 500;
  color: var(--fg);
  overflow-wrap: anywhere;
}
.direct__note { margin: var(--s2) 0 0; font-size: var(--text-sm); color: var(--muted); }

/* ---- offices ---- */
.offices { list-style: none; margin: var(--s8) 0 0; padding: 0; display: grid; gap: var(--s6); }
@media (min-width: 768px) { .offices { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
.offices__city {
  display: flex;
  align-items: center;
  gap: var(--s2);
  margin: 0;
  font-weight: 500;
  color: var(--fg);
  flex-wrap: wrap;
}
.offices__city svg { flex: none; color: var(--muted); }
.offices__line { margin: var(--s2) 0 0; color: var(--muted); font-size: var(--text-sm); max-width: 38ch; }

/* ---- reassurance ---- */
.reassure { margin: var(--s8) 0 0; display: grid; gap: var(--s6); }
@media (min-width: 768px) { .reassure { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--s8); } }
.reassure__row { padding-top: var(--s4); border-top: 1px solid var(--border); }
.reassure dt {
  font-size: var(--text-xs);
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
}
.reassure dd { margin: var(--s3) 0 0; color: var(--muted-strong); max-width: 54ch; }
`

export function ContactStyles() {
  return (
    <style href="envenox-contact" precedence="default">
      {CSS}
    </style>
  )
}

/* ------------------------------------------------------------------ *
 * A named human
 * ------------------------------------------------------------------ */

export function PersonRow({ person, size = 48 }: { person: Person; size?: number }) {
  return (
    <div className="person-row">
      <AvatarPlaceholder name={person.name} size={size} />
      <div>
        <p className="person-row__name">
          <Link href={`/about/leadership/${person.slug}`}>{person.name}</Link>
        </p>
        <p className="person-row__role">{person.role}</p>
        {person.certifications?.length ? (
          <ul className="person-row__certs">
            {person.certifications.slice(0, 3).map((cert) => (
              <li key={cert}>{cert}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ *
 * A route
 * ------------------------------------------------------------------ */

export function RouteCard({ route, people }: { route: ContactRoute; people: Person[] }) {
  const urgent = route.urgency === 'emergency'

  return (
    <Card
      as="div"
      padding="lg"
      className={urgent ? 'route-card--urgent' : undefined}
      id={`route-${route.id}`}
    >
      <div className={['route', urgent ? 'route--urgent' : ''].filter(Boolean).join(' ')}>
        <p className="route__eyebrow">
          {urgent ? <PhoneCall size={14} aria-hidden="true" /> : null}
          {route.label}
        </p>

        <h2 className="route__heading">{route.heading}</h2>

        {/* The emergency action is the number itself, rendered as a plain
            tel: anchor at display size. Not a button, not a reveal, not a
            modal, and never inside a <form>. */}
        {urgent ? (
          <>
            <p style={{ margin: 0 }}>
              <a className="route__tel u-tnum" href={route.action.href}>
                {route.action.label}
              </a>
            </p>
            <p className="route__telnote">{route.sla}</p>
          </>
        ) : null}

        <p className="route__body">{route.body}</p>

        {!urgent ? (
          <div className="route__actions">
            {route.action.kind === 'email' ? (
              <Button
                href={route.action.href}
                variant="secondary"
                iconLeft={<Mail size={16} aria-hidden="true" />}
              >
                {route.action.label}
              </Button>
            ) : (
              <Button
                href={route.action.href}
                variant="primary"
                iconRight={<ArrowRight size={16} aria-hidden="true" />}
              >
                {route.action.label}
              </Button>
            )}
            {route.secondary ? (
              <Link className="route__secondary u-link" href={route.secondary.href}>
                {route.secondary.label}
              </Link>
            ) : null}
          </div>
        ) : route.secondary ? (
          <p style={{ margin: 0 }}>
            <Link className="route__secondary u-link" href={route.secondary.href}>
              {route.secondary.label}
            </Link>
          </p>
        ) : null}

        {!urgent ? <p className="route__sla">{route.sla}</p> : null}

        {people.length > 0 ? (
          <div className="route__people">
            {people.map((person) => (
              <PersonRow key={person.slug} person={person} size={40} />
            ))}
          </div>
        ) : null}
      </div>
    </Card>
  )
}
