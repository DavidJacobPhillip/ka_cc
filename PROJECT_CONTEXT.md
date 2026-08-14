# PROJECT_CONTEXT.md — Ka Chai & Coffee Website

**Purpose:** Living reference document for the Ka Chai & Coffee website. Paste this back into any new conversation to restore full context. Update as decisions are made.

**Last updated:** August 14, 2026
**Status:** Homepage redesigned from a Canva mockup (high-level pass); animated shader background added; scope now 3 products (chai spices, tea, filter coffee — see §2). All pages exist as templates with draft copy — see §11, §12, and §13 for what's built vs. what Santosh still needs to do in Shopify Admin before it's live.

---

## 1. Business Snapshot

| | |
|---|---|
| **Brand** | Ka Chai (also operating as Ka Chai & Coffee) |
| **Location** | Portland, Oregon |
| **Category** | Small-batch chai — spice blends and tea |
| **Owner** | Santosh |
| **Current channels** | Farmers markets (primary, established following), physical location, wholesale outreach (offline), Shopify (minimal, no online ordering) |
| **Growth direction** | E-commerce, wholesale, broader retail |

---

## 2. Website Scope

### Products for sale on the site (complete list)
1. **Indian Masala Chai Spices**
2. **Assam + Kericho Black Tea Leaves**
3. **Indian Filter Coffee** — added back into scope 2026-07-29, per a new homepage design brief (South Indian style, arabica + robusta beans blended with chicory root). This reverses the earlier 2-SKU-only framing below; the "make chai at home" framing still applies to products 1–2, coffee sits alongside it as a third, separate product line.

Framing: everything needed to **make chai at home** — plus filter coffee for the "& Coffee" half of the brand name. Spice jars, loose leaf tea, and coffee powder.

### Also on the site
- **Physical location** — where to find Ka in person

### Explicitly OUT of scope
- ❌ **Chai concentrate — do not mention anywhere on the site.** Not in product listings, not in copy, not in the brand story. Deliberate hold, not an oversight.

---

## 3. Positioning & Messaging

### Claim constraints — hard rules
- ❌ **No organic claims.** The products are not organic. Nothing should state or imply otherwise.
- ❌ **No cost-savings claims.** Ka Chai prices above leading brands. The pitch is quality and provenance at a premium, not value.
- ❌ Nothing unverifiable. If it can't be substantiated, it doesn't go on the page.

### What to lead with
- **Provenance** — Assam (India) and Kericho (Kenya) black tea; whole-spice Indian masala formulation. Two named growing regions is a specific, real story most competitors can't tell.
- **Small batch, made here** — Portland production, hand-blended.
- **Proof of demand** — established farmers market following. Real repeat customers, not a launch brand.
- **Make it at home** — the site sells the ritual, not just the jar. Brewing guidance is content, not an afterthought.

### Voice

The brand is funny. The product is not a joke. That's the whole balance — copy that makes people grin, wrapped around spice and tea that are treated with complete seriousness. Think a very good bartender: warm, quick, a little irreverent, and absolutely not messing around with what's in the glass.

Register: Jovial, playful, comedic. Short punchy lines. Willing to be a bit absurd. Never sarcastic at the customer's expense, never mean, never trying too hard.

Where the humor lives:
- Headlines, subheads, microcopy, button labels, 404 page, empty cart, order confirmations, packaging inserts
- Brand story and about page — this is where personality earns its keep
- Brew guide — an excellent place to be funny, because the instructions are genuinely simple and the humor keeps people reading

Where it steps aside — humor drops out entirely:
- Ingredient lists, allergen info, any regulatory or label content
- Shipping, returns, and anything involving someone's money or a problem they're having
- Provenance claims — Assam, Kericho, sourcing. State these straight. The joke is never the sourcing.

The premium signal comes from restraint, not from adjectives. The product itself gets described plainly and specifically — named regions, whole spices, what it tastes like — with no comedy layered on. The contrast does the work: goofy headline, dead-serious product copy underneath. That gap is what reads as confidence. A brand that jokes around everywhere except the product is telling you exactly where it cares.

Never:
❌ Puns stacked on puns. One good joke beats three mediocre ones.
❌ "Artisanal journey," "handcrafted with love," "our passion for tea." Filler, and it's the exact register the humor exists to escape.
❌ Humor that undercuts the price. Never self-deprecate about cost, never wink at charging a premium. Confident brands don't apologize for their pricing, and jokes about it read as apology.
❌ Exclamation marks doing the comedic lifting. If the line needs one to land, rewrite the line.
❌ Meme voice or trend-chasing internet slang. It dates fast and cheapens the product.

Test for any line: would it make someone smile and still trust the jar costs what it costs? If it only does one, it's not there yet.

### ⚠️ The old wholesale copy does not transfer
Prior wholesale messaging was built entirely around the concentrate — 2:1 yield, handling, storage. With concentrate out of scope, **none of it applies here.** A spice/tea wholesale page, if wanted, needs writing fresh on different grounds.

---

## 4. Visual Identity

### Color — LOCKED
| Role | Value | Character |
|---|---|---|
| **Primary** | `#CD643F` | Burnt terracotta / clay orange |
| **Accent** | `#FFFFFF` | White |
| **Tertiary** | `#2E6417` | Deep forest green |
| **Warm Brown** | `#754B2A` | Espresso brown — body text on light backgrounds (e.g. homepage intro caption) where near-black read as too flat and needed real warmth |

**Design read:** Terracotta, white, and deep green is a genuinely coherent chai palette — fired clay, milk, and leaf. It reads warm and grounded without tipping into either the beige-minimalist or the saturated-Bollywood cliché that most chai brands land in. Green is the small-dose color: type accents, rules, hover states, illustration linework. Terracotta carries the weight; white does the breathing.

**Direction:** Light and airy, terracotta-anchored. Generous whitespace, large type, room for the illustration work to sit without crowding.

### ⚠️ Minor open item — print alignment
Cup print ink is **Pantone 5535C**, a deep *muted* green — same family as `#2E6417` but grayer and less saturated. Close enough to read as one brand at a glance, not close enough to be the same color side by side. If exact consistency across print and web matters, the cup ink is the fixed constraint and the web green should be pulled toward it. If not, this is fine as-is.

### Established assets
- **Logo:** Circular badge, multi-script text curved around the border
- **Illustration:** Loose hand-drawn botanical / spice line art — cardamom pods, ginger root — in a cave-painting / petroglyph register. Organic, not clinical botanical plate. Suits terracotta-on-white or green-on-white linework well.
- **Typography — UPDATED 2026-07-28:** Body copy is Noto Sans. Headings use **Noto Serif Display Extra Condensed** — a deliberate deviation from the original Noto-Sans-only spec, decided by Santosh during the site build (nice editorial contrast against the sans body/nav). Multi-script coverage requires separate downloads per script (Noto Sans Devanagari, etc.) — the base family does **not** include non-Latin glyphs. Noto Sans Condensed also in use for nav/UI text.
- **Cup specs:** 90-360UPET clear cups, 223 × 52 mm die-line, Pantone 5535C + transparent

---

## 5. Website Goals

**Primary:**
1. **Enable online ordering** — two SKUs, but the current site has no commerce at all. Biggest gap.
2. **Look like a premium brand**, not a five-minute template.

**Secondary:**
3. **Physical location** — address, hours, how to find it
4. **Farmers market schedule** — where Ka shows up in person
5. **Brand story** — provenance, small-batch process
6. **How to brew** — turns two SKUs into a reason to stay on the site

**Draft page structure:**
- Home
- Shop (3 products as of 2026-07-29 — see §2)
- Product detail × 3
- Brew guide
- Our story
- Visit / Find us (location + markets)
- Cart + checkout (Shopify-native)

**Design note:** A two-SKU catalog is an advantage, not a limitation. It permits real editorial treatment per product — full-bleed imagery, long-form provenance — rather than a thin grid trying to look full.

---

## 6. Technical Approach

**Shopify-native build.** Shopify uses **Liquid** templating, and cart/checkout is locked to Shopify's own system — which is what actually makes online ordering work. The design wraps around Shopify's native product, cart, and checkout objects rather than replacing them.

### Three viable paths
| Path | Effort | Fidelity | Cost |
|---|---|---|---|
| **A. Premium theme + custom CSS** | Low | Medium — constrained by theme structure | Theme cost only |
| **B. Custom theme sections** | Medium-high | High | Time, or dev hours |
| **C. Spec handoff to Shopify dev** | Low (for Santosh) | High | Dev fees |

**Recommendation:** Path A. Two SKUs plus a handful of content pages don't demand custom sections. A strong premium theme restyled to the terracotta system gets most of the way there for a fraction of the effort — and the palette is simple enough to apply cleanly through theme settings and a modest CSS layer.

**RESOLVED 2026-07-28 — theme is already chosen:** the `ka_cc` repo turned out to already contain a purchased premium Shopify theme called **Savor** (block-based, Horizon-architecture — sections/blocks, not liquid-per-page), checked into git with a GitHub remote (`DavidJacobPhillip/ka_cc`). Path A is being executed against this theme, not a new one. See §11 for the build that's now done on top of it.

---

## 7. Regulatory Constraints

Dry spice blends and loose leaf tea are a **substantially simpler regulatory path** than concentrate — shelf-stable, low water activity, no cold chain. Shipping is straightforward and the site is not blocked on licensing resolution.

Still relevant:
- Applied for both **domestic kitchen** and **commercial kitchen** licenses (Oregon ODA)
- Commercial kitchen license avoids domestic-framework label requirements ("homemade" statement, pet disclosure), which are non-negotiable under the domestic framework
- ODA unique identification number ($25/yr) available in place of a home address on labels — relevant if label photography appears on the site
- Concentrate's Process Authority / pH / water activity question remains open but **no longer blocks the website**

---

## 8. Open Questions / Needed Inputs

- [ ] Pricing and sizes for both SKUs
- [ ] Logo files (vector) and any additional brand assets
- [ ] Product photography — exists? needed? who shoots it?
- [ ] Physical location details — storefront/café, pickup point, or market stall? Address and hours (page is built with bracketed placeholders — see §11)
- [x] ~~Shopify theme selection~~ — **RESOLVED:** theme is **Savor**, already in the repo. See §6.
- [ ] Current Shopify plan and domain
- [ ] Shipping — domestic only? flat rate? free over threshold?
- [ ] Wholesale — include a page for spice/tea, or hold it back with the concentrate?
- [x] ~~Farmers market schedule~~ — **PARTIALLY RESOLVED:** found real data already live in the theme's announcement bar (not something Claude wrote — pre-existing content): "Brewed & served fresh every Saturday @Cedar Mills Farmers Market 9 AM to 2 PM" (`sections/header-group.json`). Used to replace the bracketed placeholder on the Visit/Find Us page. Still open: is this the *only* market, or one of several? Still needs a static-vs-updating decision.
- [ ] Web green vs. Pantone 5535C — match exactly, or leave as-is?

---

## 9. Working Notes

**Preferences established across the project:**
- Prefers direct, detailed feedback with reasoning over deferential rewrites
- Engages line-by-line; tests instructions and reports back when they don't match reality
- Flags inaccuracies actively — corrections should be expected and incorporated, not defended
- Prefers free or one-time-purchase tools over subscriptions

**Design pipeline (print side, for reference):**
iPad sketch in Sketchbook → transparent PNG export → placed into Affinity Designer 2 die-line → vector text/logo added → print-ready PDF

**Tools:** Affinity Designer 2 (primary vector/layout), Sketchbook (iPad), Photoshop, Shopify

---

## 10. Changelog

| Date | Change |
|---|---|
| 2026-07-27 | Document created. Captured state as of concept prototype completion. |
| 2026-07-27 | **Scope narrowed:** concentrate removed from site entirely. Product list set to Indian Masala Chai Spices + Assam/Kericho Black Tea Leaves, plus physical location. Added no-organic-claims constraint. Flagged that concentrate-based wholesale messaging does not transfer. |
| 2026-07-27 | **Palette locked:** `#CD643F` primary / white accent / `#2E6417` tertiary. Prior dark turmeric-marigold prototype retired — new build is Shopify-native from the ground up. Path A (premium theme + custom CSS) recommended. |
| 2026-07-28 | Installed Anthropic's official `frontend-design` skill globally (`~/.claude/skills/frontend-design/`), ahead of redevelopment work. See §11. |
| 2026-07-28 | **Full theme build (code side) completed** against the existing Savor theme found in the repo. Color schemes rebuilt to the locked terracotta/white/green palette; typography updated to Noto Sans body + Noto Serif Display Extra Condensed headings; homepage, shop page, both product pages, Brew Guide, Our Story, and Visit/Find Us page all built with draft copy in the established voice; footer nav wired to a `footer-menu` handle. See §12 for the full breakdown and the Admin-side checklist still needed before this goes live. |
| 2026-07-29 | Added a site-wide animated WebGL "smoke" shader background (chai-gradient palette: dark spice → terracotta → milky tan → cream) on the `redesign` branch. |
| 2026-07-29 | **Homepage redesigned from a Canva mockup Santosh provided**, high-level first pass. Reintroduced Indian Filter Coffee to scope (3rd product — see §2). New homepage structure: transparent nav over hero, "Welcome to the world of" + logo badge, connections/chai intro blurb, 2 product cards (chai duo + coffee), ingredient spotlight (ginger) with dietary icon row and the FDA/grandma disclaimer, a wave-divider into a dark reviews section (marquee + testimonial quote), and a 6-photo "Yum in Action" gallery. Added a decorative full-height "ka" rail down the left edge of the homepage only. Discovered and used real farmers-market data already sitting in the theme (Cedar Mills, Saturdays 9AM–2PM) to replace placeholder text on the Visit/Find Us page. See §13 for full detail, simplifications made, and open items from this pass. |
| 2026-08-14 | **Added a fourth palette color**, Warm Brown `#754B2A`, for body text on light backgrounds — used on the homepage intro section's caption. An earlier attempt reused the reviews-section background brown (`#2b1608`) for this text, but it was visually indistinguishable from plain black (near-identical luminance to the default foreground, differing only in hue) so it read as unchanged; `#754B2A` has enough lightness to actually register as brown. |

---

## 11. Claude Code Tooling

**Installed globally (`~/.claude/skills/`), applies to all projects, not just this one:**
- **`frontend-design`** — Anthropic's official skill for distinctive, intentional UI/visual design. Pushes toward deliberate palette/type/layout choices specific to the brief rather than generic "AI-slop" defaults (Inter font, purple gradients, safe neutrals). Directly relevant to reskinning the Shopify theme under Path A — should inform theme customization, product page layout, and the brew guide/story page design once a theme is selected. Source: [anthropics/claude-code frontend-design skill](https://github.com/anthropics/claude-code/blob/main/plugins/frontend-design/skills/frontend-design/SKILL.md).

**Considered, not installed** (from the same official skills repos — evaluated for this project and set aside; revisit if the need comes up):
- `brand-guidelines`, `theme-factory`, `canvas-design`, `web-artifacts-builder` — all real, but built for Anthropic's own brand, presentation decks, static poster art, or claude.ai React/Tailwind artifacts respectively. None target a real Shopify/Liquid storefront.
- `webapp-testing` — for automated web app QA (e.g. Playwright). Not a design skill; worth adding later if/when the site needs functional testing rather than visual design help.

---

## 12. Site Build — What's Done vs. What's Left (2026-07-28)

Claude's scope was theme **code only** (Liquid, JSON templates, `config/settings_data.json`, assets) — no Shopify Admin/API access, so no real Products, Pages, Files, or Navigation menus could be created. Every page below is a fully self-contained template with real draft copy baked into block settings, so it renders correctly the moment Santosh attaches it to the matching Admin object.

**Built:**
- **Color system** — all 7 color schemes in `config/settings_data.json` rebuilt from the locked terracotta/white/green palette (was red/maroon).
- **Typography** — body = Noto Sans, headings = Noto Serif Display Extra Condensed (see §4 update). Font ID `noto_serif_display_extra_condensed_n4` is inferred from a commented-out schema reference — confirm it resolves in the live theme editor's font picker.
- **Homepage** (`templates/index.json`) — hero (video-ready, placeholder until the real video is filmed/uploaded), provenance section, shop teaser, brew guide teaser, our story teaser, visit-us marquee.
- **Shop page** (`templates/collection.json`) — filtering/sorting disabled (over-engineered for 2 SKUs); heading copy updated.
- **Product pages** — `templates/product.masala-chai.json` and `templates/product.assam-kericho-tea.json`, each with the dynamic buy-box plus an editorial provenance section and a details accordion (What's in it / How to brew this one / Shipping — all marked `[Draft]` pending real ingredient/ratio/shipping info).
- **Brew Guide** (`templates/page.brew-guide.json`) — funny intro + 5-step accordion, marked `[Draft]` pending Santosh's real ratios/steep times.
- **Our Story** (`templates/page.our-story.json`) — two editorial sections, farmers-market-origin story + provenance rationale.
- **Visit / Find Us** (`templates/page.visit-us.json`) — location section + market-schedule accordion, all address/hours content bracketed as placeholder pending real details.
- **Footer navigation** — wired to reference a `footer-menu` handle (was empty).

**Still needed in Shopify Admin before this is live** (can't be done from theme code):
- Create the 3 real products (pricing, real titles/handles — masala chai, black tea, filter coffee) and assign each its alternate template above.
- Create 3 real pages (Brew Guide, Our Story, Visit/Find Us) and assign each its alternate template — no page-body content needed, it's baked into the templates.
- Create the `main-menu` and `footer-menu` navigation menus (Home, Shop, Brew Guide, Our Story, Visit/Find Us).
- Upload the real hero video + product/location photos, then select them in the theme editor — media fields are already primed (hero is set to expect video).
- Review every `[Draft]` bracket — ingredient lists, brew ratios, shipping policy, market schedule, address/hours — these are placeholders, not verified copy.

---

## 13. Homepage v2 — Canva Mockup Build (2026-07-29)

Santosh provided a Canva mockup and asked for a high-level first pass, explicitly inviting questions before implementation rather than a guess-and-build. Three decisions were confirmed before touching code: (1) Indian Filter Coffee is back in scope as a real 3rd product (reverses the 2-SKU-only framing from 2026-07-27 — see §2), (2) the custom decorative elements (side rail, rotated labels) should be included in this pass rather than deferred, (3) all copy shown in the mockup (grandma/FDA joke, ginger benefits, gallery captions) is real, finalized copy — used verbatim.

**New files:**
- `templates/product.indian-filter-coffee.json` — third product template, same editorial pattern as the other two.
- `snippets/wave-divider.liquid` — reusable SVG wave shape, used once so far (top of the reviews section) but written generically.

**Simplifications made for this "high level" pass — worth a visual review before treating as final:**
- **The "ka" side rail** is built as `position: absolute` inside `#MainContent`, sized to that element's full height via pure CSS (no JS) — so it runs the height of all homepage content below the hero, but it's homepage-only (gated by `template == 'index'` in `layout/theme.liquid`) and hidden below 750px width. Repeats "ka " 300 times vertically with `overflow: hidden` as a safety clamp; not pixel-measured against the actual mockup's spacing.
- **The dark reviews section** uses the theme's `scheme-5`, which was changed from pure black to a warm dark brown (`#2b1608`) to match both the mockup's tone and the shader background's darkest stop — this is a **global** color scheme change, so it affects anywhere else scheme-5 gets used, not just this one section (currently: nowhere else yet).
- **The "Reviews Reviews Reviews" arc text** was simplified to the theme's existing horizontal marquee (scrolling, not curved-on-a-path). A true curved SVG text path would need custom illustration work — flagged as a fast-follow if the curve specifically matters.
- **Two gallery captions were cut off in the mockup screenshot** ("when ou...", "some of our loyal frie..."). Draft completions were written in the same voice and marked `[draft — caption was cut off in the mockup]` — these need the real text from Santosh, not guessed final copy.
- **Product cards**: the mockup shows one card for "Chai Masala + Tea" combining both chai SKUs and one for coffee — kept as literally 2 cards on the homepage teaser (chai card links to the shop page generically, coffee card links to its product page) even though there are 3 real products underneath.
