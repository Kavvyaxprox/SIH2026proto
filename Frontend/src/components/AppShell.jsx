import { useCallback, useEffect, useRef, useState } from "react"
import { useConnectivity } from "../hooks/useConnectivity"
import { runDiagnosis } from "../services/diagnosis"
import { db } from "../services/db"
import { loadSampleFile } from "../services/demoSamples"
import {
  syncNow,
  getPendingDiagnoses,
  saveDiagnosis,
  checkModelVersion,
} from "../services/syncEngine"
import { fileToThumbnail } from "../lib/thumbnail"
import BottomNav from "./BottomNav"
import Header from "./Header"
import HistoryView from "./HistoryView"
import HomeDashboard from "./HomeDashboard"
import ResultView from "./ResultView"
import ScanningOverlay from "./ScanningOverlay"
import SyncCenter from "./SyncCenter"
import AboutView from "./AboutView"

/**
 * Main farmer shell: owns navigation, the real on-device scan pipeline,
 * local IndexedDB history and the background sync engine.
 */
export default function AppShell({ onOpenOfficer, onOpenDemo }) {
  const [activeTab, setActiveTab] = useState("home")
  const [scanning, setScanning] = useState(false)
  const [activeScan, setActiveScan] = useState(null)
  const [scanFailure, setScanFailure] = useState(null)
  const [activeTabKey, setActiveTabKey] = useState(0)
  const [history, setHistory] = useState([])
  const [pendingCount, setPendingCount] = useState(0)

  const [overlayStep, setOverlayStep] = useState(0)
  const [overlayDoneSteps, setOverlayDoneSteps] = useState([])
  const [overlayQualityFailed, setOverlayQualityFailed] = useState(null)
  const [overlayImage, setOverlayImage] = useState(null)

  const { isOnline } = useConnectivity()
  const pendingRef = useRef(0)
  const syncRunningRef = useRef(false)
  const cancelledRef = useRef(false)

  const refreshSyncMeta = useCallback(async () => {
    const pending = await getPendingDiagnoses().catch(() => [])
    pendingRef.current = pending.length
    setPendingCount(pending.length)
  }, [])

  const reloadHistory = useCallback(async () => {
    const all = await db.getAll("diagnoses").catch(() => [])
    setHistory(all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
  }, [])

  // Load local history + sync meta on mount.
  useEffect(() => {
    let active = true
    ;(async () => {
      const all = await db.getAll("diagnoses").catch(() => [])
      if (active) {
        setHistory(all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
      }
      await refreshSyncMeta()
    })()
    return () => {
      active = false
    }
  }, [refreshSyncMeta])

  // Automatic sync when connectivity returns.
  useEffect(() => {
    if (!isOnline) return
    const run = async () => {
      if (syncRunningRef.current) return
      syncRunningRef.current = true
      try {
        if (pendingRef.current > 0) {
          await syncNow()
          await refreshSyncMeta()
          await reloadHistory()
        }
        await checkModelVersion(true)
      } catch {
        /* next online event retries */
      } finally {
        syncRunningRef.current = false
      }
    }
    // Slight delay so the online event settles.
    const timer = setTimeout(run, 800)
    return () => clearTimeout(timer)
  }, [isOnline, refreshSyncMeta, reloadHistory])

  const bumpStep = useCallback((stepId) => {
    const index = ["quality", "detection", "severity", "environment", "recommendation"].indexOf(stepId)
    if (index < 0) return
    setOverlayStep(Math.max(index, 0))
    setOverlayDoneSteps((prev) => {
      const prior = index === 0 ? 0 : index
      const nextSet = new Set(prev)
      for (let i = 0; i < prior; i += 1) nextSet.add(i)
      return [...nextSet]
    })
  }, [])

  /** Entry point for camera / gallery / demo-sample images. */
  const handleImage = useCallback(
    async (file, opts = {}) => {
      cancelledRef.current = false
      setScanFailure(null)
      setActiveScan(null)
      setOverlayStep(0)
      setOverlayDoneSteps([])
      setOverlayQualityFailed(null)

      let previewSrc = null
      try {
        previewSrc = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onerror = () => reject(new Error("preview"))
          reader.onload = () => resolve(reader.result)
          reader.readAsDataURL(file)
        })
        setOverlayImage({ src: previewSrc, alt: "Uploaded leaf" })
      } catch {
        /* preview is optional */
      }

      setScanning(true)
      try {
        const diagnosis = await runDiagnosis({
          file,
          context: { online: navigator.onLine, ...opts.location },
          onStep: bumpStep,
        })

        if (cancelledRef.current) return

        if (!diagnosis.ok) {
          setOverlayQualityFailed(diagnosis.quality?.code ?? "blurry")
          await new Promise((r) => setTimeout(r, 1400))
          setScanning(false)
          setScanFailure({ type: "quality", quality: diagnosis.quality, message: diagnosis.message })
          setOverlayQualityFailed(null)
          return
        }

        // Compute a lightweight thumbnail for the local history.
        let thumbnail = null
        try {
          thumbnail = await fileToThumbnail(file)
        } catch {
          /* fall back to blank placeholder */
        }

        const saved = {
          ...diagnosis,
          thumbnail,
          isDemoSample: !!opts.isDemoSample,
          location: opts.location ?? null,
        }

        // Persist locally FIRST (offline-first) — always pending.
        await saveDiagnosis(saved)
        await refreshSyncMeta()
        setHistory((prev) => [saved, ...prev])

        // If online, try to sync right away; keep it non-blocking.
        if (navigator.onLine) {
          try {
            await syncNow()
            await refreshSyncMeta()
            await reloadHistory()
          } catch {
            /* stays pending for the next sync */
          }
        }

        setScanning(false)
        setActiveScan(saved)
      } catch (error) {
        if (cancelledRef.current) return
        setScanning(false)
        setScanFailure({
          type: "model_failed",
          message: error?.message ?? "Unknown error",
        })
      }
    },
    [bumpStep, refreshSyncMeta, reloadHistory],
  )

  const openScan = useCallback((scan) => {
    setScanFailure(null)
    setActiveScan(scan)
  }, [])

  const closeScan = useCallback(() => {
    setScanFailure(null)
    setActiveScan(null)
  }, [])

  const clearHistory = useCallback(async () => {
    await db.clear("diagnoses")
    setHistory([])
    setPendingCount(0)
    pendingRef.current = 0
  }, [])

  const handleDemoSample = useCallback(
    async (sample) => {
      let file
      try {
        file = await loadSampleFile(sample)
      } catch {
        return
      }
      await handleImage(file, { isDemoSample: true })
    },
    [handleImage],
  )

  const onImportedHistory = useCallback((records) => {
    setHistory(records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
  }, [])

  const scannedView = activeScan || scanFailure ? (
    <ResultView
      scan={activeScan}
      failure={scanFailure}
      onBack={closeScan}
      onScanAgain={() => {
        closeScan()
        setActiveTab("home")
        setActiveTabKey((k) => k + 1)
      }}
    />
  ) : (
    <div key={activeTabKey} className="animate-fade-in">
      {activeTab === "home" && (
        <HomeDashboard
          onImage={handleImage}
          onDemoSample={handleDemoSample}
          historyCount={history.length}
          pendingCount={pendingCount}
          online={isOnline}
        />
      )}
      {activeTab === "history" && (
        <HistoryView
          history={history}
          onOpen={openScan}
          onClear={clearHistory}
          onImportedHistory={onImportedHistory}
        />
      )}
      {activeTab === "sync" && (
        <SyncCenter
          pendingCount={pendingCount}
          onSynced={() => {
            refreshSyncMeta()
            reloadHistory()
          }}
        />
      )}
      {activeTab === "about" && <AboutView onOpenDemo={onOpenDemo} />}
    </div>
  )

  return (
    <div className="min-h-dvh bg-white">
      <div className="mx-auto min-h-dvh w-full max-w-md">
        <Header onOpenOfficer={onOpenOfficer} />

        {scanning && (
          <ScanningOverlay
            currentStep={overlayStep}
            completedSteps={overlayDoneSteps}
            qualityFailed={overlayQualityFailed}
            image={overlayImage?.src ? overlayImage : null}
          />
        )}

        <main className="px-4 pt-4 pb-6">{scannedView}</main>

        {!activeScan && !scanFailure && !scanning && (
          <BottomNav
            active={activeTab}
            onChange={setActiveTab}
            onScan={() => {
              setActiveTab("home")
              setActiveTabKey((k) => k + 1)
            }}
            pendingCount={pendingCount}
          />
        )}
      </div>
    </div>
  )
}