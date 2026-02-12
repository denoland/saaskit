// Copyright 2023-2025 Deno authors. All rights reserved. MIT license.
/**
 * Brand Showcase Page - Demonstrates all branding components
 * Based on BRANDING.HTML and BRANDING#2.html
 */

import { defineRoute } from "$fresh/server.ts";
import { ComponentChildren } from "preact";
import Head from "@/components/Head.tsx";
import {
  AudioReactiveCard,
  Banner,
  BrandButton,
  BrandSlogan,
  CircularEqualizer,
  GlitchText,
  Logo,
  LogoHolographic,
  LogoVariations,
  RadarLogo,
  ScanningLogo,
  SloganCard,
  SoundWaveLogo,
  TurntableAnimation,
  VUMeter,
} from "@/components/branding/index.ts";
import { SITE_NAME } from "@/utils/constants.ts";

// Error boundary component for handling component failures
const ErrorFallback = ({ componentName }: { componentName: string }) => (
  <div class="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
    <div class="text-red-400 text-sm">Failed to load {componentName}</div>
  </div>
);

// Safe component wrapper with error handling
const SafeComponent = (
  { children, fallbackName }: {
    children: ComponentChildren;
    fallbackName: string;
  },
) => {
  try {
    return <>{children}</>;
  } catch (error) {
    console.error(`Error rendering ${fallbackName}:`, error);
    return <ErrorFallback componentName={fallbackName} />;
  }
};

// Constants for reusable styles and values
const HERO_BACKGROUND =
  "linear-gradient(180deg, #050508 0%, #0A0A12 50%, #050508 100%)";
const GRID_BACKGROUND = {
  backgroundImage:
    "linear-gradient(rgba(139, 92, 246, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.02) 1px, transparent 1px)",
  backgroundSize: "40px 40px",
};
const BLOB_GRADIENT_1 = "linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%)";
const BLOB_GRADIENT_2 = "linear-gradient(135deg, #06B6D4 0%, #EC4899 100%)";
const APPLICATION_BACKGROUND =
  "linear-gradient(180deg, #050508 0%, #0A0A12 100%)";

// Component for Hero Section
const HeroSection = () => (
  <section
    class="section-padding-lg relative overflow-hidden"
    style={{ background: HERO_BACKGROUND }}
  >
    {/* Background Grid */}
    <div class="absolute inset-0 opacity-20" style={GRID_BACKGROUND} />

    {/* Gradient Blobs */}
    <div
      class="absolute top-25 -left-40 w-[500px] h-[500px] rounded-full blur-[120px]"
      style={{
        background: BLOB_GRADIENT_1,
        opacity: 0.08,
      }}
    />
    <div
      class="absolute bottom-[600px] -right-40 w-[400px] h-[400px] rounded-full blur-[120px]"
      style={{
        background: BLOB_GRADIENT_2,
        opacity: 0.08,
      }}
    />

    <div class="relative z-10 container-max text-center">
      {/* Brand Badge */}
      <div class="inline-block bg-primary/10 border border-primary/30 px-6 py-2 rounded-full text-xs font-bold tracking-widest uppercase text-primary-300 mb-5">
        Unique Brand Identity
      </div>

      <h1 class="font-heading font-black text-h1 md:text-display gradient-text lowercase mb-3">
        {SITE_NAME}
      </h1>
      <p class="text-body-lg text-foreground-muted">
        Radar × Music Fusion Branding
      </p>
    </div>
  </section>
);

// Component for Section Header
const SectionHeader = (
  { title, description }: { title: string; description: string },
) => (
  <div class="text-center mb-8">
    <h2 class="font-heading font-bold text-h2 text-white mb-3">
      {title}
    </h2>
    <p class="text-body-sm text-foreground-muted">
      {description}
    </p>
  </div>
);

// Component for Design Concept Box
const DesignConcept = ({ text }: { text: string }) => (
  <div class="bg-primary/5 border border-primary/20 rounded-xl p-5 mt-6">
    <div class="text-sm font-bold text-primary-300 mb-2">Design Concept</div>
    <div class="text-xs text-foreground-muted leading-relaxed">
      {text}
    </div>
  </div>
);

// Component for Radar Logo Section
const RadarLogoSection = () => (
  <section class="section-padding-lg">
    <div class="container-max">
      <SectionHeader
        title="Radar Logo"
        description="Dynamic scanning radar with music detection"
      />

      {/* Primary Radar */}
      <div class="bg-background-card/60 backdrop-blur-xl border-2 border-primary/20 rounded-2xl p-10 mb-6 relative overflow-hidden">
        <div class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-logo" />

        <div class="text-xs font-bold tracking-widest uppercase text-primary mb-5">
          Primary Radar Logo
        </div>

        <div class="flex items-center justify-center min-h-[300px]">
          <RadarLogo size={280} showLabel label="TR" />
        </div>

        <DesignConcept text="Animated radar sweep detects music trends in real-time. Pulsing dots represent trending tracks being discovered. Concentric circles show the scanning range." />
      </div>

      {/* Radar Variations */}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div class="bg-background-card/40 border border-primary/10 rounded-2xl p-8 text-center">
          <div class="relative w-[150px] h-[150px] mx-auto mb-4">
            <div
              class="absolute top-1/2 left-1/2 w-full h-full border-2 border-primary/30 rounded-full"
              style={{ transform: "translate(-50%, -50%)" }}
            />
            <div
              class="absolute top-1/2 left-1/2 w-[60%] h-[60%] border-2 border-secondary/30 rounded-full"
              style={{ transform: "translate(-50%, -50%)" }}
            />
            <div
              class="absolute top-1/2 left-1/2 w-[35%] h-[35%] bg-gradient-logo rounded-full flex items-center justify-center"
              style={{ transform: "translate(-50%, -50%)" }}
            >
              <span class="text-xl">♪</span>
            </div>
          </div>
          <div class="text-[10px] font-bold tracking-widest uppercase text-foreground-dark mt-4">
            Music Note Target
          </div>
        </div>

        <div class="bg-background-card/40 border border-primary/10 rounded-2xl p-8 text-center">
          <div class="relative w-[150px] h-[150px] mx-auto mb-4">
            <div
              class="absolute top-1/2 left-1/2 w-full h-full border-2 border-dashed border-primary/40 rounded-full"
              style={{ transform: "translate(-50%, -50%)" }}
            />
            <div
              class="absolute top-1/2 left-1/2 font-6xl gradient-text"
              style={{ transform: "translate(-50%, -50%)" }}
            >
              ♪
            </div>
          </div>
          <div class="text-[10px] font-bold tracking-widest uppercase text-foreground-dark mt-4">
            Dashed Circle
          </div>
        </div>

        <div class="bg-background-card/40 border border-primary/10 rounded-2xl p-8 text-center">
          <div class="relative w-[150px] h-[150px] mx-auto mb-4 flex items-center justify-center border-2 border-primary/30 rounded-2xl">
            <div class="text-5xl">🎧</div>
          </div>
          <div class="text-[10px] font-bold tracking-widest uppercase text-foreground-dark mt-4">
            Headphone Icon
          </div>
        </div>

        <div class="bg-background-card/40 border border-primary/10 rounded-2xl p-8 text-center">
          <div class="relative w-[150px] h-[150px] mx-auto mb-4 flex items-center justify-center border-3 border-primary rounded-full">
            <div class="text-4xl text-primary">◎</div>
          </div>
          <div class="text-[10px] font-bold tracking-widest uppercase text-foreground-dark mt-4">
            Simple Ring
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default defineRoute((_req, ctx) => {
  return (
    <>
      <Head title={`Brand Assets - ${SITE_NAME}`} href={ctx.url.href} />
      <main class="flex-1 bg-background-dark">
        <HeroSection />
        <RadarLogoSection />

        {/* SECTION 2: SOUND WAVE LOGO */}
        <section class="section-padding-lg">
          <div class="container-max">
            <div class="text-center mb-8">
              <h2 class="font-heading font-bold text-h2 text-white mb-3">
                Sound Wave Logo
              </h2>
              <p class="text-body-sm text-foreground-muted">
                Audio frequency visualization identity
              </p>
            </div>

            {/* Equalizer Wave */}
            <div class="bg-background-card/60 backdrop-blur-xl border-2 border-primary/20 rounded-2xl p-10 mb-6 relative overflow-hidden">
              <div class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-logo" />

              <div class="text-xs font-bold tracking-widest uppercase text-primary mb-5">
                Equalizer Wave Logo
              </div>

              <div class="flex flex-col items-center gap-6">
                <SoundWaveLogo bars={9} showLabel label={SITE_NAME} />
              </div>

              <div class="bg-primary/5 border border-primary/20 rounded-xl p-5 mt-6">
                <div class="text-sm font-bold text-primary-300 mb-2">
                  Design Concept
                </div>
                <div class="text-xs text-foreground-muted leading-relaxed">
                  Animated equalizer bars represent real-time audio analysis.
                  The wave pattern symbolizes continuous music trend monitoring
                  and dynamic data visualization.
                </div>
              </div>
            </div>

            {/* Circular Equalizer */}
            <div class="bg-background-card/60 backdrop-blur-xl border-2 border-primary/20 rounded-2xl p-10 mb-6 relative overflow-hidden">
              <div class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-logo" />

              <div class="text-xs font-bold tracking-widest uppercase text-primary mb-5">
                Circular Equalizer Logo
              </div>

              <div class="flex items-center justify-center min-h-[300px]">
                <CircularEqualizer size={280} showCenter centerLabel="♪" />
              </div>

              <div class="bg-primary/5 border border-primary/20 rounded-xl p-5 mt-6">
                <div class="text-sm font-bold text-primary-300 mb-2">
                  Design Concept
                </div>
                <div class="text-xs text-foreground-muted leading-relaxed">
                  Rotating rings create a spinning radar effect. Each ring
                  represents different frequency ranges in music data. Central
                  music note anchors the visual identity.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: SCANNING LOGO */}
        <section class="section-padding-lg">
          <div class="container-max">
            <div class="text-center mb-8">
              <h2 class="font-heading font-bold text-h2 text-white mb-3">
                Scanning Logo
              </h2>
              <p class="text-body-sm text-foreground-muted">
                Active detection visual system
              </p>
            </div>

            <div class="bg-background-card/60 backdrop-blur-xl border-2 border-primary/20 rounded-2xl p-10 relative overflow-hidden">
              <div class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-logo" />

              <div class="text-xs font-bold tracking-widest uppercase text-primary mb-5">
                Scan Detection Logo
              </div>

              <div class="flex items-center justify-center min-h-[300px]">
                <ScanningLogo size={280} label={SITE_NAME} icon="♫" />
              </div>

              <div class="bg-primary/5 border border-primary/20 rounded-xl p-5 mt-6">
                <div class="text-sm font-bold text-primary-300 mb-2">
                  Design Concept
                </div>
                <div class="text-xs text-foreground-muted leading-relaxed">
                  Horizontal scan line actively searches for music trends. The
                  music note in background represents the data being analyzed.
                  Combines scanning action with music discovery.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: BANNERS */}
        <section class="section-padding-lg">
          <div class="container-max">
            <div class="text-center mb-8">
              <h2 class="font-heading font-bold text-h2 text-white mb-3">
                Unique Banners
              </h2>
              <p class="text-body-sm text-foreground-muted">
                Animated and dynamic banner designs
              </p>
            </div>

            <div class="grid grid-cols-1 gap-5">
              <Banner variant="gradient" />
              <Banner variant="dark" />
              <Banner variant="sound-wave" />
              <Banner variant="radar-circle" />
            </div>
          </div>
        </section>

        {/* SECTION 5: LOGO VARIATIONS */}
        <section class="section-padding-lg">
          <div class="container-max">
            <div class="text-center mb-8">
              <h2 class="font-heading font-bold text-h2 text-white mb-3">
                Logo Variations
              </h2>
              <p class="text-body-sm text-foreground-muted">
                Horizontal, stacked, light, and icon-only versions
              </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div class="bg-background-card/40 border border-primary/10 rounded-2xl p-8 text-center">
                <div class="mb-4">
                  <LogoVariations variant="horizontal" size="md" />
                </div>
                <div class="text-[10px] font-bold tracking-widest uppercase text-foreground-dark">
                  Horizontal Layout
                </div>
                <div class="text-xs text-foreground-muted mt-2">
                  Headers, navigation
                </div>
              </div>

              <div class="bg-background-card/40 border border-primary/10 rounded-2xl p-8 text-center">
                <div class="mb-4">
                  <LogoVariations variant="stacked" size="md" />
                </div>
                <div class="text-[10px] font-bold tracking-widest uppercase text-foreground-dark">
                  Stacked Layout
                </div>
                <div class="text-xs text-foreground-muted mt-2">
                  Social media, mobile
                </div>
              </div>

              <div class="bg-white rounded-2xl p-8 text-center border border-gray-200">
                <div class="mb-4">
                  <LogoVariations variant="light" size="md" />
                </div>
                <div class="text-[10px] font-bold tracking-widest uppercase text-gray-600">
                  Light Version
                </div>
                <div class="text-xs text-gray-500 mt-2">Light backgrounds</div>
              </div>

              <div class="bg-background-card/40 border border-primary/10 rounded-2xl p-8 text-center">
                <div class="mb-4">
                  <LogoVariations variant="icon-only" size="md" />
                </div>
                <div class="text-[10px] font-bold tracking-widest uppercase text-foreground-dark">
                  Icon Only
                </div>
                <div class="text-xs text-foreground-muted mt-2">
                  Favicons, app icons
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 6: OFFICIAL SLOGANS */}
        <section class="section-padding-lg">
          <div class="container-max">
            <div class="text-center mb-8">
              <h2 class="font-heading font-bold text-h2 text-white mb-3">
                Official Slogan
              </h2>
              <p class="text-body-sm text-foreground-muted">
                Brand taglines and messaging framework
              </p>
            </div>

            <div class="space-y-4">
              <SloganCard variant="primary" />
              <SloganCard variant="technical" />
              <SloganCard variant="product" />
              <SloganCard variant="visionary" />
              <SloganCard variant="community" />
            </div>
          </div>
        </section>

        {/* SECTION 7: APPLICATION EXAMPLES */}
        <section
          class="section-padding-lg"
          style={{
            background: "linear-gradient(180deg, #050508 0%, #0A0A12 100%)",
          }}
        >
          <div class="container-max">
            <div class="text-center mb-8">
              <h2 class="font-heading font-bold text-h2 text-white mb-3">
                Application Examples
              </h2>
              <p class="text-body-sm text-foreground-muted">
                Where to use each logo variation
              </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div class="bg-background-card/40 border border-primary/10 rounded-2xl p-8 text-center">
                <div class="text-4xl mb-3">🌐</div>
                <div class="font-heading text-h4 font-bold text-white mb-2">
                  Website Header
                </div>
                <div class="text-xs text-foreground-muted">
                  Use horizontal logo or animated radar
                </div>
              </div>

              <div class="bg-background-card/40 border border-primary/10 rounded-2xl p-8 text-center">
                <div class="text-4xl mb-3">📱</div>
                <div class="font-heading text-h4 font-bold text-white mb-2">
                  Mobile App
                </div>
                <div class="text-xs text-foreground-muted">
                  Use icon mark or radar circle
                </div>
              </div>

              <div class="bg-background-card/40 border border-primary/10 rounded-2xl p-8 text-center">
                <div class="text-4xl mb-3">📊</div>
                <div class="font-heading text-h4 font-bold text-white mb-2">
                  Dashboard
                </div>
                <div class="text-xs text-foreground-muted">
                  Use scanning or equalizer logos
                </div>
              </div>

              <div class="bg-background-card/40 border border-primary/10 rounded-2xl p-8 text-center">
                <div class="text-4xl mb-3">📄</div>
                <div class="font-heading text-h4 font-bold text-white mb-2">
                  Documentation
                </div>
                <div class="text-xs text-foreground-muted">
                  Use static wordmark or icon
                </div>
              </div>

              <div class="bg-background-card/40 border border-primary/10 rounded-2xl p-8 text-center">
                <div class="text-4xl mb-3">📢</div>
                <div class="font-heading text-h4 font-bold text-white mb-2">
                  Marketing
                </div>
                <div class="text-xs text-foreground-muted">
                  Use animated banners with slogan
                </div>
              </div>

              <div class="bg-background-card/40 border border-primary/10 rounded-2xl p-8 text-center">
                <div class="text-4xl mb-3">💬</div>
                <div class="font-heading text-h4 font-bold text-white mb-2">
                  Social Media
                </div>
                <div class="text-xs text-foreground-muted">
                  Use sound wave or radar logos
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer class="mt-16 pt-10 border-t border-primary/20 text-center">
          <div class="font-heading font-bold text-2xl gradient-text mb-3 lowercase">
            {SITE_NAME}
          </div>
          <p class="text-body-sm text-foreground-dark">
            Unique Brand Identity System v1.0
          </p>
        </footer>
      </main>
    </>
  );
});
