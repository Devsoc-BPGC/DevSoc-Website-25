# DevSoc: The Night Shift, image prompts

Fourteen images. Written for generating on a phone. Copy a block, paste, generate, save under the filename given.

## The one rule

Everything on this site is **a photograph of a real room, taken at night on a phone**. Generated images read as artificial mostly because they are too clean, too centred and too evenly lit. Every prompt below fights that on purpose: real clutter, one light source, imperfect framing, grain. If a result looks like a product render or a stock photo, it is wrong, even if it is beautiful.

Nothing floats on black. Nothing is centred. Nothing is polished.

## Shared tail

Paste this at the end of every prompt.

```text
Shot on a phone at night, handheld, slightly grainy, mild motion blur in the darkest areas, imperfect framing with the subject off centre, mixed light temperature, no people, no text, no logos, no watermark. Real room with real clutter, lived in, slightly untidy. Photographic, not a render, not stock, not a product shot.
```

---

## Hero, night. 2 images

### N1 · `public/images/hero/dusk-wide.jpg` · landscape

```text
A university campus in Goa at the last minutes of daylight, seen from a little above. Low concrete academic buildings among coconut palms, the Arabian Sea a flat dark band on the horizon, the sky deep blue going to a thin band of orange at the waterline. Three or four windows in one building are already lit warm yellow. A single sodium lamp on a path. The bottom third of the frame is dark ground and palm silhouette with room for text.
```

### N2 · `public/images/hero/dusk-tall.jpg` · portrait

```text
The same Goa campus at last light, framed vertically. Palms in silhouette in the foreground, a lit window or two in the middle distance, the sea and the last orange band of sky at the top. The lower half is dark and quiet with room for text.
```

## Hero, morning. 2 images

### M1 · `public/images/hero/morning-wide.jpg` · landscape

```text
The same university campus in Goa at first light, seen from the same position as at dusk. Low concrete buildings among coconut palms, the Arabian Sea on the horizon, the sky a pale cool blue with a soft warm haze near the water. Mist low over the ground. No lights on in the windows now. The bottom third is quiet ground with room for text.
```

### M2 · `public/images/hero/morning-tall.jpg` · portrait

```text
The same Goa campus at first light, framed vertically. Palms in the foreground catching the first sun, buildings in the middle distance, pale sky and sea above. Low mist. The lower half is quiet with room for text.
```

## The six rooms. 6 images, all portrait

Each is one desk in a dark room, lit almost entirely by its own screen. Same room, same night, six different desks.

### R1 · `public/images/rooms/01-web.jpg` · Web

```text
A student desk in a dark room at two in the morning. An open laptop is the only real light, a web browser on screen throwing cool light up onto the wall behind. A half finished mug of tea, a tangle of USB cables, a notebook open face down, a bottle of water. Shot from slightly to the side, the laptop off centre to the right.
```

### R2 · `public/images/rooms/02-app.jpg` · App

```text
A phone lying face up on a stack of textbooks on a dark desk, its screen lit and throwing light onto the books and a hand towel beside it. A small desk lamp is on somewhere behind, warm and dim. A charging cable trails off the edge of the desk. Shot from above at an angle, the phone off centre.
```

### R3 · `public/images/rooms/03-game.jpg` · Game

```text
A game controller resting on a dark desk in front of a monitor that is on, the monitor light cool and blue across the desk. Over ear headphones lying beside it, cable coiled. A can of soft drink. The room behind is dark. Shot low, close to the desk surface, controller off centre.
```

### R4 · `public/images/rooms/04-ai-ml.jpg` · AI and ML

```text
A small whiteboard on a wall in a dark room, covered in handwritten equations and arrows, half rubbed out and rewritten. A marker resting on the ledge. A laptop half closed on the desk below throws a little cool light up onto the board. Shot slightly off square so the board is not parallel to the frame.
```

### R5 · `public/images/rooms/05-ui-ux.jpg` · UI and UX

```text
An open sketchbook on a dark desk covered in rough interface wireframes drawn in pen, a few crossed out. A fineliner, a sheet of tracing paper half over the page, a drawing tablet to one side with its light on. Warm desk lamp from the left, the rest of the room dark. Shot from above at an angle.
```

### R6 · `public/images/rooms/06-engine.jpg` · Engine

```text
A bare circuit board on a dark desk with jumper wires pushed into it, a few LEDs lit small and red. A multimeter beside it with its display on, a soldering iron resting in its stand, solder spool. One harsh work light from the side. Shot close and low, board off centre.
```

## DevFest. 1 image

### F1 · `public/images/devfest/night-wide.jpg` · landscape

```text
A large university hall at two in the morning during a hackathon. Long tables, dozens of open laptops, every screen lit, the room otherwise dark apart from a few overhead lights left on. Cables, empty cups, jackets over chair backs. Shot from the back of the hall looking down its length, slightly high.
```

## Dawn. 2 images

### D1 · `public/images/dawn/door-wide.jpg` · landscape

```text
An open doorway at the end of a concrete corridor in a university building at first light. Pale cool morning light coming through the door and falling in a long shape across the floor. The corridor itself still dim. A noticeboard on one wall. Shot straight down the corridor, the door slightly right of centre.
```

### D2 · `public/images/dawn/door-tall.jpg` · portrait

```text
The same open doorway at the end of a concrete corridor at first light, framed vertically. Pale morning light through the door, the corridor dim, light falling across the floor toward the camera.
```

## The boat. 1 image

### B1 · `public/images/brand/boat.png` · square, transparent background

```text
A small folded paper boat, plain white paper, slightly imperfect folds, lit warm from one side against a fully transparent background. Seen from just above the waterline at a slight three quarter angle. Soft shadow under it only. No background, no scene.
```

For this one only, ignore the shared tail. If transparency is not possible, generate it on flat mid grey and it will be cut out.

---

## Checklist

| Id | File | Orientation |
|---|---|---|
| N1 | `hero/dusk-wide.jpg` | landscape |
| N2 | `hero/dusk-tall.jpg` | portrait |
| M1 | `hero/morning-wide.jpg` | landscape |
| M2 | `hero/morning-tall.jpg` | portrait |
| R1 | `rooms/01-web.jpg` | portrait |
| R2 | `rooms/02-app.jpg` | portrait |
| R3 | `rooms/03-game.jpg` | portrait |
| R4 | `rooms/04-ai-ml.jpg` | portrait |
| R5 | `rooms/05-ui-ux.jpg` | portrait |
| R6 | `rooms/06-engine.jpg` | portrait |
| F1 | `devfest/night-wide.jpg` | landscape |
| D1 | `dawn/door-wide.jpg` | landscape |
| D2 | `dawn/door-tall.jpg` | portrait |
| B1 | `brand/boat.png` | square, transparent |

If you only do a few first: N1, then the six rooms. Those seven carry the site.

Everything lands under `public/images/` at the path given. The build renders a lit placeholder for anything missing, so partial delivery is fine and nothing breaks while you work through them.
