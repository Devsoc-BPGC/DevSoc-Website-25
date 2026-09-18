/**
 * The building directory in the chrome. Its own file on purpose: the chrome is
 * on every page, and importing it from the content barrel would drag the whole
 * 186 name list into every page's bundle.
 */

export const directory = [
  { label: "Rooms", href: "/#rooms" },
  { label: "Work", href: "/#log" },
  { label: "Coordinators", href: "/#crew" },
  { label: "Inductees", href: "/inductees" },
];
