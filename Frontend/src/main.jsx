import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App.jsx"
import { I18nProvider } from "./i18n"

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </StrictMode>,
)

/**
 * 5. Register the service worker so the built app works as a PWA:
 * installable on the home screen + scan history readable offline.
 *
 * Registered only in production builds to avoid the dev-server caching
 * fights with the editor hot reload.
 */
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.error("Service worker registration failed:", error)
    })
  })
}