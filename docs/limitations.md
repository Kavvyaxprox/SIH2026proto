# Known Limitations (honest)

The prototype prioritises a *working* offline-first loop over scope. These are the gaps
we know about, and how they would be addressed in production.

## AI / data

- **Small dataset.** 620 images × pretrained MobileNetV3-Small reaches ~95% validation
  accuracy on this subset, but classes are few and images share PlantVillage camera
  conditions. Real fields (lighting, blur, unusual varieties) will degrade it.
- **No rice / cotton.** PlantVillage lacks rice; models for rice blast/brown spot and
  cotton would require a new dataset. UI text is explicit about Apple/Maize/Potato/Tomato.
- **Transfer of confidence.** Calibration is coarse (softmax proxy). A temperature-scale
  calibration on in-domain data is the first production task.
- **Severity + risk are prototype formulas** (documented in `docs/ai.md`), not
  agronomically validated models. They are transparent and labelled as such in the UI
  ("Prototype …").

## Offline / on-device

- **First page load needs connectivity** to download the ~4.5 MB model + ~14 MB wasm.
  After that the SW serves them from cache (true offline).
- **onnxruntime-web in browsers**: `simd-threaded` wasm requires the `Cross-Origin
  Isolated` / COOP-COEP headers for pthreads; without them ORT auto-falls back. Mobile
  Chrome/Safari generally work but per-device WASM performance varies.
- **IndexedDB sync status** is per-device; there is no multi-device conflict resolution
  (out of scope — ids are idempotent on the server, which is the safety net).

## Backend / scale

- **SQLite + single process** is fine for a demo; production needs Postgres and
  multi-worker deployments.
- **AuthN/Z is mocked.** "Officer" is a header toggle, not a role check. A real system
  needs OTP/Keycloak/KVK SSO, plus PII policies around images (consent, retention).
- **Open-Meteo & OSM** are free public services — no SLA. Production should vendor
  IMD weather and an NGiS basemap (see roadmap).

## Geographic scope

- Demo region fixed at **Indore Rural (22.7, 75.9)**; farms radiate ±0.2°. Any
  real deployment needs a district/locality model.

## Known cosmetic gaps

- The "demo samples" manifest is static; regenerating with `prepare_demo_samples.py`
  overwrites it (adversarial: keeps the PWA honest).
- Leaflet map tiles show only when online; an offline base map is future work.