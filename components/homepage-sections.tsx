"use client"

import { useSiteConfig } from "./site-config-context"
import FullScreenHomes from "./full-screen-homes"
import SocialStrip from "./social-strip"
import PledgeSection from "./pledge-section"
import Experiences from "./experiences"
import FooterCTA from "./footer-cta"
import Hero from "./hero"

/**
 * Client-side wrapper that applies site-config section toggles
 * to homepage sections. Navigation is always shown.
 */
export function HomepageSections() {
  const { isSectionEnabled } = useSiteConfig()

  return (
    <>
      {isSectionEnabled("str", "hero") && <Hero />}

      {/* Section Separator */}
      {isSectionEnabled("str", "fullScreenHomes") && (
        <>
          <div className="section-separator"></div>
          <FullScreenHomes />
        </>
      )}

      {isSectionEnabled("str", "socialStrip") && <SocialStrip />}

      {isSectionEnabled("str", "pledge") && <PledgeSection />}

      {(isSectionEnabled("str", "insidersGuide") || isSectionEnabled("str", "conciergeDirectory")) && (
        <>
          <div className="section-separator"></div>
          <Experiences
            showInsidersGuide={isSectionEnabled("str", "insidersGuide")}
            showConciergeDirectory={isSectionEnabled("str", "conciergeDirectory")}
          />
        </>
      )}

      {isSectionEnabled("str", "footerCta") && <FooterCTA />}
    </>
  )
}
