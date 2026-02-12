// Copyright 2023-2025 Deno authors. All rights reserved. MIT license.
import type { State } from "@/plugins/session.ts";
import Head from "@/components/Head.tsx";
import ItemsList from "@/islands/ItemsList.tsx";
import { defineRoute } from "$fresh/server.ts";
import { isGitHubSetup } from "@/utils/github.ts";
import { redirect } from "@/utils/http.ts";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
} from "@/utils/constants.ts";
import {
  AudioReactiveCard,
  BrandButton,
  BrandSlogan,
  GlitchText,
  Logo,
  LogoHolographic,
  NarrativeStep,
  TurntableAnimation,
  VUMeter,
} from "@/components/branding/index.ts";

export default defineRoute<State>((_req, ctx) => {
  if (!isGitHubSetup() && ctx.url.pathname !== "/welcome") {
    return redirect("/welcome");
  }

  const isSignedIn = ctx.state.sessionUser !== undefined;
  const endpoint = "/api/items";

  return (
    <>
      <Head href={ctx.url.href}>
        <link
          as="fetch"
          crossOrigin="anonymous"
          href={endpoint}
          rel="preload"
        />
        {isSignedIn && (
          <link
            as="fetch"
            crossOrigin="anonymous"
            href="/api/me/votes"
            rel="preload"
          />
        )}
      </Head>

      <main class="flex-1 bg-black overflow-x-hidden">
        {/* HERO: Holographic Logo + Experimental Design */}
        <section
          class="section-padding-lg relative overflow-hidden"
          style="background: linear-gradient(135deg, #000 0%, #0a0011 50%, #000 100%);"
        >
          <div class="container-max text-center">
            <LogoHolographic />

            <div class="mt-16 mb-12">
              <h1 class="font-heading font-black text-h1 md:text-h1 gradient-text lowercase tracking-wide mb-6 animate-fade-in">
                {SITE_NAME}
              </h1>
              <p class="text-body-lg text-foreground-muted max-w-2xl mx-auto mb-8">
                {SITE_DESCRIPTION}
              </p>
              <BrandSlogan variant="primary" className="inline-block" />
            </div>

            {/* CTA Buttons */}
            <div class="flex flex-col sm:flex-row gap-4 justify-center mt-12">
              <BrandButton href="/submit" variant="primary">
                Start Discovering →
              </BrandButton>
              <BrandButton href="/pricing" variant="secondary">
                View Plans
              </BrandButton>
            </div>

            {/* Floating Particles */}
            <div class="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  class="absolute w-1 h-1 bg-primary rounded-full"
                  style={{
                    left: `${10 + i * 20}%`,
                    animation: `particle-float 4s ease-in-out infinite`,
                    animationDelay: `${i * 0.5}s`,
                  }}
                />
              ))}
            </div>
          </div>

          <style>
            {`
            @keyframes particle-float {
              0%, 100% { transform: translateY(0) scale(1); opacity: 0; }
              50% { transform: translateY(-100px) scale(1.5); opacity: 1; }
            }
          `}
          </style>
        </section>

        {/* TURNTABLE: Analog meets Digital */}
        <section class="section-padding-lg bg-black">
          <div class="container-narrow text-center">
            <h2 class="font-heading font-bold text-h2 text-white mb-4">
              ANALOG MEETS DIGITAL
            </h2>
            <p class="text-body-sm text-foreground-muted mb-16 max-w-2xl mx-auto">
              Interactive turntable visualization with real-time audio spectrum
            </p>

            <TurntableAnimation />

            <div class="mt-16">
              <h3 class="font-heading font-bold text-h3 text-white mb-6">
                DETECT MUSIC TRENDS IN REAL-TIME
              </h3>
              <p class="text-body text-foreground-muted max-w-lg mx-auto mb-8">
                Like a DJ reading the crowd, our AI analyzes millions of data
                points to predict the next viral hit before it breaks.
              </p>
              <BrandButton href="/submit" variant="primary">
                START SPINNING →
              </BrandButton>
            </div>
          </div>
        </section>

        {/* AUDIO REACTIVE: Feature Cards */}
        <section
          class="section-padding-lg"
          style="background: linear-gradient(180deg, #000 0%, #0a0011 100%);"
        >
          <div class="container-max">
            <div class="text-center mb-16">
              <h2 class="font-heading font-bold text-h2 text-white mb-4">
                AUDIO-REACTIVE VISUALS
              </h2>
              <p class="text-body-sm text-foreground-muted">
                Animations that respond to music data in real-time
              </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <AudioReactiveCard
                title="PULSE DETECTION"
                description="Concentric rings expand based on beat detection. Intensity matches music energy."
                visualType="circular"
              />
              <AudioReactiveCard
                title="FREQUENCY ANALYZER"
                description="Real-time spectrum visualization. Each bar represents a frequency band."
                visualType="spectrum"
              />
              <AudioReactiveCard
                title="WAVEFORM STREAM"
                description="Flowing audio waveform represents continuous music data stream."
                visualType="waveform"
              />
              <AudioReactiveCard
                title="TREND PARTICLES"
                description="Particles orbit based on trend momentum. Speed indicates viral potential."
                visualType="particles"
              />
            </div>
          </div>
        </section>

        {/* GLITCH EFFECT */}
        <section class="section-padding bg-black">
          <div class="container-max text-center">
            <GlitchText text="TREND" />
            <p class="text-body-sm text-foreground-muted mt-8">
              Experimental glitch effects for loading states and edgy moments
            </p>
          </div>
        </section>

        {/* NARRATIVE: Story Steps */}
        <section
          class="section-padding-lg"
          style="background: linear-gradient(180deg, #000, #0a0011, #000);"
        >
          <div class="container-narrow">
            <div class="text-center mb-16">
              <h2 class="font-heading font-bold text-h2 text-white mb-4">
                IMMERSIVE STORYTELLING
              </h2>
              <p class="text-body-sm text-foreground-muted">
                Discover the trendradar journey
              </p>
            </div>

            <NarrativeStep
              number="01"
              title="THE PROBLEM"
              description="Music trends emerge faster than ever. By the time you notice a viral hit, it's already peaked. The industry loses billions chasing yesterday's trends."
            />
            <NarrativeStep
              number="02"
              title="THE SOLUTION"
              description="trendradar's AI monitors 50 million data points daily across streaming platforms, social media, and live performances. We detect patterns humans miss."
            />
            <NarrativeStep
              number="03"
              title="THE RESULT"
              description="Predict viral tracks 2-4 weeks in advance with 85% accuracy. Be first to discover the next big artist. Make data-driven decisions that matter."
            />
          </div>
        </section>

        {/* MIXED MEDIA: Analog Display */}
        <section class="section-padding-lg bg-black relative">
          <div
            class="absolute inset-0 pointer-events-none"
            style={{
              background:
                "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)",
            }}
          >
          </div>

          <div class="container-narrow relative z-10">
            <div
              class="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-2xl p-8 border-2 border-[#0f3460]"
              style={{
                boxShadow:
                  "inset 0 0 60px rgba(0,0,0,0.8), 0 20px 60px rgba(0,0,0,0.5)",
              }}
            >
              <VUMeter bars={10} />
              <p
                class="font-heading text-h5 text-success text-center mt-8 uppercase tracking-widest"
                style={{
                  textShadow: "0 0 10px rgba(16, 185, 129, 0.5)",
                  animation: "text-flicker 4s infinite",
                }}
              >
                TREND DETECTION ACTIVE • MONITORING 50M+ DATA POINTS
              </p>
            </div>
          </div>

          <p class="text-body-sm text-foreground-muted text-center mt-8 relative z-10">
            Retro VU meters + CRT scanlines = Analog warmth meets digital
            precision
          </p>

          <style>
            {`
            @keyframes text-flicker {
              0%, 100% { opacity: 1; }
              92% { opacity: 1; }
              93% { opacity: 0.8; }
              94% { opacity: 1; }
            }
          `}
          </style>
        </section>

        {/* ITEMS LIST: Latest Discoveries */}
        <section class="section-padding-lg bg-gradient-to-b from-black to-background">
          <div class="container-max">
            <div class="text-center mb-16">
              <h2 class="font-heading font-bold text-h2 text-white mb-4">
                LATEST DISCOVERIES
              </h2>
              <BrandSlogan variant="product" />
            </div>
            <ItemsList endpoint={endpoint} isSignedIn={isSignedIn} />
          </div>
        </section>
      </main>
    </>
  );
});
