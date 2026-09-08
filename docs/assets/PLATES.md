# The plates

## Read this first, it is where the last batch went wrong

**Save to the exact path given.** Every plate in the last batch landed in
`public/images/devfest/` regardless of what it was. I moved them, but the paths
in this file are the real ones.

**PNG is fine, I convert them.** Do not spend effort on format.

**The ratio in the table is not a suggestion.** A set that mixes 3:2 and 2:3
does not read as a set, and that was the one thing you asked for. The room
posters are now locked to **1536 x 1024, 3:2 landscape**, because four of the
six already came back that way and the objects suit it. Two need redoing at that
size: `02-app` and `06-game-engine`.

**The empty chair is gone.** There is no vacant room. The sixth vertical is
Game Engine Development and it sits under the game room.

---

Every image on this site belongs to one family. That is the whole brief. A viewer
should be able to tell that the hero facade, a room poster and a portrait were
drawn by the same hand for the same site, without being told.

Three rules make that true, and they are not negotiable.

1. **The recipe block below goes at the end of every prompt, word for word.** Do
   not reword it, do not summarise it, do not drop a clause because it seems
   obvious. The repetition is what holds the family together.
2. **One object per plate.** Never two objects, never a scene. A phone. A gear. A
   chair. The object is the whole idea.
3. **The same near-black ground on every interior plate.** The six posters we have
   today fail this, which is exactly why they do not read as a set.

## The recipe block

Paste this at the end of every prompt in this file.

```
Flat vector illustration, bold geometric shapes, screen print feel with subtle paper grain. Limited palette: deep indigo, dark blue grey, near black, warm amber, and one acid yellow green used sparingly. A single warm light source. Soft contact shadow. No photorealism, no 3D render, no text, no signage, no lettering, no logos, no people.
```

The one exception is the portraits, which obviously have a person in them. Their
recipe block is given separately in section D.

## The building paragraph

Plates 2 to 5 are all the same building as the hero. This paragraph is copied
word for word into each of them so the building cannot drift. Do not reword it.

```
Flat vector illustration of a four storey concrete academic building seen perfectly straight on like an architectural elevation, symmetrical, no perspective. The building fills the entire frame edge to edge and top to bottom, with no sky above it and no empty ground below it. Fourteen bays of tall rectangular windows run across each of the four floors, separated by plain concrete piers, with a flat horizontal ledge line between every floor. In the exact horizontal centre of the building there is a recessed main entrance: a wide dark doorway under a plain flat canopy, with a broad flight of shallow steps below it running down to the bottom edge of the frame. The top of the entrance canopy sits about two thirds of the way down the frame.
```

For the portrait versions of the building, change **Fourteen bays** to **Six
bays** and leave every other word alone.

**Attach `public/images/hero/facade-night-wide.jpg` as a reference image** for
plates 2 to 5 and add the line "same building, same architecture, same window
grid, same entrance" to the prompt. That is what makes them a set rather than
four similar pictures.

---

## Order of work

| Batch | Plates | State |
|---|---|---|
| Done | 2, 3, 4, 5 | The four facades. All four match the hero building. Moved, converted, compressed, in. |
| Done | 6, 8, 9, 10 | `01-web`, `03-game`, `04-ai-ml`, `05-ui-ux`. Exactly on family. In. |
| **Next** | 7, 11 | `02-app` and `06-game-engine`, both at **1536 x 1024**, so the six finally match each other. |
| **Next** | 17 to 23 | The seven portraits. The most visible weakness on the site now that the buildings are fixed. |
| Then | 1 | The vector mark. Not a generation job, see section A. |
| Then | 12 to 16 | The corridor and the four process plates. New sections, so nothing regresses if they are late. |

---

# A. The mark

## 1. `public/images/brand/mark.svg` — vector, square canvas

The existing `mark.png` is 777 x 587 and it will alias visibly once it is
rotating continuously in the corner of every page. It needs to be a vector, and
it needs a **square** canvas, because it spins about the centre of its own box:
on a 777 x 587 canvas it would wobble rather than turn.

### The best route: trace it

Open `mark.png` in Figma or Illustrator, image trace, clean up the two curves on
the S, and export SVG on a 512 x 512 artboard with the mark centred on its
optical centre. Two flat colours plus transparent. It only has to survive at
32px, so do not fuss over the corners.

### If you would rather generate it

Attach `public/images/brand/mark.png` as the reference image. This will not give
you an SVG, it gives you a clean high resolution raster you can trace in one
click instead of cleaning up a 777px source. Ask for **2048 x 2048, square,
transparent background**.

```
Recreate the attached logo exactly, as a clean flat vector graphic on a fully transparent background. It is a monogram: a large letter D and a large letter S interlocking in the centre, with a tall curly brace to the left of them and a matching tall curly brace to the right, both braces the full height of the mark. Keep the two colours exactly as they are in the reference: the left brace and the S in dark slate teal, the right brace and the D in bright teal. Keep every proportion, every corner radius and the exact way the D and the S overlap.

Centre the mark inside a square canvas with equal margin on all four sides, so that it can be rotated about the centre of the canvas without appearing to wobble. Crisp hard edges, flat colour fill, no gradients, no shadows, no grain, no texture, no outline, no background, no text.
```

Then trace the result and export SVG.

**One thing to decide.** The mark's teal is the old club teal and it no longer
appears anywhere in the palette, which is now near black, bone, amber and acid
green. Right now the mark is the only teal on the site. Options: leave it (a
brand mark is allowed to be its own colour), or reissue it in acid green and
bone. Tell me which and I will wire it either way.

---

# B. The buildings

## 2. `public/images/devfest/facade-full-wide.jpg` — 1920 x 1080, 16:9 landscape

Replaces the current file, which is a different building: short wide three pane
windows, wider bays, a projecting glass lobby. Put the two side by side and the
break is obvious.

```
[paste the building paragraph, with Fourteen bays]

Night, and every single window in the building is lit. Each window is filled solid warm amber as if a room full of people is working behind it, and the amber spills onto the concrete piers between them so the whole facade glows. The concrete reads dark blue grey only in the narrow bands between floors. The sky tone behind the roofline is deep indigo. The entrance is open and bright, with warm light pouring down the steps.

[paste the recipe block]
```

## 3. `public/images/devfest/facade-full-tall.jpg` — 1080 x 1920, 9:16 portrait

```
[paste the building paragraph, with Six bays]

Night, and every single window in the building is lit. Each window is filled solid warm amber as if a room full of people is working behind it, and the amber spills onto the concrete piers between them so the whole facade glows. The concrete reads dark blue grey only in the narrow bands between floors. The sky tone behind the roofline is deep indigo. The entrance is open and bright, with warm light pouring down the steps.

[paste the recipe block]
```

## 4. `public/images/dawn/door-wide.jpg` — 1920 x 1080, 16:9 landscape

Replaces the current file, which is a third building again: single storey, mint
green, shop front glazing. It reads well on its own and not at all as the same
place.

The section that uses this one tracks a warm radial gradient along the leading
edge of the opening door, so the light wedge on the ground needs to be wide and
definite. A faint spill will not give the effect anything to sit on.

```
[paste the building paragraph, with Fourteen bays]

Dawn. The concrete is a cool blue grey going pale at the roofline and the sky tone behind it is the first grey blue of morning. Every window is dark and empty. The one light in the frame is the main entrance: the doors stand open and warm amber light pours out of them, throwing a wide hard edged wedge of light down the steps and across the ground to the bottom edge of the frame. Nothing else is lit.

[paste the recipe block]
```

## 5. `public/images/dawn/door-tall.jpg` — 1080 x 1920, 9:16 portrait

```
[paste the building paragraph, with Six bays]

Dawn. The concrete is a cool blue grey going pale at the roofline and the sky tone behind it is the first grey blue of morning. Every window is dark and empty. The one light in the frame is the main entrance: the doors stand open and warm amber light pours out of them, throwing a wide hard edged wedge of light down the steps and across the ground to the bottom edge of the frame. Nothing else is lit.

[paste the recipe block]
```

### Checking the four buildings

Put plates 2, 3, 4, 5 and the existing `hero/facade-night-wide.jpg` side by side
and ask three questions.

1. Same floor count in all five?
2. Same pier rhythm, so the windows line up if you overlay them?
3. Same entrance: recessed doorway, flat canopy, shallow steps to the bottom edge?

If one is the odd one out, regenerate that one with the hero attached as a
reference. Do not regenerate the set.

---

# C. The six room posters

All six replace files that exist. The objects are right; the grounds are wrong.
Today they sit on deep petrol, light mint, cream and near black, so the six do
not read as one set when the wheel turns.

**Every one of these six is 1536 x 1024, 3:2 landscape, on the same near-black
ground.** The only thing that changes between them is the object and which
accent it carries.

Already correct and done: `01-web`, `03-game`, `04-ai-ml`, `05-ui-ux`.
**Still to redo at 1536 x 1024:** `02-app` came back 2:3 portrait, and
`06-game-engine` is still the old plate on the wrong ground.

The shared opening sentence, copied into all six:

```
A single object centred on a flat near black field, seen straight on, filling about sixty percent of the frame width. One warm amber light falls from the upper left. A soft dark contact shadow sits directly under the object. Landscape format, three by two.
```

## 6. `public/images/rooms/01-web.jpg`

```
[paste the shared opening sentence]

The object is an open browser window: a plain rectangle with a title bar, three small dots at its left, and two or three blocks of content inside it. The window frame is bone white, the content blocks are warm amber, and one small element is acid yellow green.

[paste the recipe block]
```

## 7. `public/images/rooms/02-app.jpg`

```
[paste the shared opening sentence]

The object is a phone standing upright, seen face on, showing a grid of nine small rounded app squares on its screen. The phone body is dark blue grey with a bone white edge, the app squares are warm amber with one acid yellow green.

[paste the recipe block]
```

## 8. `public/images/rooms/03-game.jpg`

```
[paste the shared opening sentence]

The object is a game controller seen face on, symmetrical, with two grips, a directional pad on the left and four round buttons on the right. The body is dark blue grey, the buttons are warm amber, and the directional pad is acid yellow green.

[paste the recipe block]
```

## 9. `public/images/rooms/04-ai-ml.jpg`

```
[paste the shared opening sentence]

The object is a small neural network graph: three vertical columns of circular nodes, four nodes per column, every node connected to every node in the next column by a thin straight line. The nodes are bone white except the middle column which is warm amber, and the connecting lines are thin and dark.

[paste the recipe block]
```

## 10. `public/images/rooms/05-ui-ux.jpg`

```
[paste the shared opening sentence]

The object is three rectangular artboards stacked at slight angles, as if fanned on a table, each one showing a few simple layout blocks. The artboards are bone white, the layout blocks inside them are warm amber and dark blue grey, and one block is acid yellow green.

[paste the recipe block]
```

Note: the current file is a stack of *notebooks with a pen*. Artboards is what
the section is about, so this one is a change of subject, not just of ground.

## 11. `public/images/rooms/06-game-engine.jpg`

```
[paste the shared opening sentence]

The object is two interlocking gears, a large one and a smaller one meshing at its lower right. The large gear is warm amber and the smaller gear is acid yellow green, both with clean flat teeth and a simple round hub.

[paste the recipe block]
```

### Checking the six

Lay them out in a row. If your eye jumps to one of them, its ground or its light
is wrong, not its object. Fix the ground and the light, keep the object.

---

# D. The portraits

The seven we have are a mirror selfie taken in a lift, a table tennis action shot
mid rally, a cropped holiday photo, and a low light night photo with flash, at
seven different resolutions with no shared crop, background or lighting. In a
section that pins a portrait to the scroll, they are the most visible weakness on
the site.

Illustrating all seven in the same language fixes it in one pass, and makes the
people part of the family instead of the exception to it.

**Method.** For each person, attach their existing photo from
`public/images/people/` as the reference image and ask for a portrait *in this
style*, keeping the likeness. This is a style pass over a real photograph, not an
invented face.

**Every portrait is 1024 x 1280, 4:5 portrait.** Same crop, same ground, same
light, every time.

The portrait recipe block. This replaces the standard recipe block for section D
only, because these plates have a person in them.

```
Flat vector portrait illustration, bold geometric shapes, screen print feel with subtle paper grain. Chest up, facing the viewer, centred, head filling about half the frame height. Flat near black background with no scene or setting behind the person. One warm amber light from the upper left giving a hard edged rim along one side of the face and shoulder; the other side falls into dark blue grey shadow. Limited palette: deep indigo, dark blue grey, near black, warm amber, bone white. Skin rendered in flat shapes, not gradients. Keep the likeness of the reference photograph: same face, same hair, same glasses if present. No text, no logos, no background objects.
```

The prompt for each is the recipe block plus one line naming the person, so the
generator does not average them together:

## 17 to 23. The seven leads

| # | File | Reference photo | Add this line |
|---|---|---|---|
| 17 | `public/images/people/utkarsh.jpg` | current `utkarsh.jpg` | Portrait of a young man, short dark hair. |
| 18 | `public/images/people/satvikjain.jpg` | current `satvikjain.jpg` | Portrait of a young man, short dark hair. |
| 19 | `public/images/people/tanay.jpg` | current `tanay.jpg` | Portrait of a young man, short dark hair, sunglasses pushed up or removed. |
| 20 | `public/images/people/satviksrinivas.jpg` | current `satviksrinivas.jpg` | Portrait of a young man, short dark hair. |
| 21 | `public/images/people/anvesh.jpg` | current `anvesh.jpg` | Portrait of a young man, short dark hair, glasses. |
| 22 | `public/images/people/umang.jpg` | current `umang.jpg` | Portrait of a young man, short dark hair. |
| 23 | `public/images/people/rishika.jpg` | current `rishika.jpg` | Portrait of a young woman, long dark curly hair. |

Overwrite the existing files at the same paths. Nothing in the code needs to
change if the filenames stay.

**Check:** put all seven in a row. The light must come from the same side in
every one, the crop must sit at the same height, and the backgrounds must be
indistinguishable. If one person is lit from the right, regenerate that one.

# E. The corridor and the process plates

New sections that have no artwork at all today. These are what turn "we do not
have much to show" into the subject rather than the problem.

## 12. `public/images/rooms/corridor-wide.jpg` — 3000 x 1200, 5:2 landscape

Sits behind the six rooms section at low opacity and drifts at a third of the
content speed.

```
Flat vector illustration of a plain interior corridor seen perfectly straight on, symmetrical, no perspective. Six identical closed doors run in a row across the frame, evenly spaced, each in a plain recessed frame with a narrow gap at the floor. Warm amber light glows from the gap under the first five doors, spilling a small pool onto the floor in front of each. The sixth door on the right has no light under it and its pool of floor is dark. The walls and doors are dark blue grey against near black, and the floor is a single flat band across the bottom of the frame.

[paste the recipe block]
```

## 13. `public/images/process/whiteboard.jpg` — 1600 x 2000, 4:5 portrait

**No legible words anywhere.** Shapes and boxes only. The moment it contains
readable text it becomes a claim about a specific project, which is exactly what
this site is not allowed to make.

```
A single whiteboard on a flat near black field, seen straight on, filling about seventy percent of the frame. Drawn on it in warm amber: a diagram of six or seven rectangles connected by arrows, laid out roughly as a tree. Two of the rectangles have a single diagonal line struck through them. One area of the board has been wiped and redrawn, leaving a soft smudge under the newer marks. The marks are loose and hand drawn, not neat. The board itself is bone white with a thin dark frame. One warm amber light falls from the upper left and a soft contact shadow sits under the board. Absolutely no letters, words, numbers or readable text of any kind: boxes, arrows and lines only.

[paste the recipe block]
```

## 14. `public/images/process/desk-2am.jpg` — 1600 x 2000, 4:5 portrait

```
A single desk on a flat near black field, seen straight on, filling about sixty percent of the frame. On it, one monitor and one small desk lamp, nothing else. The lamp is the only light source in the frame and it is warm amber, throwing a hard pool onto the desk surface and leaving the edges of the frame in near black. The monitor screen is filled with many short horizontal bars of dark blue grey and acid yellow green suggesting lines of code, far too small to read. A soft contact shadow sits under the desk. Absolutely no letters, words or readable text.

[paste the recipe block]
```

## 15. `public/images/process/chair.jpg` — 1600 x 2000, 4:5 portrait

```
A single folding chair on a flat near black field, seen straight on, filling about half the frame height, turned at a slight angle to the viewer as though somebody has just pushed back from a desk and stood up. Nothing else in frame. The chair is dark blue grey with a bone white edge where one warm amber light from the upper left catches it. A soft dark contact shadow sits under it.

[paste the recipe block]
```

## 16. `public/images/process/lid.jpg` — 1600 x 2000, 4:5 portrait

```
A single laptop on a flat near black field, seen from a low angle straight on, filling about half the frame height, with its lid closed to about three quarters so that a narrow wedge of warm amber light escapes from the gap between the screen and the keyboard. That escaping light is the only light in the frame and it throws a soft amber glow onto the surface in front of the laptop. The laptop body is dark blue grey. A soft dark contact shadow sits under it.

[paste the recipe block]
```

---

# F. When they arrive

Drop each file at the exact path given. Nothing in the code needs to change for
plates 2 to 11 and 17 to 23, which overwrite files that already exist.

Then tell me, and I will:

- run the compression pass (long edge cap, progressive re-encode, anything over
  400 KB gets squeezed),
- check every plate against the family: same ground, same light direction, same
  grain weight,
- wire the new ones in.

Two things worth knowing before you generate.

**AVIF is off in `next.config.ts` on purpose.** The encoder crushed the amber
windows in the night facade to near black. These plates are all amber on near
black, so leave that setting alone.

**Grain is baked into the plates, and the site also has its own `.grain`
overlay.** If a plate comes back with very heavy grain it will read as noisy once
the overlay lands on top of it. Ask for subtle.
