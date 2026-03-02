"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw } from "lucide-react"
import { usePopupFreeze } from "@/hooks/use-popup-freeze"

interface FloorPlanLightboxProps {
  propertyName: string
  floorPlans: string[]
  onClose: () => void
}

const MIN_SCALE = 1
const MAX_SCALE = 5
const ZOOM_STEP = 0.5

/**
 * Focused floor plan lightbox with per-floor page navigation
 * and zoom + pan for inspecting details.
 */
export function FloorPlanLightbox({
  propertyName,
  floorPlans,
  onClose,
}: FloorPlanLightboxProps) {
  usePopupFreeze(true)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Zoom / pan state
  const [scale, setScale] = useState(1)
  const [translate, setTranslate] = useState({ x: 0, y: 0 })
  const isDragging = useRef(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const translateStart = useRef({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null!)
  // Track pinch distance for mobile
  const lastPinchDist = useRef(0)

  const floorLabels = floorPlans.map((_, i) => {
    if (floorPlans.length === 1) return "Floor Plan"
    return `Floor ${i + 1}`
  })

  // Reset zoom when switching floors
  const resetZoom = useCallback(() => {
    setScale(1)
    setTranslate({ x: 0, y: 0 })
  }, [])

  const changeFloor = useCallback(
    (index: number) => {
      setCurrentIndex(index)
      resetZoom()
    },
    [resetZoom]
  )

  // Clamp translate so image stays reachable
  const clampTranslate = useCallback(
    (tx: number, ty: number, s: number) => {
      if (s <= 1) return { x: 0, y: 0 }
      const el = containerRef.current
      if (!el) return { x: tx, y: ty }
      const bounds = el.getBoundingClientRect()
      const maxX = ((s - 1) * bounds.width) / 2
      const maxY = ((s - 1) * bounds.height) / 2
      return {
        x: Math.max(-maxX, Math.min(maxX, tx)),
        y: Math.max(-maxY, Math.min(maxY, ty)),
      }
    },
    []
  )

  // Zoom toward a point (mouse position or center)
  const zoomAt = useCallback(
    (newScale: number, clientX: number, clientY: number) => {
      const clamped = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale))
      if (clamped === 1) {
        setScale(1)
        setTranslate({ x: 0, y: 0 })
        return
      }
      const el = containerRef.current
      if (!el) {
        setScale(clamped)
        return
      }
      const rect = el.getBoundingClientRect()
      const cx = clientX - rect.left - rect.width / 2
      const cy = clientY - rect.top - rect.height / 2

      setTranslate((prev) => {
        const ratio = clamped / scale
        const nx = cx - ratio * (cx - prev.x)
        const ny = cy - ratio * (cy - prev.y)
        return clampTranslate(nx, ny, clamped)
      })
      setScale(clamped)
    },
    [scale, clampTranslate]
  )

  // Mouse wheel zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault()
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP
      zoomAt(scale + delta, e.clientX, e.clientY)
    },
    [scale, zoomAt]
  )

  // Double-click: zoom in or reset
  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      if (scale > 1) {
        resetZoom()
      } else {
        zoomAt(2.5, e.clientX, e.clientY)
      }
    },
    [scale, resetZoom, zoomAt]
  )

  // Drag to pan (mouse)
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (scale <= 1) return
      isDragging.current = true
      dragStart.current = { x: e.clientX, y: e.clientY }
      translateStart.current = { ...translate }
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    },
    [scale, translate]
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging.current) return
      const dx = e.clientX - dragStart.current.x
      const dy = e.clientY - dragStart.current.y
      setTranslate(
        clampTranslate(
          translateStart.current.x + dx,
          translateStart.current.y + dy,
          scale
        )
      )
    },
    [scale, clampTranslate]
  )

  const handlePointerUp = useCallback(() => {
    isDragging.current = false
  }, [])

  // Touch pinch-to-zoom
  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault()
        const dx = e.touches[0].clientX - e.touches[1].clientX
        const dy = e.touches[0].clientY - e.touches[1].clientY
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (lastPinchDist.current > 0) {
          const delta = (dist - lastPinchDist.current) * 0.01
          const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2
          const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2
          zoomAt(scale + delta, midX, midY)
        }
        lastPinchDist.current = dist
      }
    },
    [scale, zoomAt]
  )

  const handleTouchEnd = useCallback(() => {
    lastPinchDist.current = 0
  }, [])

  // Button zoom controls
  const zoomIn = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    zoomAt(scale + ZOOM_STEP, rect.left + rect.width / 2, rect.top + rect.height / 2)
  }, [scale, zoomAt])

  const zoomOut = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    zoomAt(scale - ZOOM_STEP, rect.left + rect.width / 2, rect.top + rect.height / 2)
  }, [scale, zoomAt])

  // Keyboard: +/- to zoom, arrows to pan, Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (scale > 1) resetZoom()
        else onClose()
      }
      if (e.key === "=" || e.key === "+") zoomIn()
      if (e.key === "-") zoomOut()
      if (e.key === "0") resetZoom()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [scale, resetZoom, onClose, zoomIn, zoomOut])

  const isZoomed = scale > 1
  const zoomPercent = Math.round(scale * 100)

  return (
    <div
      data-popup-root
      className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-200"
      onClick={!isZoomed ? onClose : undefined}
    >
      {/* Header */}
      <div
        className="absolute top-0 left-0 right-0 z-10 px-6 py-4 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <h3 className="text-white font-serif text-lg">{propertyName}</h3>
          <p className="text-white/40 text-sm">
            {floorLabels[currentIndex]}
            {floorPlans.length > 1 && (
              <span className="ml-2 text-white/25">
                ({currentIndex + 1} of {floorPlans.length})
              </span>
            )}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          aria-label="Close floor plans"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Floor plan tabs (if multiple) */}
      {floorPlans.length > 1 && (
        <div
          className="absolute top-20 left-1/2 -translate-x-1/2 z-10 flex gap-1 bg-white/5 rounded-xl p-1"
          onClick={(e) => e.stopPropagation()}
        >
          {floorLabels.map((label, i) => (
            <button
              key={i}
              onClick={() => changeFloor(i)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                i === currentIndex
                  ? "bg-[#9D5F36] text-white"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Floor plan image — zoomable + pannable */}
      <div
        ref={containerRef}
        className="relative w-[90vw] h-[75vh] max-w-5xl overflow-hidden select-none"
        style={{ cursor: isZoomed ? "grab" : "zoom-in" }}
        onClick={(e) => e.stopPropagation()}
        onWheel={handleWheel}
        onDoubleClick={handleDoubleClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="relative w-full h-full transition-transform"
          style={{
            transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
            transitionDuration: isDragging.current ? "0ms" : "150ms",
          }}
        >
          <Image
            key={currentIndex}
            src={floorPlans[currentIndex]}
            alt={`${propertyName} - ${floorLabels[currentIndex]}`}
            fill
            className="object-contain pointer-events-none"
            unoptimized
            draggable={false}
            priority
          />
        </div>
      </div>

      {/* Zoom controls bar */}
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-full px-3 py-2"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={zoomOut}
          disabled={scale <= MIN_SCALE}
          className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:pointer-events-none"
          aria-label="Zoom out"
        >
          <ZoomOut className="h-4 w-4" />
        </button>

        <span className="text-white/50 text-xs font-medium min-w-[3.5rem] text-center tabular-nums">
          {zoomPercent}%
        </span>

        <button
          onClick={zoomIn}
          disabled={scale >= MAX_SCALE}
          className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:pointer-events-none"
          aria-label="Zoom in"
        >
          <ZoomIn className="h-4 w-4" />
        </button>

        {isZoomed && (
          <>
            <div className="w-px h-4 bg-white/15" />
            <button
              onClick={resetZoom}
              className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Reset zoom"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {/* Zoom hint (fades after first zoom) */}
      {!isZoomed && (
        <p className="absolute bottom-16 left-1/2 -translate-x-1/2 text-white/25 text-xs animate-pulse">
          Scroll or pinch to zoom &middot; Double-click to magnify
        </p>
      )}

      {/* Navigation arrows (if multiple) */}
      {floorPlans.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation()
              changeFloor(currentIndex === 0 ? floorPlans.length - 1 : currentIndex - 1)
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              changeFloor(currentIndex === floorPlans.length - 1 ? 0 : currentIndex + 1)
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}
    </div>
  )
}
