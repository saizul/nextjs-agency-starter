/**
 * Runs before first paint to apply the saved (or system) colour theme, which avoids a flash.
 * Kept as a plain string so it can be inlined in <head>.
 */
export const themeInitScript = `(function(){try{var s=localStorage.getItem("theme");var d=s?s==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d);}catch(e){}})();`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />;
}
