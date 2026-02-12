// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.
import { defineRoute } from "$fresh/src/server/defines.ts";
import Head from "@/components/Head.tsx";
import { isGitHubSetup } from "@/utils/github.ts";
import {
  SITE_DESCRIPTION,
  SITE_MISSION,
  SITE_NAME,
  SITE_TAGLINE,
} from "@/utils/constants.ts";
import IconTrendingUp from "@preact-icons/tb/TbTrendingUp";
import IconRadar from "@preact-icons/tb/TbRadar";
import IconMusic from "@preact-icons/tb/TbMusic";
import {
  Banner,
  BrandButton,
  BrandSlogan,
  LogoHolographic,
  LogoVariations,
  RadarLogo,
  SoundWaveLogo,
} from "@/components/branding/index.ts";

function SetupInstruction() {
  return (
    <div class="bg-background-card/60 border border-border rounded-2xl p-8 lg:p-12 max-w-2xl mx-auto w-full">
      {/* Brand Header */}
      <div class="text-center mb-10">
        <div class="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-logo flex items-center justify-center shadow-glow">
          <IconRadar class="size-8 text-black" />
        </div>
        <h1 class="font-heading font-black text-4xl gradient-text lowercase mb-3">
          {SITE_NAME}
        </h1>
        <p class="text-foreground-muted text-lg mb-4">
          {SITE_TAGLINE}
        </p>
        <BrandSlogan variant="primary" />
      </div>

      {/* Mission Statement */}
      <div class="bg-gradient-to-b from-primary/5 to-transparent border border-primary/20 rounded-xl p-6 mb-8">
        <h2 class="font-heading font-bold text-xl text-foreground mb-4">
          Welcome to {SITE_NAME}
        </h2>
        <p class="text-foreground-muted leading-relaxed mb-6">
          {SITE_MISSION}
        </p>

        {/* Feature Icons */}
        <div class="grid grid-cols-3 gap-4 mb-6">
          <div class="text-center">
            <div class="w-12 h-12 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center">
              <IconRadar class="size-6 text-primary" />
            </div>
            <p class="text-foreground-muted text-xs">Real-time Detection</p>
          </div>
          <div class="text-center">
            <div class="w-12 h-12 mx-auto mb-2 rounded-full bg-secondary/10 flex items-center justify-center">
              <IconTrendingUp class="size-6 text-secondary" />
            </div>
            <p class="text-foreground-muted text-xs">Trend Analytics</p>
          </div>
          <div class="text-center">
            <div class="w-12 h-12 mx-auto mb-2 rounded-full bg-accent/10 flex items-center justify-center">
              <IconMusic class="size-6 text-accent" />
            </div>
            <p class="text-foreground-muted text-xs">Music Intelligence</p>
          </div>
        </div>

        <div class="space-y-3">
          <a
            href="https://github.com/denoland/saaskit#get-started-locally"
            class="inline-flex items-center justify-center w-full py-3 px-6 bg-gradient-logo text-black font-heading font-bold rounded-xl hover:scale-105 hover:shadow-glow transition-all"
          >
            Get started locally guide
            <span class="ml-2">→</span>
          </a>
          <a
            href="https://github.com/denoland/saaskit#deploy-to-production"
            class="inline-flex items-center justify-center w-full py-3 px-6 border-2 border-primary text-primary font-heading font-bold rounded-xl hover:bg-primary hover:text-black transition-all"
          >
            Deploy to production guide
            <span class="ml-2">→</span>
          </a>
        </div>

        <div class="mt-6 pt-6 border-t border-border">
          <p class="text-foreground-muted text-sm">
            After setting up{" "}
            <code class="bg-background-dark px-2 py-1 rounded font-mono text-primary-300 text-xs">
              GITHUB_CLIENT_ID
            </code>{" "}
            and{" "}
            <code class="bg-background-dark px-2 py-1 rounded font-mono text-primary-300 text-xs">
              GITHUB_CLIENT_SECRET
            </code>
            , this message will disappear.
          </p>
        </div>
      </div>

      {/* Brand Values */}
      <div class="flex justify-center gap-8 text-foreground-muted text-sm">
        <span class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-gradient-logo"></span>
          Innovation
        </span>
        <span class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-gradient-logo"></span>
          Data Integrity
        </span>
        <span class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-gradient-logo"></span>
          Developer-First
        </span>
      </div>
    </div>
  );
}

export default defineRoute((_req, ctx) => {
  const isSetup = isGitHubSetup();

  return (
    <>
      <Head title={`Welcome to ${SITE_NAME}`} href={ctx.url.href} />
      <main class="flex-1 flex justify-center items-center section-padding min-h-[80vh] bg-background-dark">
        {!isSetup && <SetupInstruction />}

        {isSetup && (
          <div class="container-max py-12">
            {/* Success Banner */}
            <div class="bg-success/10 border-2 border-success rounded-2xl p-8 mb-12 text-center">
              <div class="text-6xl mb-4">✓</div>
              <h2 class="font-heading font-bold text-h2 text-success mb-3">
                Setup Complete!
              </h2>
              <p class="text-foreground-muted text-lg max-w-2xl mx-auto">
                Your {SITE_NAME}{" "}
                brand is now configured and ready to detect music trends.
              </p>
              <div class="mt-6">
                <BrandButton href="/" variant="primary" className="text-lg">
                  Go to Dashboard →
                </BrandButton>
              </div>
            </div>

            {/* Brand Preview */}
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              <div class="bg-background-card/60 border border-primary/20 rounded-2xl p-8 text-center hover:-translate-y-1 transition-all">
                <div class="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-logo flex items-center justify-center shadow-glow">
                  <span class="font-heading font-black text-xl">TR</span>
                </div>
                <h3 class="font-heading font-bold text-h4 text-white mb-2">
                  Logo Mark
                </h3>
                <p class="text-body text-foreground-muted">
                  Icon for favicons and app icons
                </p>
              </div>

              <div class="bg-background-card/60 border border-primary/20 rounded-2xl p-8 text-center hover:-translate-y-1 transition-all">
                <div class="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-logo flex items-center justify-center shadow-glow">
                  <span class="font-heading font-black text-xl">♪</span>
                </div>
                <h3 class="font-heading font-bold text-h4 text-white mb-2">
                  Audio Identity
                </h3>
                <p class="text-body text-foreground-muted">
                  Music detection radar system
                </p>
              </div>

              <div class="bg-background-card/60 border border-primary/20 rounded-2xl p-8 text-center hover:-translate-y-1 transition-all">
                <div class="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-logo flex items-center justify-center shadow-glow">
                  <span class="font-heading font-black text-xl text-2xl gradient-text">
                    TR
                  </span>
                </div>
                <h3 class="font-heading font-bold text-h4 text-white mb-2">
                  Wordmark
                </h3>
                <p class="text-body text-foreground-muted">
                  Full brand name with gradient
                </p>
              </div>
            </div>

            {/* Brand Components Preview */}
            <div class="text-center mb-8">
              <h2 class="font-heading font-bold text-h2 text-white mb-3">
                Brand Components Available
              </h2>
              <p class="text-body-sm text-foreground-muted">
                Visit the brand showcase to see all available components
              </p>
            </div>

            <div class="text-center">
              <BrandButton
                href="/brand"
                variant="secondary"
                className="text-lg px-8 py-4"
              >
                View Brand Assets →
              </BrandButton>
            </div>
          </div>
        )}
      </main>
    </>
  );
});
