"use client"

import { useState } from "react"
import { useDemo } from "@/components/demo-context"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { FlaskConical, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function DemoToggle() {
    const { isDemoMode, toggleDemoMode } = useDemo()
    const [isCollapsed, setIsCollapsed] = useState(false)

    return (
        <div className={`fixed top-24 left-4 z-50 flex items-center gap-3 bg-white/90 backdrop-blur-md p-3 rounded-xl border border-slate-200 shadow-xl transition-all duration-300 ${isCollapsed ? 'w-auto' : ''}`}>
            <div className={`p-2 rounded-lg ${isDemoMode ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                <FlaskConical className="h-5 w-5" />
            </div>

            {!isCollapsed && (
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <Label htmlFor="demo-mode" className="font-semibold text-sm cursor-pointer">Demo Mode</Label>
                        <Switch
                            id="demo-mode"
                            checked={isDemoMode}
                            onCheckedChange={toggleDemoMode}
                        />
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium mt-0.5">
                        {isDemoMode ? "Showing All Properties" : "Connected Only"}
                    </span>
                </div>
            )}

            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-slate-100 transition-colors"
                onClick={() => setIsCollapsed(!isCollapsed)}
            >
                {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
        </div>
    )
}
