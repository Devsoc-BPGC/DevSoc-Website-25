/**
 * Where the light crosses from one scene into the next.
 *
 * Each scene draws its own stretch of the light, but the reader has to see one
 * object. So a scene ends its light at a point on the frame's edge and the next
 * scene starts it at the matching point on the opposite edge: leave through the
 * bottom at x = 0.5 and the next scene picks it up coming in from the top at
 * x = 0.5. Both scenes read the point from here, so a change to one boundary
 * cannot leave the two ends disagreeing.
 *
 * Coordinates are shares of the stage, 0 to 1, x then y.
 */

import type { LightPoint } from "./Light";

export const handoff = {
  /** Out of the hero window, down through the floor, into the plan. */
  duskToSociety: [0.5, 1] as LightPoint,
  societyFromDusk: [0.5, 0] as LightPoint,
};
