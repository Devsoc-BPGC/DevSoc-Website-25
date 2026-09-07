# Hero prompts: one building, four views

Four images of **the same building**. The paragraph describing the building is word for word identical in all four; only the light changes. That repetition is deliberate, so do not reword it.

**Generate number 1 first.** If your tool lets you attach a reference image, attach number 1 when generating 2, 3 and 4 and add "same building, same architecture, same window grid, same entrance" to the prompt. That is what makes them a set rather than four similar pictures.

## What the composition has to do

- **Fill the frame.** The building runs edge to edge and top to bottom. No sky band above it, no empty ground band below it.
- **Entrance dead centre, low.** The wordmark DEVSOC sits across the middle of the screen, and the entrance needs to read in the gap under the V and the S. So the entrance is horizontally centred, and the top of its canopy sits about two thirds of the way down the frame, with its steps running to the bottom edge.
- **Symmetrical.** Straight on, like an elevation drawing, no perspective, no corner view.

---

## 1. Night, landscape

`public/images/hero/facade-night-wide.jpg`: **1920 x 1080, 16:9 landscape**

```
Flat vector illustration of a four storey concrete academic building seen perfectly straight on like an architectural elevation, symmetrical, no perspective. The building fills the entire frame edge to edge and top to bottom, with no sky above it and no empty ground below it. Fourteen bays of tall rectangular windows run across each of the four floors, separated by plain concrete piers, with a flat horizontal ledge line between every floor. In the exact horizontal centre of the building there is a recessed main entrance: a wide dark doorway under a plain flat canopy, with a broad flight of shallow steps below it running down to the bottom edge of the frame. The top of the entrance canopy sits about two thirds of the way down the frame.

Night. The concrete is a flat dark blue grey and the sky tone behind the roofline is deep indigo. Every window is dark navy except exactly six windows, scattered across different floors and never next to each other, which are filled solid warm amber as if lit from inside, each casting a soft amber glow onto the concrete around it. The entrance is dark with only a faint warm spill on the steps.

Bold flat geometric shapes, limited palette of deep indigo, dark blue grey, near black and warm amber, subtle grain, screen print feel. No photorealism, no 3D render, no text, no signage, no people, no trees, no cars.
```

## 2. Night, portrait

`public/images/hero/facade-night-tall.jpg`: **1080 x 1920, 9:16 portrait**

```
Flat vector illustration of a four storey concrete academic building seen perfectly straight on like an architectural elevation, symmetrical, no perspective. The building fills the entire frame edge to edge and top to bottom, with no sky above it and no empty ground below it. Six bays of tall rectangular windows run across each of the four floors, separated by plain concrete piers, with a flat horizontal ledge line between every floor. In the exact horizontal centre of the building there is a recessed main entrance: a wide dark doorway under a plain flat canopy, with a broad flight of shallow steps below it running down to the bottom edge of the frame. The top of the entrance canopy sits about two thirds of the way down the frame.

Night. The concrete is a flat dark blue grey and the sky tone behind the roofline is deep indigo. Every window is dark navy except exactly four windows, scattered across different floors and never next to each other, which are filled solid warm amber as if lit from inside, each casting a soft amber glow onto the concrete around it. The entrance is dark with only a faint warm spill on the steps.

Bold flat geometric shapes, limited palette of deep indigo, dark blue grey, near black and warm amber, subtle grain, screen print feel. No photorealism, no 3D render, no text, no signage, no people, no trees, no cars.
```

## 3. Morning, landscape

`public/images/hero/facade-morning-wide.jpg`: **1920 x 1080, 16:9 landscape**

```
Flat vector illustration of a four storey concrete academic building seen perfectly straight on like an architectural elevation, symmetrical, no perspective. The building fills the entire frame edge to edge and top to bottom, with no sky above it and no empty ground below it. Fourteen bays of tall rectangular windows run across each of the four floors, separated by plain concrete piers, with a flat horizontal ledge line between every floor. In the exact horizontal centre of the building there is a recessed main entrance: a wide dark doorway under a plain flat canopy, with a broad flight of shallow steps below it running down to the bottom edge of the frame. The top of the entrance canopy sits about two thirds of the way down the frame.

Early morning. The concrete is a flat warm pale grey and the sky tone behind the roofline is pale sea green. Every window is a flat pale sea green as if reflecting the morning sky, and none of them are lit. One soft flat shadow falls to the right of each concrete pier. The entrance is open and pale, with a soft warm light inside it.

Bold flat geometric shapes, limited palette of pale sea green, warm pale grey, bone white and one soft warm light, subtle grain, screen print feel. No photorealism, no 3D render, no text, no signage, no people, no trees, no cars.
```

## 4. Morning, portrait

`public/images/hero/facade-morning-tall.jpg`: **1080 x 1920, 9:16 portrait**

```
Flat vector illustration of a four storey concrete academic building seen perfectly straight on like an architectural elevation, symmetrical, no perspective. The building fills the entire frame edge to edge and top to bottom, with no sky above it and no empty ground below it. Six bays of tall rectangular windows run across each of the four floors, separated by plain concrete piers, with a flat horizontal ledge line between every floor. In the exact horizontal centre of the building there is a recessed main entrance: a wide dark doorway under a plain flat canopy, with a broad flight of shallow steps below it running down to the bottom edge of the frame. The top of the entrance canopy sits about two thirds of the way down the frame.

Early morning. The concrete is a flat warm pale grey and the sky tone behind the roofline is pale sea green. Every window is a flat pale sea green as if reflecting the morning sky, and none of them are lit. One soft flat shadow falls to the right of each concrete pier. The entrance is open and pale, with a soft warm light inside it.

Bold flat geometric shapes, limited palette of pale sea green, warm pale grey, bone white and one soft warm light, subtle grain, screen print feel. No photorealism, no 3D render, no text, no signage, no people, no trees, no cars.
```

---

## Checking them before you send them over

Put the four side by side and ask three questions.

1. Is it the same building in all four? Same floor count, same pier rhythm, same entrance shape. If the morning one has three floors and the night one has four, regenerate the odd one out with number 1 attached as a reference.
2. Is the entrance in the centre and low, with steps reaching the bottom edge?
3. Does the building touch all four edges, with no empty band anywhere?

| # | File | Size | Ratio |
|---|---|---|---|
| 1 | `hero/facade-night-wide.jpg` | 1920 x 1080 | 16:9 |
| 2 | `hero/facade-night-tall.jpg` | 1080 x 1920 | 9:16 |
| 3 | `hero/facade-morning-wide.jpg` | 1920 x 1080 | 16:9 |
| 4 | `hero/facade-morning-tall.jpg` | 1080 x 1920 | 9:16 |

Drop them at those paths, overwriting what is there, and tell me. I will check the framing against the wordmark and adjust the scrim so the lit windows keep their glow behind the type.
