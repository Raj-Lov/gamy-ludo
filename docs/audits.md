# Accessibility, performance & responsiveness audits

## Lighthouse

1. Build the production bundle locally:
   ```bash
   npm run build
   npm run start
   ```
2. In another terminal, run the Lighthouse CLI:
   ```bash
   npx @lhci/cli autorun --collect.url=http://localhost:3000 --assert.preset=lighthouse:recommended
   ```
3. Review the HTML report generated in `.lighthouseci/`. Address any regressions before shipping.

> **Note:** The CLI requires Chrome to be available. When running in CI environments without Chrome, use `npx @lhci/cli collect --runner=devtools --chrome-path=/path/to/chrome`.

## Keyboard & screen reader support

- Tab through the dashboard, puzzles, and profile flows ensuring visible focus rings and logical tab order.
- Trigger puzzle interactions using the keyboard (e.g., button actions, drag alternatives) and confirm ARIA labels convey context.
- Use a screen reader (VoiceOver, NVDA, or JAWS) to validate component announcements and headings hierarchy.

## Responsive behaviour

- Test the main dashboards and puzzle screens at breakpoints 320px, 768px, 1024px, and 1440px using browser dev tools or Vercel preview devices.
- Confirm navigation drawers collapse into the existing mobile menu and that puzzle grids remain legible.

Document audit outcomes in pull requests or the deployment log so regressions can be tracked over time.
