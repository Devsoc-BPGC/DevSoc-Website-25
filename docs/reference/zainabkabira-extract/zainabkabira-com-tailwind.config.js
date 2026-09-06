/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
    colors: {
        primary: {
            '50': 'hsl(43, 100%, 97%)',
            '100': 'hsl(43, 100%, 94%)',
            '200': 'hsl(43, 100%, 86%)',
            '300': 'hsl(43, 100%, 76%)',
            '400': 'hsl(43, 100%, 64%)',
            '500': 'hsl(43, 100%, 50%)',
            '600': 'hsl(43, 100%, 40%)',
            '700': 'hsl(43, 100%, 32%)',
            '800': 'hsl(43, 100%, 24%)',
            '900': 'hsl(43, 100%, 16%)',
            '950': 'hsl(43, 100%, 10%)',
            DEFAULT: '#fff9ea'
        },
        secondary: {
            '50': 'hsl(47, 89%, 97%)',
            '100': 'hsl(47, 89%, 94%)',
            '200': 'hsl(47, 89%, 86%)',
            '300': 'hsl(47, 89%, 76%)',
            '400': 'hsl(47, 89%, 64%)',
            '500': 'hsl(47, 89%, 50%)',
            '600': 'hsl(47, 89%, 40%)',
            '700': 'hsl(47, 89%, 32%)',
            '800': 'hsl(47, 89%, 24%)',
            '900': 'hsl(47, 89%, 16%)',
            '950': 'hsl(47, 89%, 10%)',
            DEFAULT: '#f4cd44'
        },
        accent: {
            '50': 'hsl(226, 59%, 97%)',
            '100': 'hsl(226, 59%, 94%)',
            '200': 'hsl(226, 59%, 86%)',
            '300': 'hsl(226, 59%, 76%)',
            '400': 'hsl(226, 59%, 64%)',
            '500': 'hsl(226, 59%, 50%)',
            '600': 'hsl(226, 59%, 40%)',
            '700': 'hsl(226, 59%, 32%)',
            '800': 'hsl(226, 59%, 24%)',
            '900': 'hsl(226, 59%, 16%)',
            '950': 'hsl(226, 59%, 10%)',
            DEFAULT: '#3456c8'
        },
        'neutral-50': '#060606',
        'neutral-100': '#0b0b0b',
        'neutral-200': '#ffffff',
        'neutral-300': '#8a8474',
        'neutral-400': '#2b2b2b',
        'neutral-500': '#a79c89',
        'neutral-600': '#8f8a80',
        'neutral-700': '#6d6d6d',
        'neutral-800': '#c9bea9',
        'neutral-900': '#939393',
        background: '#fff9f1',
        foreground: '#000000'
    },
    fontFamily: {
        sans: [
            'Space Grotesk',
            'sans-serif'
        ],
        heading: [
            'DM Serif Display',
            'sans-serif'
        ],
        body: [
            'Darker Grotesque',
            'sans-serif'
        ],
        font7: [
            'Inter',
            'sans-serif'
        ]
    },
    fontSize: {
        '34': [
            '34px',
            {
                lineHeight: '35.7px'
            }
        ],
        '40': [
            '40px',
            {
                lineHeight: 'normal',
                letterSpacing: '-1.2px'
            }
        ],
        '44': [
            '44px',
            {
                lineHeight: '59.752px'
            }
        ],
        '46': [
            '46px',
            {
                lineHeight: '46px'
            }
        ],
        '52': [
            '52px',
            {
                lineHeight: '50.44px',
                letterSpacing: '-2.4px'
            }
        ],
        '58': [
            '58px',
            {
                lineHeight: '63.8px',
                letterSpacing: '0.58px'
            }
        ],
        '60': [
            '60px',
            {
                lineHeight: '63px',
                letterSpacing: '-1.8px'
            }
        ],
        '64': [
            '64px',
            {
                lineHeight: '70.4px',
                letterSpacing: '0.5px'
            }
        ],
        '96': [
            '96px',
            {
                lineHeight: '86.4px',
                letterSpacing: '1.92px'
            }
        ],
        '136': [
            '136px',
            {
                lineHeight: 'normal',
                letterSpacing: '2.7px'
            }
        ],
        '82.96': [
            '82.96px',
            {
                lineHeight: 'normal',
                letterSpacing: '-3.3184px'
            }
        ],
        '53.376': [
            '53.376px',
            {
                lineHeight: '56.5786px',
                letterSpacing: '0.53376px'
            }
        ],
        '38.942': [
            '38.942px',
            {
                lineHeight: 'normal'
            }
        ],
        '33.14': [
            '33.14px',
            {
                lineHeight: 'normal',
                letterSpacing: '-0.6628px'
            }
        ],
        '32.13': [
            '32.13px',
            {
                lineHeight: 'normal',
                letterSpacing: '-0.6426px'
            }
        ]
    },
    spacing: {
        '19': '38px',
        '26': '52px',
        '28': '56px',
        '30': '60px',
        '32': '64px',
        '36': '72px',
        '40': '80px',
        '45': '90px',
        '48': '96px',
        '56': '112px',
        '68': '136px',
        '84': '168px',
        '100': '200px',
        '160': '320px',
        '169': '338px',
        '1px': '1px',
        '43px': '43px',
        '47px': '47px',
        '149px': '149px',
        '157px': '157px',
        '315px': '315px'
    },
    borderRadius: {
        xs: '2px',
        md: '8px',
        lg: '14px',
        xl: '22px',
        full: '9999px'
    },
    boxShadow: {
        sm: 'rgba(0, 0, 0, 0.45) 0px 0px 7px 0px',
        md: 'rgba(0, 0, 0, 0.15) 0px 0px 16px 8px',
        lg: 'rgba(0, 0, 0, 0.12) 0px 8px 24px 0px',
        xl: 'rgb(0, 0, 0) 0px 40px 120px -30px'
    },
    screens: {
        sm: '641px',
        '901px': '901px',
        '1101px': '1101px',
        '1400px': '1400px',
        '1440px': '1440px',
        '1441px': '1441px'
    },
    transitionDuration: {
        '0': '0s',
        '50': '0.05s',
        '60': '0.06s',
        '80': '0.08s',
        '90': '0.09s',
        '100': '0.1s',
        '120': '0.12s',
        '160': '0.16s',
        '180': '0.18s',
        '200': '0.2s',
        '220': '0.22s',
        '240': '0.24s',
        '250': '0.25s',
        '260': '0.26s',
        '270': '0.27s',
        '300': '0.3s',
        '320': '0.32s',
        '340': '0.34s',
        '350': '0.35s',
        '360': '0.36s',
        '400': '0.4s',
        '420': '0.42s',
        '450': '0.45s',
        '480': '0.48s',
        '500': '0.5s',
        '550': '0.55s',
        '560': '0.56s',
        '600': '0.6s',
        '700': '0.7s',
        '850': '0.85s',
        '900': '0.9s',
        '1150': '1.15s'
    },
    transitionTimingFunction: {
        custom: 'cubic-bezier(0.16, 1, 0.3, 1)',
        linear: 'linear'
    },
    container: {
        center: true,
        padding: '0px'
    },
    maxWidth: {
        container: 'calc(100% - 96px)'
    }
},
  },
};
