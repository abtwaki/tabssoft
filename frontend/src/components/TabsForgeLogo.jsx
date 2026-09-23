/** The actual TabsForge SchoolOS logo lockup.
 *  `card` wraps it in a padded white card for use on dark backgrounds. */
export default function TabsForgeLogo({ height = 46, card = false, style }) {
  return (
    <img
      src="/assets/tabsforge-logo.jpg"
      alt="TabsForge SchoolOS — Educate. Manage. Grow."
      className={`tabsforge-logo${card ? " card" : ""}`}
      style={{ height, ...style }}
    />
  );
}
