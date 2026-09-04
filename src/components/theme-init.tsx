// Server-safe module: renders the inline theme script injected into <head>.
// Kept separate from the client ThemeProvider so the server layout can call it.

/** Inline script injected before paint to avoid a light/dark flash. */
export function themeInitScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `try{var t=localStorage.getItem("tp-theme");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}document.documentElement.classList.toggle("dark",t!=="light");}catch(e){}`,
      }}
    />
  );
}
