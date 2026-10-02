/**
 * On-device inference via ONNX Runtime Web (WASM).
 *
 * The model runs entirely in the browser: no image ever leaves the
 * device during diagnosis. The wasm binary ships in /public/ort so the
 * engine works offline after first load.
 */

import * as ort from "onnxruntime-web"
import { MODEL_URL, MODEL_WASM_PATH } from "../lib/config"

let sessionPromise = null

async function createSession() {
  ort.env.wasm.wasmPaths = WASM_ALIASES
  ort.env.wasm.numThreads = 1 // predictable on low-end devices
  const modelBuffer = await fetch(MODEL_URL).then((r) => {
    if (!r.ok) throw new Error(`Model fetch failed: ${r.status}`)
    return r.arrayBuffer()
  })
  return ort.InferenceSession.create(modelBuffer, {
    executionProviders: ["wasm"],
    graphOptimizationLevel: "all",
  })
}

/**
 * ortonnxruntime-web 1.30 defaults to the ".jsep" wasm build, but we only
 * ship the classic SIMD+threaded pair (much smaller). Map every variant name
 * the loader may request back to the base files we bundle, so the PWA keeps a
 * small footprint and works without WebGPU/WebNN.
 */
const WASM_ALIASES = Object.fromEntries(
  [
    "ort-wasm-simd-threaded.jsep",
    "ort-wasm-simd-threaded.jspi",
    "ort-wasm-simd-threaded.asyncify",
    "ort-wasm-simd-threaded",
  ].flatMap((name) => [
    [`${name}.mjs`, MODEL_WASM_PATH + "ort-wasm-simd-threaded.mjs"],
    [`${name}.wasm`, MODEL_WASM_PATH + "ort-wasm-simd-threaded.wasm"],
  ]),
)

/** Lazily loaded singleton session. */
export function loadModel() {
  sessionPromise ??= createSession()
  return sessionPromise
}

/**
 * ImageNet normalisation shared with the training pipeline.
 */
export function preprocessToTensor(image, inputSize = 224) {
  // Match eval preprocessing: resize shorter side then centre-crop.
  let canvas = document.createElement("canvas")
  canvas.width = inputSize
  canvas.height = inputSize
  const ctx = canvas.getContext("2d", { willReadFrequently: true })

  const shortSide = Math.min(image.width, image.height)
  const scale = (inputSize * 1.15) / shortSide
  const drawW = Math.min(image.width * scale, inputSize)
  const drawH = Math.min(image.height * scale, inputSize)
  const dx = (inputSize - drawW) / 2
  const dy = (inputSize - drawH) / 2
  ctx.drawImage(image, dx, dy, drawW, drawH)

  const imageData = ctx.getImageData(0, 0, inputSize, inputSize)
  const pixelData = imageData.data

  const MEAN = [0.485, 0.456, 0.406]
  const STD = [0.229, 0.224, 0.225]
  const floatData = new Float32Array(1 * 3 * inputSize * inputSize)
  const cIndex = (c, y, x) => c * inputSize * inputSize + y * inputSize + x

  for (let y = 0; y < inputSize; y += 1) {
    for (let x = 0; x < inputSize; x += 1) {
      const pixelIndex = (y * inputSize + x) * 4
      const r = pixelData[pixelIndex] / 255
      const g = pixelData[pixelIndex + 1] / 255
      const b = pixelData[pixelIndex + 2] / 255
      floatData[cIndex(0, y, x)] = (r - MEAN[0]) / STD[0]
      floatData[cIndex(1, y, x)] = (g - MEAN[1]) / STD[1]
      floatData[cIndex(2, y, x)] = (b - MEAN[2]) / STD[2]
    }
  }

  return new ort.Tensor("float32", floatData, [1, 3, inputSize, inputSize])
}

/**
 * @param {HTMLImageElement|ImageBitmap} image
 * @returns {Promise<Float32Array>} softmax probabilities over CLASS_LIST.
 */
export async function predict(image) {
  const session = await loadModel()
  const tensor = preprocessToTensor(image)
  const outputs = await session.run({ input: tensor })
  const logits = outputs[session.outputNames[0]].data

  // Softmax.
  const max = Math.max(...logits)
  const exps = logits.map((v) => Math.exp(v - max))
  const sum = exps.reduce((a, b) => a + b, 0)
  return exps.map((v) => v / sum)
}