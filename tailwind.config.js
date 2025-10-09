module.exports = {
    content: ["./**/*.{html,js,njk,liquid}"],
    theme: {
      extend: {
        fontFamily: {
          'kannada': ['Noto Sans Kannada', 'sans-serif'],
        },
      },
    },
    plugins: [
      require('@tailwindcss/typography'),
    ],
  }