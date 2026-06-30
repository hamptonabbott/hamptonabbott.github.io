/**
 * Tailwind config for the site chrome (shared nav/footer) + homepage.
 * Long-form prose on subpages is still styled by the minima theme's main.css;
 * Tailwind here supplies the shared chrome + homepage/projects utility classes.
 *
 * Regenerate the static stylesheet after changing Tailwind classes in any scanned file:
 *   npx -y tailwindcss@3.4.17 -c ./tailwind.config.js -i ./tailwind.src.css -o ./assets/tailwind.css --minify
 */
module.exports = {
  content: [
    './index.html',
    './_includes/**/*.html',
    './_layouts/**/*.html',
    './*.md',
    './projects/**/*.md',
    './_posts/**/*.md',
  ],
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
