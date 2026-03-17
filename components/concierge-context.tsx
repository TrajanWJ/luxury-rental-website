"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import { slugifyPropertyName, trackPopupOpen } from "@/lib/analytics"

interface ConciergeContextType {
    isOpen: boolean
    openContactModal: (experienceName?: string) => void
    closeContactModal: () => void
    selectedExperience: string | null
}

const ConciergeContext = createContext<ConciergeContextType | undefined>(undefined)

export function ConciergeProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedExperience, setSelectedExperience] = useState<string | null>(null)

    const openContactModal = (experienceName?: string) => {
        setSelectedExperience(experienceName || null)
        setIsOpen(true)
        trackPopupOpen(
            "contact",
            experienceName
                ? {
                    popupName: "contact-modal",
                    propertyName: experienceName,
                    propertySlug: slugifyPropertyName(experienceName),
                  }
                : { popupName: "contact-modal" }
        )
    }

    const closeContactModal = () => {
        setIsOpen(false)
        setSelectedExperience(null)
    }

    return (
        <ConciergeContext.Provider value={{ isOpen, openContactModal, closeContactModal, selectedExperience }}>
            {children}
        </ConciergeContext.Provider>
    )
}

export function useConcierge() {
    const context = useContext(ConciergeContext)
    if (context === undefined) {
        throw new Error("useConcierge must be used within a ConciergeProvider")
    }
    return context
}
