import { useCallback, useEffect, useRef, useState } from 'react'
import { getMockDiagnosis } from '../lib/mockData'
import { fileToThumbnail } from '../lib/thumbnail'
import { useLocalStorage } from '../hooks/useLocalStorage'
import BottomNav from './BottomNav'
import Header from './Header'
import HistoryView from './HistoryView'
import HomeDashboard from './HomeDashboard'
import ResultView from './ResultView'
import ScanningOverlay from './ScanningOverlay'

const SCAN_DURATION_MS = 3200

/** Generate a unique id for each saved scan. */
function createId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `scan-${Date.now()}`
}

/**
 * Main application shell: owns navigation state, the scanning flow and
 * the localStorage-backed scan history (features 1, 3).
 *
 * Flow: Home -> pick/capture image -> Scanning overlay ~3s -> ResultView.
 */
export default function AppShell() {
  const [activeTab, setActiveTab] = useState('home')
  const [scanning, setScanning] = useState(false)
  const [activeScan, setActiveScan] = useState(null)
  const [history, setHistory] = useLocalStorage('agriscan:history', [])

  const scanTimerRef = useRef(null)

  // Always clear the mock-analysis timer if the shell unmounts.
  useEffect(() => () => clearTimeout(scanTimerRef.current), [])

  /** Entry point for both "Take Photo" and "Upload Gallery". */
  const handleImage = useCallback(
    async (file) => {
      let thumbnail = null
      try {
        thumbnail = await fileToThumbnail(file)
      } catch {
        // Fall back to a blank leaf placeholder if the image can't be read.
      }

      setScanning(true)

      const diagnosis = getMockDiagnosis()
      const scan = {
        id: createId(),
        date: new Date().toISOString(),
        thumbnail,
        disease: diagnosis,
      }

      scanTimerRef.current = setTimeout(() => {
        setScanning(false)
        setHistory((prev) => [scan, ...prev]) // newest first
        setActiveScan(scan)
      }, SCAN_DURATION_MS)
    },
    [setHistory],
  )

  const openScan = useCallback((scan) => setActiveScan(scan), [])
  const closeScan = useCallback(() => setActiveScan(null), [])
  const clearHistory = useCallback(() => setHistory([]), [setHistory])

  return (
    <div className="min-h-dvh bg-white">
      <div className="mx-auto min-h-dvh w-full max-w-md">
        <Header />

        {scanning && <ScanningOverlay />}

        <main className="px-4 pt-4 pb-6">
          {activeScan ? (
            <ResultView
              scan={activeScan}
              onBack={closeScan}
              onScanAgain={() => {
                closeScan()
                setActiveTab('home')
              }}
            />
          ) : (
            <div key={activeTab} className="animate-fade-in">
              {activeTab === 'home' ? (
                <HomeDashboard
                  onImage={handleImage}
                  historyCount={history.length}
                />
              ) : (
                <HistoryView
                  history={history}
                  onOpen={openScan}
                  onClear={clearHistory}
                />
              )}
            </div>
          )}
        </main>

        {!activeScan && (
          <BottomNav
            active={activeTab}
            onChange={setActiveTab}
            onScan={() => setActiveTab('home')}
          />
        )}
      </div>
    </div>
  )
}