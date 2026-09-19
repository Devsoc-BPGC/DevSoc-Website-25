/**
 * The overture's early script and the key it reads.
 *
 * Kept out of the overture's own file, which is a client component: this is
 * rendered by the layout, on the server, so it is in the page's HTML and runs
 * before anything is painted, and React never tries to create it on the client.
 */

export const OVERTURE_KEY = "devsoc:overture";

/** Runs before the page is painted: a visit that has seen it hides it at once. */
export const OVERTURE_EARLY = `try{if(sessionStorage.getItem("${OVERTURE_KEY}")||matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.classList.add("overture-seen")}catch(e){}`;
