"use client"

import { motion } from "framer-motion"
import Navigation from "@/components/navigation"
import FooterCTA from "@/components/footer-cta"
import { FileText, Download } from "lucide-react"

export default function HouseRulesPage() {
    return (
        <main className="min-h-screen" style={{ backgroundColor: "#EAE8E4" }}>
            <Navigation theme="light" />

            {/* Hero */}
            <section className="pt-32 pb-12 px-6 md:px-12">
                <div className="container mx-auto max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center"
                    >
                        <span className="text-[#BCA28A] text-xs font-bold uppercase tracking-[0.25em] mb-4 block font-serif">
                            Guest Information
                        </span>
                        <h1 className="text-5xl md:text-7xl font-serif font-medium text-[#1C1C1C] leading-[0.95] mb-6">
                            House Rules &<br />
                            <span className="italic">Rental Agreement</span>
                        </h1>
                        <p className="text-lg md:text-xl font-light text-[#8C8984] max-w-2xl mx-auto leading-relaxed">
                            Please review our vacation rental agreement and house rules before your stay. These guidelines ensure a safe and enjoyable experience for all guests.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* PDF Download + Embed */}
            <section className="pb-24 px-6 md:px-12">
                <div className="container mx-auto max-w-5xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        {/* Download Bar */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-white rounded-2xl p-6 shadow-sm border border-[#BCA28A]/10">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-[#463930]/10 flex items-center justify-center">
                                    <FileText className="h-6 w-6 text-[#463930]" />
                                </div>
                                <div>
                                    <p className="font-serif font-medium text-[#1C1C1C]">Vacation Rental Agreement</p>
                                    <p className="text-sm text-[#8C8984] font-light">Wilson Premier Properties, LLC</p>
                                </div>
                            </div>
                            <a
                                href="/rental-agreement.pdf"
                                download
                                className="inline-flex items-center gap-2 bg-[#463930] text-[#ECE9E7] px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-[#2B2B2B] transition-all shadow-lg"
                            >
                                <Download className="h-4 w-4" />
                                Download PDF
                            </a>
                        </div>

                        {/* Embedded PDF */}
                        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#BCA28A]/10">
                            <iframe
                                src="/rental-agreement.pdf"
                                className="w-full h-[80vh] md:h-[85vh]"
                                title="Wilson Premier Vacation Rental Agreement"
                            />
                        </div>
                    </motion.div>
                </div>
            </section>

            <FooterCTA />
        </main>
    )
}
