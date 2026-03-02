"use client"

import { createContext, useContext, useState, ReactNode } from "react"

interface REContactContextType {
    isOpen: boolean
    openREContactModal: (propertyName?: string) => void
    closeREContactModal: () => void
    selectedProperty: string | null
}

const REContactContext = createContext<REContactContextType | undefined>(undefined)

export function REContactProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedProperty, setSelectedProperty] = useState<string | null>(null)

    const openREContactModal = (propertyName?: string) => {
        setSelectedProperty(propertyName || null)
        setIsOpen(true)
    }

    const closeREContactModal = () => {
        setIsOpen(false)
        setSelectedProperty(null)
    }

    return (
        <REContactContext.Provider value={{ isOpen, openREContactModal, closeREContactModal, selectedProperty }}>
            {children}
        </REContactContext.Provider>
    )
}

export function useREContact() {
    const context = useContext(REContactContext)
    if (context === undefined) {
        throw new Error("useREContact must be used within a REContactProvider")
    }
    return context
}
