import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Thin wrapper around the browser SpeechSynthesis API used for the
 * "Read Aloud" / Text-to-Speech button (feature 2).
 *
 * Safe to mount on any device: when speechSynthesis is unavailable
 * (very old browsers), `supported` is false and the UI can hide the button.
 *
 * @returns {{ supported: boolean, speaking: boolean, speak: (text: string) => void, stop: () => void }}
 */
export function useSpeech() {
  const [supported] = useState(
    () => typeof window !== 'undefined' && 'speechSynthesis' in window,
  )
  const [speaking, setSpeaking] = useState(false)
  const utteranceRef = useRef(null)

  const stop = useCallback(() => {
    if (!supported) return
    window.speechSynthesis.cancel()
    setSpeaking(false)
  }, [supported])

  const speak = useCallback(
    (text) => {
      if (!supported || !text) return
      stop() // restart from the beginning on re-click

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-IN'
      utterance.rate = 1.0
      utterance.pitch = 1.0
      utterance.onend = () => setSpeaking(false)
      utterance.onerror = () => setSpeaking(false)
      utteranceRef.current = utterance

      window.speechSynthesis.speak(utterance)
      setSpeaking(true)
    },
    [supported, stop],
  )

  // Cancel any in-flight speech when the owning component unmounts.
  useEffect(() => () => stop(), [stop])

  return { supported, speaking, speak, stop }
}