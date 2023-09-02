const colors = require('tailwindcss/colors')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      spacing: {
        18: '4.5rem',
      },
      colors: {
        primary: {
          50: '#E9F9F4',
          100: '#CFF0E5',
          200: '#A5E2CC',
          300: '#7BD3B3',
          400: '#52C49A',
          500: '#22C493',
          600: '#1BA57F',
          700: '#15876A',
          800: '#106A56',
          900: '#0B4D41',
        },
        secondary: colors.sky,
        highlight: '#D1A100',
        mygreen: {
          100: '#E3FAF3',
          900: '#205F4C',
        },
        myblue: {
          100: '#E3ECFA',
          900: '#295C78',
        },
        myred: {
          100: '#FFEFEF',
          900: '#5F2020',
        },
        mypink: {
          100: '#FAE3F1',
          900: '#782954',
        },
        myyellow: {
          100: '#FFF5DA',
          900: '#4F452D',
        },
      },
      backgroundColor: {
        base: '#FCFCFD',
        strong: '#e7ecf3',
        moderate: '#F5F7FA',
        subtle: '#F8FAFC',
      },
      borderColor: {
        base: '#EBECEF',
        strong: '#9098A4',
        moderate: '#E8EEF3',
      },
      borderRadius: {
        base: '24px',
      },
      boxShadow: {
        base: '0px 8px 32px 0px rgba(48, 80, 109, 0.05)',
      },
      fontSize: {
        'xs-regular': [
          '12px',
          {
            lineHeight: '18px',
            fontWeight: '400',
          },
        ],
        'xs-medium': [
          '12px',
          {
            lineHeight: '18px',
            fontWeight: '500',
          },
        ],
        'xs-semibold': [
          '12px',
          {
            lineHeight: '18px',
            fontWeight: '600',
          },
        ],
        'xs-bold': [
          '12px',
          {
            lineHeight: '18px',
            fontWeight: '700',
          },
        ],
        'sm-regular': [
          '14px',
          {
            lineHeight: '20px',
            fontWeight: '400',
          },
        ],
        'sm-medium': [
          '14px',
          {
            lineHeight: '20px',
            fontWeight: '500',
          },
        ],
        'sm-semibold': [
          '14px',
          {
            lineHeight: '20px',
            fontWeight: '600',
          },
        ],
        'sm-bold': [
          '14px',
          {
            lineHeight: '20px',
            fontWeight: '700',
          },
        ],
        'md-regular': [
          '16px',
          {
            lineHeight: '24px',
            fontWeight: '400',
          },
        ],
        'md-medium': [
          '16px',
          {
            lineHeight: '24px',
            fontWeight: '500',
          },
        ],
        'md-semibold': [
          '16px',
          {
            lineHeight: '24px',
            fontWeight: '600',
          },
        ],
        'md-bold': [
          '16px',
          {
            lineHeight: '24px',
            fontWeight: '700',
          },
        ],
        'lg-regular': [
          '18px',
          {
            lineHeight: '28px',
            fontWeight: '400',
          },
        ],
        'lg-medium': [
          '18px',
          {
            lineHeight: '28px',
            fontWeight: '500',
          },
        ],
        'lg-semibold': [
          '18px',
          {
            lineHeight: '28px',
            fontWeight: '600',
          },
        ],
        'lg-bold': [
          '18px',
          {
            lineHeight: '28px',
            fontWeight: '700',
          },
        ],
        'xl-regular': [
          '20px',
          {
            lineHeight: '30px',
            fontWeight: '400',
          },
        ],
        'xl-medium': [
          '20px',
          {
            lineHeight: '30px',
            fontWeight: '500',
          },
        ],
        'xl-semibold': [
          '20px',
          {
            lineHeight: '30px',
            fontWeight: '600',
          },
        ],
        'xl-bold': [
          '20px',
          {
            lineHeight: '30px',
            fontWeight: '700',
          },
        ],
        'display-xs-regular': [
          '24px',
          {
            lineHeight: '32px',
            fontWeight: '400',
          },
        ],
        'display-xs-medium': [
          '24px',
          {
            lineHeight: '32px',
            fontWeight: '500',
          },
        ],
        'display-xs-semibold': [
          '24px',
          {
            lineHeight: '32px',
            fontWeight: '600',
          },
        ],
        'display-xs-bold': [
          '24px',
          {
            lineHeight: '32px',
            fontWeight: '700',
          },
        ],
        'display-sm-regular': [
          '30px',
          {
            lineHeight: '38px',
            fontWeight: '400',
          },
        ],
        'display-sm-medium': [
          '30px',
          {
            lineHeight: '38px',
            fontWeight: '500',
          },
        ],
        'display-sm-semibold': [
          '30px',
          {
            lineHeight: '38px',
            fontWeight: '600',
          },
        ],
        'display-sm-bold': [
          '30px',
          {
            lineHeight: '38px',
            fontWeight: '700',
          },
        ],
        'display-md-regular': [
          '36px',
          {
            lineHeight: '44px',
            fontWeight: '400',
          },
        ],
        'display-md-medium': [
          '36px',
          {
            lineHeight: '44px',
            fontWeight: '500',
          },
        ],
        'display-md-semibold': [
          '36px',
          {
            lineHeight: '44px',
            fontWeight: '600',
          },
        ],
        'display-md-bold': [
          '36px',
          {
            lineHeight: '44px',
            fontWeight: '700',
          },
        ],
        'display-lg-regular': [
          '48px',
          {
            lineHeight: '60px',
            fontWeight: '400',
          },
        ],
        'display-lg-medium': [
          '48px',
          {
            lineHeight: '60px',
            fontWeight: '500',
          },
        ],
        'display-lg-semibold': [
          '48px',
          {
            lineHeight: '60px',
            fontWeight: '600',
          },
        ],
        'display-lg-bold': [
          '48px',
          {
            lineHeight: '60px',
            fontWeight: '700',
          },
        ],
        'display-lg-black': [
          '48px',
          {
            lineHeight: '60px',
            fontWeight: '900',
          },
        ],
        'display-xl-regular': [
          '60px',
          {
            lineHeight: '72px',
            fontWeight: '400',
          },
        ],
        'display-xl-medium': [
          '60px',
          {
            lineHeight: '72px',
            fontWeight: '500',
          },
        ],
        'display-xl-semibold': [
          '60px',
          {
            lineHeight: '72px',
            fontWeight: '600',
          },
        ],
        'display-xl-bold': [
          '60px',
          {
            lineHeight: '72px',
            fontWeight: '700',
          },
        ],
        'display-xl-black': [
          '60px',
          {
            lineHeight: '72px',
            fontWeight: '900',
          },
        ],
        'display-2xl-regular': [
          '72px',
          {
            lineHeight: '90px',
            fontWeight: '400',
          },
        ],
        'display-2xl-medium': [
          '72px',
          {
            lineHeight: '90px',
            fontWeight: '500',
          },
        ],
        'display-2xl-semibold': [
          '72px',
          {
            lineHeight: '90px',
            fontWeight: '600',
          },
        ],
        'display-2xl-bold': [
          '72px',
          {
            lineHeight: '90px',
            fontWeight: '700',
          },
        ],
        'display-2xl-black': [
          '72px',
          {
            lineHeight: '90px',
            fontWeight: '900',
          },
        ],
        'display-3xl-bold': [
          '90px',
          {
            lineHeight: '104px',
            fontWeight: '700',
          },
        ],
        'display-3xl-black': [
          '90px',
          {
            lineHeight: '104px',
            fontWeight: '900',
          },
        ],
      },
      ringColor: {
        base: '#EBECEF',
      },
      textColor: {
        strong: '#1E2022',
        semistrong: '#313131',
        moderate: '#71818B',
        subtle: '#9098A4',
        'footer-color': '#647087',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('tailwindcss-safe-area'),
  ],
}
