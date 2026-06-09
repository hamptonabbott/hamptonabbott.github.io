/**
 * Tailwind config for the homepage (index.html only).
 * Blog/project pages use the Jekyll minima theme, not Tailwind.
 *
 * Regenerate the static stylesheet after changing classes in index.html:
 *   npx -y tailwindcss@3.4.17 -c ./tailwind.config.js -i ./tailwind.src.css -o ./assets/tailwind.css --minify
 */
module.exports = {
  content: ['./index.html'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      colors: {
        nd:   '#37352f',
        ng:   '#787774',
        nb:   '#f6f6f5',
        nl:   '#f1f0ef',
        nbr:  '#e3e2e0',
        nteal:'#0f7b6c',
      },
    },
  },
};
