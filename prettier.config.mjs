/** @type {import("prettier").Config} */
const config = {
  // Keep formatting predictable and low-drama for a template repo.
  printWidth: 100,
  semi: true,
  singleQuote: false,
  trailingComma: "es5",

  // Tailwind class sorting.
  plugins: ["prettier-plugin-tailwindcss"],
};

export default config;
