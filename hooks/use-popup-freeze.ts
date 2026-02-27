"use client"

import { useEffect } from "react"

let popupFreezeCount = 0

export function usePopupFreeze(active: boolean) {
  useEffect(() => {
    if (!active || typeof document === "undefined") return

    popupFreezeCount += 1
    document.documentElement.classList.add("popup-active")
    document.body.classList.add("popup-active")

    return () => {
      popupFreezeCount = Math.max(0, popupFreezeCount - 1)
      if (popupFreezeCount === 0) {
        document.documentElement.classList.remove("popup-active")
        document.body.classList.remove("popup-active")
      }
    }
  }, [active])
}

