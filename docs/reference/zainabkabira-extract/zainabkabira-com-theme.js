// React Theme — extracted from https://zainabkabira.com
// Compatible with: Chakra UI, Stitches, Vanilla Extract, or any CSS-in-JS

/**
 * TypeScript type definition for this theme:
 *
 * interface Theme {
 *   colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    neutral50: string;
    neutral100: string;
    neutral200: string;
    neutral300: string;
    neutral400: string;
    neutral500: string;
    neutral600: string;
    neutral700: string;
    neutral800: string;
    neutral900: string;
 *   };
 *   fonts: {
    body: string;
    mono: string;
 *   };
 *   fontSizes: {
    '40': string;
    '44': string;
    '46': string;
    '52': string;
    '58': string;
    '60': string;
    '64': string;
    '96': string;
    '136': string;
    '82.96': string;
    '53.376': string;
    '38.942': string;
 *   };
 *   space: {
    '1': string;
    '38': string;
    '43': string;
    '47': string;
    '52': string;
    '56': string;
    '60': string;
    '64': string;
    '72': string;
    '80': string;
    '90': string;
    '96': string;
    '112': string;
    '136': string;
    '149': string;
    '157': string;
 *   };
 *   radii: {
    xs: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
 *   };
 *   shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
 *   };
 *   states: {
 *     hover: { opacity: number };
 *     focus: { opacity: number };
 *     active: { opacity: number };
 *     disabled: { opacity: number };
 *   };
 * }
 */

export const theme = {
  "colors": {
    "primary": "#fff9ea",
    "secondary": "#f4cd44",
    "accent": "#3456c8",
    "background": "#fff9f1",
    "foreground": "#000000",
    "neutral50": "#060606",
    "neutral100": "#0b0b0b",
    "neutral200": "#ffffff",
    "neutral300": "#8a8474",
    "neutral400": "#2b2b2b",
    "neutral500": "#a79c89",
    "neutral600": "#8f8a80",
    "neutral700": "#6d6d6d",
    "neutral800": "#c9bea9",
    "neutral900": "#939393"
  },
  "fonts": {
    "body": "'Darker Grotesque', sans-serif",
    "mono": "'JetBrains Mono', monospace"
  },
  "fontSizes": {
    "40": "40px",
    "44": "44px",
    "46": "46px",
    "52": "52px",
    "58": "58px",
    "60": "60px",
    "64": "64px",
    "96": "96px",
    "136": "136px",
    "82.96": "82.96px",
    "53.376": "53.376px",
    "38.942": "38.942px"
  },
  "space": {
    "1": "1px",
    "38": "38px",
    "43": "43px",
    "47": "47px",
    "52": "52px",
    "56": "56px",
    "60": "60px",
    "64": "64px",
    "72": "72px",
    "80": "80px",
    "90": "90px",
    "96": "96px",
    "112": "112px",
    "136": "136px",
    "149": "149px",
    "157": "157px"
  },
  "radii": {
    "xs": "2px",
    "md": "8px",
    "lg": "14px",
    "xl": "22px",
    "full": "9999px"
  },
  "shadows": {
    "sm": "rgba(0, 0, 0, 0.45) 0px 0px 7px 0px",
    "md": "rgba(0, 0, 0, 0.15) 0px 0px 16px 8px",
    "lg": "rgba(0, 0, 0, 0.12) 0px 8px 24px 0px",
    "xl": "rgb(0, 0, 0) 0px 40px 120px -30px"
  },
  "states": {
    "hover": {
      "opacity": 0.08
    },
    "focus": {
      "opacity": 0.12
    },
    "active": {
      "opacity": 0.16
    },
    "disabled": {
      "opacity": 0.38
    }
  }
};

// MUI v5 theme
export const muiTheme = {
  "palette": {
    "primary": {
      "main": "#fff9ea",
      "light": "hsl(43, 100%, 95%)",
      "dark": "hsl(43, 100%, 81%)"
    },
    "secondary": {
      "main": "#f4cd44",
      "light": "hsl(47, 89%, 76%)",
      "dark": "hsl(47, 89%, 46%)"
    },
    "background": {
      "default": "#fff9f1",
      "paper": "#060606"
    },
    "text": {
      "primary": "#000000",
      "secondary": "#060606"
    }
  },
  "typography": {
    "fontFamily": "'Lato', sans-serif",
    "h1": {
      "fontSize": "58px",
      "fontWeight": "400",
      "lineHeight": "63.8px"
    }
  },
  "shape": {
    "borderRadius": 8
  },
  "shadows": [
    "rgb(98, 97, 94) 0px 0px 0px 2px",
    "rgb(50, 49, 49) 0px 0px 0px 0px inset",
    "rgb(98, 97, 94) 0px 0px 0px 0.5px",
    "rgba(0, 0, 0, 0.1) 0px 1px 3px 0px inset",
    "rgb(237, 237, 237) 0px 3px 1px 0px"
  ]
};

export default theme;
