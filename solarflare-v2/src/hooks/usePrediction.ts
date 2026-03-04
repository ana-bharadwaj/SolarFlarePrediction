import { useState, useEffect, useCallback, useRef } from 'react'
import type { PredictionResponse, SharpFeatures } from '../types'
import { fetchPrediction, fetchDemo, fetchStatus } from '../api/client'

// Generates a plausible 40-step feature window for demo/dev use.
// In production, replace with real JSOC SHARP data for the active region.
function generateDemoWindow(): SharpFeatures[] {
  const window: SharpFeatures[] = []
  let flux = 3e-6
  for (let i = 0; i < 40; i++) {
    flux = Math.max(1e-8, flux * (1 + (Math.random() - 0.47) * 0.2))
    const USFLUX   = 1.8e22 * (1 + Math.random() * 0.1)
    const MEANGBT  = 19 + Math.random() * 4
    const MEANGBZ  = 15 + Math.random() * 3
    const MEANGBH  = 17 + Math.random() * 3
    const SHRGT45  = 0.28 + Math.random() * 0.04
    const R_VALUE  = 1.4e21 * (1 + Math.random() * 0.05)
    const TOTUSJZ  = 4.5e13 * (1 + Math.random() * 0.1)
    const MEANALP  = 0.005 + Math.random() * 0.002
    const MEANPOT  = 22 + Math.random() * 3
    window.push({
      xray_flux:        flux,
      USFLUX,
      MEANGBT,
      MEANGBZ,
      MEANGBH,
      MEANJZD:          -2 + Math.random() * 4,
      TOTUSJZ,
      MEANALP,
      MEANPOT,
      SHRGT45,
      R_VALUE,
      AREA_ACR:         680 * (1 + Math.random() * 0.05),
      pil_strength:     R_VALUE * SHRGT45,
      free_energy:      MEANPOT * USFLUX,
      current_helicity: MEANALP * TOTUSJZ,
      gradient_index:   (MEANGBT + MEANGBZ + MEANGBH) / 3,
      mag_class:        2,   // β
    })
  }
  return window
}

export type ConnectionState = 'connecting' | 'live' | 'demo' | 'error'

export interface PredictionState {
  prediction:      PredictionResponse | null
  connectionState: ConnectionState
  modelLoaded:     boolean
  lastFetch:       Date | null
  error:           string | null
  isRefreshing:    boolean
  refresh:         () => void
  setLive:         (live: boolean) => void
  isLive:          boolean
}

export function usePrediction(pollMs = 10_000): PredictionState {
  const [prediction,      setPrediction]      = useState<PredictionResponse | null>(null)
  const [connectionState, setConnectionState] = useState<ConnectionState>('connecting')
  const [modelLoaded,     setModelLoaded]     = useState(false)
  const [lastFetch,       setLastFetch]       = useState<Date | null>(null)
  const [error,           setError]           = useState<string | null>(null)
  const [isRefreshing,    setIsRefreshing]    = useState(false)
  const [isLive,          setIsLive]          = useState(true)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const doFetch = useCallback(async () => {
    setIsRefreshing(true)
    setError(null)
    try {
      // 1. Check if Flask server is reachable
      const status = await fetchStatus().catch(() => null)

      if (status) {
        setModelLoaded(status.model_loaded)
        // 2a. Server is up — send feature window, get real predictions
        const window = generateDemoWindow()   // ← swap for real JSOC data
        const result = await fetchPrediction(window)
        setPrediction(result)
        setConnectionState('live')
      } else {
        // 2b. Server unreachable — fall back to /api/demo
        const result = await fetchDemo().catch(() => null)
        if (result) {
          setPrediction(result)
          setConnectionState('demo')
          setModelLoaded(false)
        } else {
          throw new Error('Both Flask server and demo endpoint unreachable')
        }
      }
      setLastFetch(new Date())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
      setConnectionState('error')
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => { doFetch() }, [doFetch])

  // Poll
  useEffect(() => {
    if (!isLive) { if (timerRef.current) clearInterval(timerRef.current); return }
    timerRef.current = setInterval(doFetch, pollMs)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [isLive, pollMs, doFetch])

  return {
    prediction, connectionState, modelLoaded,
    lastFetch, error, isRefreshing, isLive,
    refresh: doFetch,
    setLive: setIsLive,
  }
}
