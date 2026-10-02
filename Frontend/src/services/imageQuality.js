/**
 * Image-quality assessment (prototype implementation of the SIH
 * OpenCV preprocessing step, done with the Canvas API so it needs
 * no network and runs inside the browser).
 *
 * Metrics:
 *   - blur      -> variance of the 3x3 Laplacian over a small grayscale
 *                  downscale. Low variance = blurry image.
 *   - brightness-> mean pixel intensity. Too low = dark, too high =
 *                  overexposed.
 *   - size      -> longest edge in px.
 */

const LAPLACIAN = [
  [0, 1, 0],
  [1, -4, 1],
  [0, 1, 0],
]

/**
 * @param {HTMLImageElement|ImageBitmap} image
 * @returns {{mean: number, variance: number}}
 */
function grayscaleStats(image) {
  // Downscale to a small working grid (keeps the browser fast even for
  // 12MP phone photos).
  const scale = Math.min(1, 96 / Math.max(image.width, image.height))
  const w = Math.max(8, Math.round(image.width * scale))
  const h = Math.max(8, Math.round(image.height * scale))

  const canvas = document.createElement("canvas")
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext("2d", { willReadFrequently: true })
  ctx.drawImage(image, 0, 0, w, h)
  const { data } = ctx.getImageData(0, 0, w, h)

  const gray = new Float32Array(w * h)
  let sum = 0
  for (let i = 0; i < w * h; i += 1) {
    const r = data[i * 4]
    const g = data[i * 4 + 1]
    const b = data[i * 4 + 2]
    // Luminance weighting (rec. 709).
    const value = 0.2126 * r + 0.7152 * g + 0.0722 * b
    gray[i] = value
    sum += value
  }
  const mean = sum / (w * h)

  // 3x3 Laplacian variance (ignoring borders).
  let acc = 0
  let count = 0
  for (let y = 1; y < h - 1; y += 1) {
    for (let x = 1; x < w - 1; x += 1) {
      let lap = 0
      for (let ky = -1; ky <= 1; ky += 1) {
        for (let kx = -1; kx <= 1; kx += 1) {
          lap += LAPLACIAN[ky + 1][kx + 1] * gray[(y + ky) * w + (x + kx)]
        }
      }
      acc += lap * lap
      count += 1
    }
  }
  const variance = count > 0 ? acc / count : 0
  return { mean, variance }
}

/**
 * Analyze an image element and return a quality verdict.
 *
 * @param {HTMLImageElement|ImageBitmap} image
 * @returns {{
 *   pass: boolean,
 *   code: 'ok'|'blurry'|'dark'|'bright'|'small',
 *   blurScore: number,
 *   brightness: number,
 *   width: number, height: number,
 * }}
 */
export function assessImageQuality(image) {
  const { mean, variance } = grayscaleStats(image)
  const blurScore = Number(variance.toFixed(2))
  const brightness = Number(mean.toFixed(1))

  const size = Math.max(image.width, image.height)
  const result = {
    pass: true,
    code: "ok",
    blurScore,
    brightness,
    width: image.width,
    height: image.height,
  }

  // Heuristic thresholds tuned for the prototype demo camera/leaves.
  // They intentionally err on the strict side so the quality gate is
  // visibly demonstrated without rejecting realistic photos.
  if (size < 96) {
    result.pass = false
    result.code = "small"
  } else if (blurScore < 45) {
    result.pass = false
    result.code = "blurry"
  } else if (brightness < 45) {
    result.pass = false
    result.code = "dark"
  } else if (brightness > 235) {
    result.pass = false
    result.code = "bright"
  }

  return result
}