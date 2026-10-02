# Production Roadmap

## 1. Data & model

- **Expand classes & crops**: rice (blast, brown spot), cotton, chilli, sugarcane —
  partner with state agriculture universities / KVKs for labelled field data.
- **On-field sampling**: retrain on device-camera images (the demo pipeline already
  gates quality); add hard-negative mining for healthy/non-plant inputs and "unknown
  class" rejection (OOD detector).
- **Uncertainty calibration**: temperature scaling + expected calibration error; show
  calibrated confidence in the severity formula instead of raw softmax.
- **Model updates**: versioned ONNX with staged rollout (`/api/model/version` exists);
  chunked download + SHA checksum; A/B against current version using review feedback.

## 2. Spatio-temporal risk engine (ST-GNN)

`Backend/app/services/risk.py` exposes a modular `compute_region_risk` interface. The
production engine replaces the rule term with a **Spatio-Temporal Graph Neural Network**:

- Graph: farms/nodes, edges from distance + crop similarity + transport corridors.
- Features per node: disease incidence, weather history (IMD), soil (ICAR), planting
  calendar.
- Temporal: LSTM/GraphWaveNet-style encoders over 21–90 day windows.
- Output: per-village risk predictions + predicted spread fronts — feeds the officer
  map and farmer alerting.

## 3. Platform

- **AuthZ**: OTP login via farmer ID; officer via KVK/Ministry SSO (Keycloak); images
  gated by consent + retention policy.
- **Backend**: Postgres + multi-worker uvicorn behind nginx; bulk upload over
  multipart with resume; idempotent by `(device_id, diagnosis_id)`.
- **Offline hardening**: service-worker background sync + periodic queue flush;
  offline tile caching for the map; manual location fallback when GPS is off.
- **Localization**: full hi/mr/ta/te/kn bundles (the `i18n` loader already supports
  adding locales by dropping one JSON bundle).

## 4. Monitoring & learning

- **Expert-review feedback loop**: every `needs_review` case with a decision becomes a
  training signal; periodic fine-tune + re-evaluate (`evaluate_model.py` + confusion
  matrix are the CI gate).
- **Dashboards for officials**: block-level drill-down, early-warning thresholds,
  exportable CSVs (the aggregate API shapes already exist).

## 5. Scaling the demo → pilot

- Pilot radius in the Demo Region (Indore Rural) with 50 farmer-volunteers, KVK
  onboarded; seed real scans by having officers review the auto-flagged cases;
  30 days later fine-tune on the field-app baseline.