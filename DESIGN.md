---
version: alpha
name: Vizora premium retail catalog interface
description: Adapted from the supplied reference into a fabrication and interiors catalog workflow. The system now uses a Myntra-like premium retail canvas: pale neutral app background, crisp white work surfaces, sharp geometry, product-first composition, restrained ink typography, and a warm pink/coral action accent. It must not use BMW names, logos, licensed fonts, automotive imagery, or a black motorsport canvas.
---

# Vizora UI Guidelines

Implementation note: Adapted for Vizora; no BMW trademarked assets.

## Design Intent

Vizora should feel like a high-end product catalog and showroom assistant: fast, visual, precise, and calm. The interface is operational, not decorative. Energy comes from product photography, material closeups, fabrication details, finishes, joinery, stone, wood, metal, and completed interior shots.

## Tokens

- Canvas: `#efefef`
- Surface soft: `#ffffff`
- Surface card: `#f5f5f6`
- Surface elevated: `#eef0f3`
- Hairline: `#e3e4e8`
- Hairline strong: `#d1d3da`
- Ink: `#282c3f`
- Body: `#535766`
- Body strong: `#3e4152`
- Muted: `#7e818c`
- Accent stripe: `#ff905a`, `#ff3f6c`, `#f16565`
- Warning: `#f4b400`
- Success: `#0fa336`

## Typography

- Use Inter for body, controls, labels, and dense product metadata.
- Display headings use Libre Baskerville with a restrained editorial serif stack, sentence/title case, weight `700`, letter spacing `0`.
- Body text uses a clean sans stack at normal weight for premium readability.
- Labels can be uppercase, but keep them small and quiet. Product names should not be forced uppercase.
- Do not scale type with viewport width. Use fixed responsive steps.

## Shape And Layout

- Default radius is `0px`.
- Use circular controls only for icon-only actions.
- Use 1px hairlines for structure. Soft ambient shadows are allowed only on large white work surfaces to separate them from the grey page floor.
- Keep cards sharp, dense, and image-led.
- Major spacing follows a 4px scale: `4, 8, 12, 16, 24, 40, 64, 96`.
- Mobile layouts stack rather than squeezing controls.

## Components

- Buttons: refined rectangles, 44px minimum height, concise labels.
- Inputs: soft grey surface on white panels, ink text, hairline border, ink focus border.
- Product cards: image first, editorial product name, SKU/category metadata kept secondary.
- Tabs and filters: text or hairline controls, never rounded pills unless icon-only.
- Accent stripe: use sparingly on headers, dividers, and brand moments. Primary actions may use the pink/coral action color, but never a full tri-stripe fill.

## Do

- Use product photography as the primary visual material.
- Keep admin chrome minimal.
- Favor image grids, quick edit, and low-friction mobile controls.
- Keep catalog/session pages scroll-first and WhatsApp-friendly.

## Don't

- Do not use BMW assets, names, logos, roundels, wordmarks, or vehicle imagery.
- Do not use a black background as the dominant interface surface; it makes the product catalog feel like a motorsport magazine and hurts product inspection.
- Do not add marketplace, ecommerce, customer account, payment, AR, recommendation, or full analytics UI.
- Do not use gradients, decorative blobs, shadows, or rounded SaaS cards.
- Do not turn the tricolor accent into a generic action color.
