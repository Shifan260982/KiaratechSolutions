---
name: Kiaratech Solutions
description: Blue-and-white enterprise technology site with real imagery, product mockups and a white navbar.
colors:
  blue: "#155eef"
  blue-deep: "#0f4bc4"
  navy: "#102a56"
  blue-soft: "#8db4ff"
  sky: "#eaf2ff"
  paper: "#ffffff"
  mist: "#f5f8fc"
  ink: "#172033"
  muted: "#64748b"
  muted-strong: "#475569"
  line: "#e2e8f0"
  line-strong: "#cbd5e1"
  danger: "#b42318"
  brand-logo: "#500082"
typography:
  hero:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.375rem, 1.5rem + 3.2vw, 3.75rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.03em"
  display:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.125rem, 1.6rem + 2.2vw, 3.25rem)"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.625rem, 1.35rem + 1.1vw, 2.25rem)"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  heading:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.35
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.625
rounded:
  md: "6px"
  xl: "12px"
  2xl: "16px"
  full: "9999px"
spacing:
  gutter-mobile: "16px"
  gutter-desktop: "32px"
  section: "56px"
  section-md: "80px"
  container: "76rem"
components:
  button-primary:
    backgroundColor: "{colors.blue}"
    textColor: "{colors.paper}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.blue-deep}"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.navy}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
    height: "44px"
  card:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.xl}"
  tag:
    backgroundColor: "{colors.sky}"
    textColor: "{colors.blue-deep}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
  cta-band:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.paper}"
---

# Design System: Kiaratech Solutions

## Overview

An established enterprise software consultancy in blue and white. Blue carries action and emphasis (buttons, links, key numbers, project names), navy carries headings and the closing CTA band, and light-blue fields mark selected sections. The site shows real work: Pexels photography for the hero and each service, and coded product mockups for the featured projects. The purple logo sits on a white navbar and is never recoloured.

## Colors

- **Blue** `#155EEF`: primary buttons, links, metric values, icon tiles, project names. Hover: **Blue Deep** `#0F4BC4`.
- **Navy** `#102A56`: headings, and the overlay on full-bleed photography (hero and projects sliders).
- **Blue Soft** `#8DB4FF`: accent text on navy and over photography only.
- **Sky** `#EAF2FF`: hero gradient start, page intros, the industries section, tags and image wells.
- **Paper** `#FFFFFF` / **Mist** `#F5F8FC`: default and alternate section grounds.
- **Ink** `#172033`: body text. **Muted Strong** `#475569` for secondary copy on any ground; **Muted** `#64748B` for placeholders and metadata only.
- **Line** `#E2E8F0` / **Line Strong** `#CBD5E1`: card borders and control outlines.

### Named Rules

- **White navbar rule.** The header is always white so the purple logo reads cleanly.
- **Dark only over photography.** Navy fields appear only as image overlays (hero slider, projects slider) and the About band's blue-to-navy gradient; content sections stay white, mist or sky.

## Typography

Primary font: **Inter** (self-hosted variable font via next/font) for all headings and body copy. Secondary font: **Helvetica** (`font-secondary`: Helvetica Neue, Helvetica, Arial) for navigation, buttons and the footer. Helvetica is a licensed system font and is not bundled, so Windows and Android visitors without it see Arial. The hero headline is the largest type on the site (max 3.75rem, weight 700), with the second clause in blue. Page H1s cap at 3.25rem. Section H2s are navy, weight 600. No eyebrow labels above headings.

## Layout

- Container max 76rem; 16px gutters on mobile, 32px on desktop.
- Homepage order (owner direction, 31 Oct 2026): hero slider, About greeting, services grid, industries, projects slider, contact (form plus offices), footer.
- Navigation order: About, Services (opens on hover for mouse, on click/Enter for keyboard and touch), Projects, Industries, Careers.
- Services: a 3-column card grid on desktop, 2 on tablet, and compact horizontal cards (thumbnail left) on phones.
- Hero slider: up to four full-bleed photo slides, navy left-to-right overlay, headline with a Blue Soft second line; no buttons. Dots and a pause control sit bottom centre.
- About greeting: heading on white, a blue-to-navy band below it; the portrait stands on the band's bottom edge at left, copy and figures on the band at right.
- Projects slider (homepage): full-bleed domain photo per project, name, title and description over a navy overlay, "Our projects" fixed top left, dots bottom centre. The projects index keeps the card layout with coded mockups.

## Elevation & Depth

Cards are bordered with a soft navy-tinted shadow only on hover (`0 16px 40px -24px rgb(16 42 86 / 0.45)`). The hero image and its floating disciplines card carry a slightly stronger shadow. No glows or glass.

## Shapes

6px radius on buttons and inputs, 12px on cards, 16px on hero and service images, fully rounded tags.

## Components

- **Service card**: the whole card is a link. 16:9 image, navy title (blue on hover), full summary in near-ink text. Hover: lift, blue-tinted border, shadow, 3% image zoom.
- **Project card**: sky image well holding an "Illustrative mockup" product frame, category tags, project name in blue, title, summary and "Explore project".
- **Project mockups** (`ProjectVisual`): coded UI frames for ARECON AI (document plus extracted findings with page references), Digital Twin (isometric factory floor) and Smart HR (shortlist, interview slots, email draft). Synthetic content only; replace with approved screenshots.
- **Metric card**: bordered card, blue tabular number, muted label.
- **Placeholder note**: dashed box prefixed "Placeholder:" for unapproved content.

## Do's and Don'ts

### Do:

- Use real, relevant imagery and keep a consistent, cool-toned photographic style.
- Use blue for action and emphasis, navy for structure.
- Keep interface motion (hover, menus) under 300ms. Authored moments: slide crossfades with a slow image zoom, and the About entrance (portrait from left, copy from right) with an expo ease-out. Sliders auto-advance only with motion allowed, pause on hover or focus, and have a visible pause control.

### Don't:

- Don't use navy fields without photography behind them, or gradients beyond the About band and image overlays.
- Don't use robot or handshake imagery, or unrelated stock photos.
- Don't publish client names, metrics or tech stacks not confirmed in PRODUCT.md.
