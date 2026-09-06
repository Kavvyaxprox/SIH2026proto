/**
 * Image helpers for the scanning flow.
 *
 * History thumbnails are stored in localStorage, which is capped around
 * 5 MB, so we downscale + re-encode every picked image on the client
 * before saving it. This keeps the "offline history" feature reliable.
 */

const THUMB_MAX_SIZE = 480 // longest edge, in px
const THUMB_QUALITY = 0.82 // JPEG quality 0..1

/**
 * Reads a File (from `<input type="file">` or a camera capture) and
 * returns a compressed JPEG data-URL thumbnail suitable for storage.
 *
 * @param {File} file The image file selected by the user.
 * @returns {Promise<string>} A `data:image/jpeg;base64,...` string.
 */
export function fileToThumbnail(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onerror = () => reject(new Error('Could not read the selected image.'))
    reader.onload = () => {
      const img = new Image()

      img.onerror = () => reject(new Error('Selected file is not a valid image.'))
      img.onload = () => {
        // Keep aspect ratio while fitting within the max box.
        const scale = Math.min(1, THUMB_MAX_SIZE / Math.max(img.width, img.height))
        const w = Math.max(1, Math.round(img.width * scale))
        const h = Math.max(1, Math.round(img.height * scale))

        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', THUMB_QUALITY))
      }

      img.src = reader.result
    }

    reader.readAsDataURL(file)
  })
}