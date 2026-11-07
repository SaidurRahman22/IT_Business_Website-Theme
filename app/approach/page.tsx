// Keep the lucide-react import FIRST and braced - see the note in Nav.tsx.
import { ArrowRight, CircleAlert, MoveRight, RotateCcw } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Section } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { ChapterOpener } from '@/components/ui/ChapterOpener'
import { Faq } from '@/components/ui/Faq'
import { Reveal, RevealGroup } from '@/components/ui/Reveal'
import { site } from '@/lib/site'
import { servicesBySlug } from '@/lib/services'
import {
  approachIntro,
  approachPrinciples,
  approachFaqs,
  loopStages,
} from '@/lib/approach'
import styles from './approach.module.css'

/**
 * /approach - The Adversary Loop.
 *
 * ===========================================================================
 * WHY THIS IS NOT components/diagram/SecureSdlcPipeline.tsx
 * ===========================================================================
 * The brief asked for that component to be reused or adapted by props if it
 * could be. It was read first. Mechanically it would take the data: `stages`
 * is a prop and `nodeX(i, count)` is parameterised by stage count, so five
 * nodes would lay out. It was still the wrong instrument, for three reasons
 * that are about the content rather than the code:
 *
 *   1. It is a TWO-LANE diagram. Every stage must declare `lane: 'security' |
 *      'dev'`, and the legend strings `SECURITY`/`DEV` are module constants
 *      with no prop. Four of the five Adversary Loop stages have an `owns`
 *      value that is explicitly BOTH sides at once - "Security engineer
 *      facilitates · your engineers author", "Delivery squad · security
 *      engineer at 20–30%", "Both practices · reviewed with you quarterly".
 *      Forcing each into one of two lanes would assert a split that the copy
 *      spends its whole length denying.
 *   2. It has no slot for `failureIfSkipped`. That field is the thing which
 *      makes this a method rather than a slogan, and the brief asks for it to
 *      have real visual prominence. In the pipeline it would have had to go
 *      into `detail`, which renders as one sentence in a list.
 *   3. `/services/devsecops` is the commercial expression of this method and
 *      is owned by another agent, which is where that diagram's seven canonical
 *      stages belong. Two drawings of the same claim, one of them distorted to
 *      fit, is worse than one drawing and one sequence.
 *
 * So the loop is rendered here as a numbered sequence with an explicit return
 * path: a dashed accent channel down the left gutter from the centre of stage
 * 1's marker to the return block at the foot of the list, arrowhead pointing
 * back into stage 1, plus a real `#stage-1` anchor in the block itself. The
 * spine between stages is a plain hairline, so the one edge that closes the
 * loop is the one edge drawn differently. SVG and CSS only, no second WebGL
 * anything, and it is complete in the first painted frame with no script.
 */

const devsecops = servicesBySlug['devsecops']

export const metadata: Metadata = {
  title: `${approachIntro.name}, our method`,
  description: approachIntro.lead,
  alternates: { canonical: '/approach' },
  openGraph: {
    title: `${approachIntro.name} · ${site.name}`,
    description: approachIntro.headline,
    url: '/approach',
  },
}

export default function ApproachPage() {
  const first = loopStages[0]
  const last = loopStages[loopStages.length - 1]

  return (
    <>
      {/* ---------------------------------------------------------------- *
       * HERO
       * ---------------------------------------------------------------- */}
      <Section theme="dark" grain offsetNav aria-labelledby="approach-title">
        <p className="u-eyebrow">{approachIntro.eyebrow}</p>

        <h1
          id="approach-title"
          style={{ fontSize: 'clamp(2.5rem, 7vw, 5.5rem)', marginTop: 'var(--s4)' }}
        >
          {approachIntro.name}
        </h1>

        <p className={styles.headline}>{approachIntro.headline}</p>

        <p
          className="u-measure"
          style={{ color: 'var(--muted)', marginTop: 'var(--s8)' }}
        >
          {approachIntro.lead}
        </p>
      </Section>

      {/* ---------------------------------------------------------------- *
       * THE ONE SERIF MOMENT ON THESE PAGES.
       * ChapterOpener is rationed to three instances sitewide; this is the
       * allocation for /approach. Do not add a second anywhere in this scope.
       * ---------------------------------------------------------------- */}
      <Section theme="light" tight>
        <ChapterOpener rule as="p">
          {approachIntro.serifMoment}
        </ChapterOpener>
      </Section>

      {/* ---------------------------------------------------------------- *
       * THE FIVE STAGES
       * ---------------------------------------------------------------- */}
      <Section theme="light" aria-labelledby="loop-heading">
        <h2 id="loop-heading" className="u-eyebrow" style={{ marginBottom: 'var(--s8)' }}>
          The five stages
        </h2>

        <div className={styles.loopWrap}>
          <span className={styles.returnChannel} aria-hidden="true" />
          <span className={styles.returnHead} aria-hidden="true" />

          <ol className={styles.loop}>
            {loopStages.map((stage) => (
              <Reveal
                as="li"
                key={stage.n}
                id={`stage-${stage.n}`}
                className={styles.stage}
              >
                <div className={styles.marker}>
                  <span className={`u-mono ${styles.markerDisc}`} aria-hidden="true">
                    {stage.n}
                  </span>
                  <span className={styles.markerRail} aria-hidden="true" />
                </div>

                <div className={styles.stageHead}>
                  <h3 id={`stage-${stage.n}-name`} className={styles.stageName}>
                    <span className={styles.srOnly}>{`Stage ${stage.n}: `}</span>
                    {stage.name}
                  </h3>
                  <p className={styles.stageOneLine}>{stage.oneLine}</p>
                </div>

                <ul className={styles.what}>
                  {stage.what.map((line) => (
                    <li key={line.slice(0, 40)}>{line}</li>
                  ))}
                </ul>

                <dl className={styles.meta}>
                  <div className={styles.metaCell}>
                    <dt className={styles.metaLabel}>Owns it</dt>
                    <dd className={styles.metaValue} style={{ margin: 0 }}>
                      {stage.owns}
                    </dd>
                  </div>
                  <div className={styles.metaCell}>
                    <dt className={styles.metaLabel}>Artefact</dt>
                    <dd className={styles.metaValue} style={{ margin: 0 }}>
                      {stage.artefact}
                    </dd>
                  </div>
                </dl>

                {/* The field that makes this checkable. */}
                <div className={styles.failure}>
                  <p className={styles.failureLabel}>
                    <CircleAlert size={14} aria-hidden="true" />
                    If this stage is skipped
                  </p>
                  <p className={styles.failureBody}>{stage.failureIfSkipped}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>

        {/* ---- the return path, stated in words as well as drawn ---- */}
        <Reveal as="div" className={styles.returnCard} aria-labelledby="return-label">
          <span className={styles.returnIcon} aria-hidden="true">
            <RotateCcw size={20} />
          </span>
          <div>
            <p id="return-label" className={styles.returnLabel}>
              {`Stage ${last.n} returns to stage ${first.n}`}
            </p>
            <p className={styles.returnLine}>{last.oneLine}</p>
            <Link className={`u-link ${styles.returnTo}`} href={`#stage-${first.n}`}>
              {`Back to stage ${first.n}, ${first.name}`}
              <MoveRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </Reveal>
      </Section>

      {/* ---------------------------------------------------------------- *
       * PRINCIPLES
       * ---------------------------------------------------------------- */}
      <Section theme="deep" aria-labelledby="principles-heading">
        <h2 id="principles-heading" style={{ fontSize: 'var(--text-3xl)', maxWidth: '18ch' }}>
          What follows from it
        </h2>

        <RevealGroup as="ul" className={styles.principles}>
          {approachPrinciples.map((principle) => (
            <Reveal as="li" key={principle.heading} className={styles.principle}>
              <h3 className={styles.principleHeading}>{principle.heading}</h3>
              <p className={styles.principleBody}>{principle.body}</p>
            </Reveal>
          ))}
        </RevealGroup>
      </Section>

      {/* ---------------------------------------------------------------- *
       * THE COMMERCIAL EXPRESSION
       * ---------------------------------------------------------------- */}
      <Section theme="light" tight aria-labelledby="commercial-heading">
        <div className={styles.commercial}>
          <div>
            <p className="u-eyebrow">Buying it</p>
            <h2 id="commercial-heading" className={styles.commercialHeading}>
              {devsecops.name}
            </h2>
            <p className={styles.commercialBody}>{devsecops.cardLine}</p>
            <p className={styles.commercialBody} style={{ marginTop: 'var(--s3)' }}>
              {devsecops.outcome}
            </p>
          </div>
          <Button
            href="/services/devsecops"
            variant="primary"
            size="lg"
            iconRight={<ArrowRight size={18} aria-hidden="true" />}
          >
            {devsecops.name}
          </Button>
        </div>
      </Section>

      {/* ---------------------------------------------------------------- *
       * FAQ - the only FAQ block on this page, so it keeps the JSON-LD.
       * ---------------------------------------------------------------- */}
      <Section theme="dark" aria-labelledby="approach-faq-heading">
        <h2
          id="approach-faq-heading"
          style={{ fontSize: 'var(--text-3xl)', maxWidth: '18ch', marginBottom: 'var(--s12)' }}
        >
          Questions buyers ask about this
        </h2>
        <Faq items={approachFaqs} headingLevel={3} />
      </Section>

      {/* ---------------------------------------------------------------- *
       * CTA
       * ---------------------------------------------------------------- */}
      <Section theme="deep" tight>
        <h2 style={{ fontSize: 'var(--text-2xl)', maxWidth: '22ch' }}>{site.tagline}</h2>
        <p className="u-measure" style={{ color: 'var(--muted)', marginTop: 'var(--s4)' }}>
          {site.contact.responseSla}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--s3)', marginTop: 'var(--s8)' }}>
          <Button href={site.primaryCta.href} variant="primary" size="lg">
            {site.primaryCta.label}
          </Button>
          <Button href={site.secondaryCta.href} variant="secondary" size="lg">
            {site.secondaryCta.label}
          </Button>
        </div>
      </Section>
    </>
  )
}
