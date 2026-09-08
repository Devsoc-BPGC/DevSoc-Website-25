/**
 * How a fest site actually gets built.
 *
 * This is the answer to the site's real constraint. The club cannot show a
 * portfolio, so instead it shows the work: minute by minute, what building
 * under a deadline is like.
 *
 * Every line here is present-tense habitual. It describes how it *goes*, never
 * what *happened*. That is not a stylistic choice, it is the mechanism that
 * keeps this honest: a sentence in this mood cannot accidentally become a
 * factual claim about a specific fest, a specific year or a specific person.
 * No dates, no names, no numbers that are not verifiable elsewhere in
 * src/content.
 *
 * Two rules if you edit this. Name the constraint, never the value: "the
 * schedule changes four days out" rather than "we are adaptable". And every
 * block has to contain something that could be embarrassing, because a club
 * that admits a failure mode is a club that has one.
 */

export type Beat = {
  /** What the countdown reads while this block is up. */
  mark: string;
  /** Position on the countdown, in hours before the site goes live. */
  hours: number;
  title: string;
  /**
   * Omitted on the final beat only, where the terminal block stands in for the
   * paragraph. The two together overflow the stage and say the same thing.
   */
  body?: string;
};

export const beats: Beat[] = [
  {
    mark: "T-21 days",
    hours: 504,
    title: "The theme lands",
    body: "It arrives as one word, a mood board and no assets. Design starts drawing. Web starts a repository with nothing in it and a readme that says what the thing is, which is the only part that will still be true at the end.",
  },
  {
    mark: "T-14 days",
    hours: 336,
    title: "The page list",
    body: "It gets agreed on a whiteboard and photographed, because nobody will write it down properly. It is wrong by the end of the week. It is always wrong by the end of the week.",
  },
  {
    mark: "T-9 days",
    hours: 216,
    title: "Registration opens first",
    body: "A poster has already gone up with a link on it, so the form has to exist before the site does. Somebody writes the handler in one evening and it stays in production, untouched, for the rest of the fest.",
  },
  {
    mark: "T-4 days",
    hours: 96,
    title: "The schedule changes",
    body: "Every schedule changes. The people who wrote the schedule component find out from Instagram, at the same time as everyone else, and rebuild it around data that now has two events in one slot.",
  },
  {
    mark: "T-2 days",
    hours: 48,
    title: "Content lock",
    body: "Which is the day the content actually arrives. It comes in a spreadsheet at eleven at night, half the event names do not match the poster, and two of the images are screenshots of images.",
  },
  {
    mark: "T-16 hours",
    hours: 16,
    title: "Everyone moves into one room",
    body: "Design sits next to web because the round trip is faster than a message. Nobody plans this. It happens the same way every time, at roughly the same hour, and it is the point at which the thing starts to work.",
  },
  {
    mark: "T-3 hours",
    hours: 3,
    title: "The last thing breaks",
    body: "It is always the thing nobody owned. A font that does not load on one browser, a timezone that shifts every start time by five and a half hours, or a redirect. It is one of those three. It is genuinely always one of those three.",
  },
  {
    mark: "T-0",
    hours: 0,
    title: "It goes up",
  },
];

/** The terminal block that closes the sequence. */
export const shipLines = [
  { kind: "comment", text: "// no permission required." },
  { kind: "code", text: "const fest = await build({" },
  { kind: "indent", text: "people: 'whoever turned up'," },
  { kind: "indent", text: "sleep: 0," },
  { kind: "indent", text: "deadline: 'yesterday'," },
  { kind: "code", text: "});" },
  { kind: "ok", text: "Shipped. Every window lit." },
] as const;
