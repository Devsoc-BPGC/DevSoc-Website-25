/**
 * Your first month.
 *
 * The question the primary reader actually has, answered in second person,
 * which no other section on the site uses. Like process.ts this is written in a
 * mood that cannot become a factual claim: second-person conditional describes
 * what the month is shaped like, not what any particular person did.
 *
 * The bar in week four is deliberately low and deliberately concrete. "You have
 * put one thing on somebody else's machine" is a real threshold, it is
 * checkable, and it is far more persuasive than any adjective would be.
 *
 * Every week carries a plate. The section renders them as full bleed grounds
 * behind the open week rather than as pictures parked beside a paragraph, so a
 * week without one would read as a mistake rather than as variety.
 */

export type Week = {
  label: string;
  title: string;
  body: string;
  image: string;
  alt: string;
};

export const weeks: Week[] = [
  {
    label: "Week 0",
    title: "Induction",
    body: "A walk-in interview, not a test. Somebody asks what you have built, or what you want to build. Either answer is fine, and the second one is the more common.",
    image: "/images/process/chair.jpg",
    alt: "A folding chair pulled up to a desk, as if somebody just sat down",
  },
  {
    label: "Week 1",
    title: "The room",
    body: "You pick a room and you get added to a group that never sleeps. You will not understand half of what goes past. Nobody did at first, and the ones who say otherwise are describing their second year.",
    image: "/images/rooms/corridor-wide.jpg",
    alt: "A corridor of identical doors with light under most of them",
  },
  {
    label: "Week 2",
    title: "Something real",
    body: "You get given something small and real. Not a tutorial. A component, a screen, a script that somebody actually needs by Friday, with a person attached to it who will notice if it is not there.",
    image: "/images/process/whiteboard.jpg",
    alt: "A whiteboard of boxes and arrows, half erased",
  },
  {
    label: "Week 3",
    title: "The first review",
    body: "Somebody senior reads your code and says what is wrong with it, in front of you. This is the point. This is the entire point, and it is the thing you will still be glad about in three years.",
    image: "/images/process/desk-2am.jpg",
    alt: "A desk with one lamp and a monitor full of code",
  },
  {
    label: "Week 4",
    title: "Shipped",
    body: "You have put one thing on somebody else's machine. That is the whole bar. Everything after this is more of that, with the stakes going up and the room getting louder.",
    image: "/images/process/lid.jpg",
    alt: "A laptop with the lid nearly closed and amber light escaping the gap",
  },
];

export const inductionClose = "You join as crew. You move to core when the room decides you already are.";
