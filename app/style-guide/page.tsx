"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function StyleGuidePage() {
    return (
        <div className="min-h-screen bg-background pt-24 pb-20 px-4 md:px-12">
            <div className="max-w-7xl mx-auto space-y-20">

                {/* Header */}
                <div className="text-center space-y-6">
                    <h1 className="text-5xl md:text-7xl font-serif text-foreground font-bold tracking-tight">
                        Brand Assets
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Extracted from Wilson Premier Properties Brand Guidelines.
                    </p>
                </div>

                {/* Typography Section */}
                <section className="space-y-8">
                    <h2 className="text-3xl font-serif text-primary border-b border-border pb-4">Typography</h2>

                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="space-y-6">
                            <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Heading Font (Playfair Display)</span>
                            <div className="space-y-4">
                                <h1 className="text-6xl font-serif">Heading 1</h1>
                                <h2 className="text-5xl font-serif">Heading 2</h2>
                                <h3 className="text-4xl font-serif">Heading 3</h3>
                                <h4 className="text-3xl font-serif">Heading 4</h4>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Body Font (Work Sans)</span>
                            <div className="space-y-4 font-sans">
                                <p className="text-4xl font-light">Body Large (Light)</p>
                                <p className="text-2xl">Body Medium (Regular)</p>
                                <p className="text-base text-muted-foreground">Body Small (Muted). Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                                <p className="font-semibold text-primary">Body Semibold (Primary)</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Colors Section */}
                <section className="space-y-8">
                    <h2 className="text-3xl font-serif text-primary border-b border-border pb-4">Color Palette</h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <ColorCard name="Linen (Background)" variable="var(--color-brand-linen)" hex="#ECE9E7" text="text-charcoal" />
                        <ColorCard name="Taupe (Secondary)" variable="var(--color-brand-taupe)" hex="#BCA28A" text="text-white" />
                        <ColorCard name="Rust (Primary)" variable="var(--color-brand-rust)" hex="#9D5F36" text="text-white" />
                        <ColorCard name="Charcoal (Foreground)" variable="var(--color-brand-charcoal)" hex="#2B2B2B" text="text-white" />
                        <ColorCard name="Ruby (Accent)" variable="var(--color-brand-ruby)" hex="#AD1D23" text="text-white" />
                        <ColorCard name="Navy (Brand)" variable="var(--color-brand-navy)" hex="#202B54" text="text-white" />
                        <ColorCard name="Forest (Brand)" variable="var(--color-brand-forest)" hex="#337D58" text="text-white" />
                    </div>
                </section>

                {/* Buttons & UI */}
                <section className="space-y-8">
                    <h2 className="text-3xl font-serif text-primary border-b border-border pb-4">UI Components</h2>

                    <div className="flex flex-wrap gap-6 items-center">
                        <Button size="lg" className="rounded-full px-8">Primary CTA</Button>
                        <Button size="lg" variant="secondary" className="rounded-full px-8">Secondary</Button>
                        <Button size="lg" variant="outline" className="rounded-full px-8">Outline</Button>
                        <Button size="lg" variant="ghost" className="rounded-full px-8">Ghost</Button>
                    </div>
                </section>

            </div>
        </div>
    )
}

function ColorCard({ name, variable, hex, text = "text-foreground" }: { name: string, variable: string, hex: string, text?: string }) {
    return (
        <div className="bg-card rounded-xl overflow-hidden shadow-lg border border-border">
            <div className="h-32 w-full flex items-center justify-center relative" style={{ backgroundColor: variable }}>
                <span className={`font-bold ${text} opacity-0 hover:opacity-100 transition-opacity`}>Aa</span>
            </div>
            <div className="p-4 space-y-1">
                <p className="font-semibold text-sm">{name}</p>
                <p className="text-xs text-muted-foreground uppercase">{hex}</p>
            </div>
        </div>
    )
}
