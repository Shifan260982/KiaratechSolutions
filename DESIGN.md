---
name: Kiaratech Solutions
description: Black-and-white, text-first corporate site for an AI and software engineering partner.
colors:
  paper: "#ffffff"
  mist: "#f5f5f5"
  ink: "#171717"
  muted: "#737373"
  muted-strong: "#5c5c5c"
  line: "#e5e5e5"
  line-strong: "#c4c4c4"
  danger: "#b42318"
  brand-logo: "#500082"
typography:
  display:
    fontFamily: "Schibsted Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.125rem, 1.6rem + 2.2vw, 3.25rem)"
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Schibsted Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.625rem, 1.35rem + 1.1vw, 2.25rem)"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  heading:
    fontFamily: "Schibsted Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Schibsted Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Schibsted Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.4
rounded:
  sm: "4px"
spacing:
  gutter-mobile: "16px"
  gutter-tablet: "24px"
  gutter-desktop: "32px"
  section: "56px"
  section-md: "80px"
  container: "76rem"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.sm}"
    padding: "10px 20px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "#404040"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "10px 20px"
    height: "44px"
  button-inverse:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "10px 20px"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "10px 12px"
  placeholder-note:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.muted-strong}"
    rounded: "{rounded.sm}"
    padding: "12px 16px"
---

# Design System: Kiaratech Solutions

## Overview

An established engineering consultancy, rendered in ink on paper. The site is text-first: hairline rules, a ruled index for services, and data presented as definition lists rather than cards. It should read like a well-set capability statement, not an AI startup. Persuasion comes from clear claims, verified figures and named scope, never from decoration, gradients or motion.

The purple script logo is the only colour on the site and stays exactly as supplied.

## Colors

### Neutral

- **Paper** `#FFFFFF`: default page ground.
- **Mist** `#F5F5F5`: alternate section ground, used to separate adjacent sections (selected work, problems/use cases, hiring).
- **Ink** `#171717`: all primary text, primary buttons, emphasis rules and the closing CTA band.
- **Muted** `#737373`: placeholder text and low-priority metadata on paper only.
- **Muted Strong** `#5C5C5C`: body and secondary copy on any ground (passes 4.5:1 on Mist, which Muted does not).
- **Line** `#E5E5E5` / **Line Strong** `#C4C4C4`: dividers, and borders on Mist or around controls.
- **Danger** `#B42318`: form errors only.

### Named Rules

- **One colour rule.** The logo is the only chromatic element. No accent colours, tints or gradients.
- **Mist contrast rule.** Body copy on Mist uses Muted Strong, never Muted.

## Typography

One family, Schibsted Grotesk (variable, self-hosted via `next/font`), set in four steps: display (page H1), title (section H2), heading (H3, list items), body. Weight 600 for all headings, 400 for body. Display is capped at 3.25rem so the hero never fills the viewport.

### Named Rules

- **No kickers.** Headings stand alone; no eyebrow labels or small caps above them.
- **Numbers are tabular.** Metrics and step numbers use `tabular-nums`.

## Layout

- Container max 76rem with 16 / 24 / 32px gutters (mobile / tablet / desktop).
- Sections use 56px vertical padding, rising to 80px from `md`. Paper and Mist alternate; never two Mist sections in a row.
- 12-column grids for split layouts; lists collapse to a single column below `md`.
- Lists of services, industries, capabilities and use cases are ruled rows (border-top on the list, border-bottom per row), not card grids.

## Elevation & Depth

Flat. Depth comes from hairline borders and the Paper/Mist alternation. The only shadow is the Services dropdown panel (`0 12px 32px -12px rgb(0 0 0 / 0.18)`), which needs to separate from the page.

## Shapes

Small radius (4px) on buttons, inputs, chips and placeholder notes. Panels and sections are square.

## Components

### Buttons

Minimum height 44px, 15px medium text. Primary is Ink fill; Secondary is Paper with a Line Strong border that turns Ink on hover. Inverse and inverse-outline variants are used only on the Ink CTA band. Transitions are colour-only, 150ms.

### Inputs / Fields

Paper fill, Line Strong border, Ink border and 2px Ink outline on focus, Danger border when `aria-invalid`. Labels sit above fields; errors sit below and are linked with `aria-describedby`.

### Navigation

Sticky white header with a hairline bottom border. The Services disclosure opens a two-column panel of core services, with Talent Solutions as a quieter footer row. The current page is underlined (top-level) or tinted Mist (dropdown).

### Placeholder note

A dashed Line Strong box prefixed "Placeholder:", used for any content awaiting approval. Searchable in code (`<Placeholder>`) and visibly distinct, so unapproved content cannot be mistaken for published content.

### Case study summary

An Ink top rule, then the title, sector and a three-column Problem / Solution / Outcome definition list. Outcome falls back to a Placeholder note until verified.

## Do's and Don'ts

### Do:

- Use ruled rows and definition lists to present structured content.
- Put detailed content on dedicated pages and keep the homepage to one screen per idea.
- Keep every interaction legible with motion disabled.

### Don't:

- Don't add icon tiles, stock imagery, gradients, glass or decorative illustration.
- Don't add scroll-triggered animation, carousels or auto-playing media.
- Don't publish figures, client names, outcomes or testimonials not approved in PRODUCT.md.
