# Motion tools

Reusable pieces behind the DevSoc site. Every component is a client island that enhances DOM that is already visible; each one degrades on reduced motion and on touch. See `/lab` in development for live demos.

| Component | What it does | Notes |
|-----------|--------------|-------|
| `SmoothScroll` | Lenis smooth scroll wired to the GSAP ticker | Wrap the app once in the root layout |
| `Cursor` | Bone dot that inverts what it crosses, brass ring on interactive elements | Add `data-cursor="Label"` to anything; fine pointers only |
| `Magnetic` | Pulls a child toward the pointer | One CTA per page |
| `SplitLines` | Masked line-by-line text rise on scroll | Text is visible before JS |
| `ScrollExpand` | Framed media that grows to full bleed on scroll and holds | 2.6 viewports of scroll by default |
| `ParticleText` | A word made of drifting dots that part around the pointer | Inherits the font from `className` |
| `InkBleed` | tonal takeover: reveals an inverted copy of a section through a canvas mask that floods with a grainy dissolving edge | Drive `set(progress)` from a ScrollTrigger; repaints only on quantised steps |
| `SplitFlap` | departure board type reveal, character by character | `play` starts it, once; settles instantly on reduced motion |
| `LitImage` | three.js plane that dissolves between images on a grain sweep; the pointer carries a light that lifts the grade where it falls | Controlled by `index`; CSS crossfade fallback |
| `PointField` | Points that settle into the silhouette of an image | GPU-side motion; static on mobile |
| `MaskReveal` | Duotone base with a soft-edged colour window that follows the pointer | Tap toggles colour on touch |
| `HorizontalPan` | Pinned shelf that travels sideways as the page scrolls down | No buttons; becomes a swipe rail on phones and reduced motion |
| `ScrollResolve` | Photograph that lifts out of the verdigris grade as it reaches the middle of the screen | `to` caps the lift for loud images |
| `Reveal` | Rises children on arrival, once | `stagger` moves direct children in turn |
| `Carousel` | Free-drag Embla rail with trackpad wheel support | Kept for the lab; the home page uses `HorizontalPan` |
| `FrameChrome` | Brass corner marks at the four corners of the viewport | Fixed, non-interactive; the night clock lives in `shell/NightClock` |

Motion constants live in `src/lib/easings.ts`. GSAP plugins are registered once in `src/lib/gsap.ts`; import `gsap` from there, never from the package directly.

Scroll is the interface. Nothing on the home page waits for a click: the shelf pans, photographs resolve, the credits portrait follows the list, and the questions are already answered. Clicks are reserved for navigation and for going deeper (a larger photograph, a person's profile).

Rules: nothing bounces, nothing is elastic, nothing loops for decoration. Reveals run 0.9 to 1.4s on `expo.out`. Hover transitions run 0.6s. Every scrubbed or pinned section has a static reduced-motion layout.
