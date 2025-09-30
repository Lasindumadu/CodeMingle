# Fix Reduce Motion & Animations Toggle

## Issue
The "Reduce Motion & Animations" toggle in settings is not working properly. The current implementation uses CSS variables to control transition and animation durations, but specific CSS rules override the global `*` selector, preventing the reduced motion from taking effect.

## Root Cause
- CSS variables `--transition-duration` and `--animation-duration` are set on `:root` when reduced motion is enabled.
- The global `*` selector uses these variables: `transition: all var(--transition-duration, 0.3s) ease;`
- However, specific CSS rules (e.g., `body { transition: background-color 0.3s ease; }`) have higher specificity and override the `*` rule.
- As a result, transitions and animations are not disabled when the toggle is on.

## Solution
Implement reduced motion using a CSS class approach similar to high contrast mode:
1. Add/remove `reduced-motion` class to the body element when the setting changes.
2. Add CSS rule `.reduced-motion * { transition: none !important; animation: none !important; }` to override all animations.
3. Remove the CSS variable approach from `SettingsContext.js`.
4. Update the global `*` selector to use fixed durations instead of variables.

## Tasks
- [ ] Update `SettingsContext.js` applyTheme function to add/remove `reduced-motion` class instead of setting CSS variables.
- [ ] Update `themes.css` to add `.reduced-motion` rule and remove variable usage in `*` selector.
- [ ] Test the toggle functionality to ensure animations are disabled when enabled.
- [ ] Verify persistence across sessions.

## Files to Edit
- `codemingle-frontend/src/context/SettingsContext.js`
- `codemingle-frontend/src/styles/themes.css`

## Testing
- Toggle "Reduce Motion & Animations" on/off in settings.
- Verify that page transitions, button hover effects, and other animations are disabled when enabled.
- Check that the setting persists after page reload.
- Ensure compatibility with system `prefers-reduced-motion` setting.
