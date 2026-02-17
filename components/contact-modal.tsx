"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Mail, Phone, User, MessageSquare, Send, CheckCircle2 } from "lucide-react"
import { useConcierge } from "./concierge-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export function ContactModal() {
    const { isOpen, closeContactModal, selectedExperience } = useConcierge()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        message: ""
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        // Simulating form submission
        // In a real app, this would be a fetch call to an API endpoint
        // TODO: Plug in real back-end endpoint for form submission
        await new Promise(resolve => setTimeout(resolve, 1500))

        setIsSubmitting(false)
        setIsSuccess(true)

        // Close modal after showing success message
        setTimeout(() => {
            closeContactModal()
            // Reset success state after modal closes
            setTimeout(() => {
                setIsSuccess(false)
                setFormData({ name: "", email: "", phone: "", message: "" })
            }, 300)
        }, 2000)
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-6 text-[#2B2B2B]">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeContactModal}
                        className="absolute inset-0 bg-black/40 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg bg-[#ECE9E7] rounded-[32px] overflow-hidden shadow-2xl"
                    >
                        <button
                            onClick={closeContactModal}
                            className="absolute top-6 right-6 z-10 h-10 w-10 rounded-full bg-white/40 hover:bg-white/60 backdrop-blur-md flex items-center justify-center text-[#2B2B2B] transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="p-8 md:p-12">
                            {isSuccess ? (
                                <div className="py-12 text-center space-y-6">
                                    <div className="flex justify-center">
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", damping: 12, stiffness: 200 }}
                                        >
                                            <CheckCircle2 className="h-20 w-20 text-[#9D5F36]" />
                                        </motion.div>
                                    </div>
                                    <h2 className="text-3xl font-serif font-medium text-[#2B2B2B]">Message Sent</h2>
                                    <p className="text-[#2B2B2B]/70 font-light">
                                        Thank you for reaching out. Our concierge team will contact you shortly.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-8">
                                        <span className="text-[#BCA28A] text-[10px] font-bold uppercase tracking-[0.2em] mb-3 block">
                                            Personal Concierge
                                        </span>
                                        <h2 className="text-3xl md:text-4xl font-serif font-medium text-[#2B2B2B] leading-tight">
                                            Contact Us
                                        </h2>
                                        <p className="text-[#2B2B2B]/60 text-sm font-light mt-3 leading-relaxed">
                                            Have questions about your stay or a specific experience? We're here to help.
                                        </p>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        {selectedExperience && (
                                            <div className="p-4 bg-[#BCA28A]/10 border border-[#BCA28A]/20 rounded-2xl mb-6">
                                                <p className="text-[10px] font-bold uppercase tracking-wider text-[#BCA28A] mb-1">Inquiring about</p>
                                                <p className="text-sm font-medium text-[#2B2B2B]">{selectedExperience}</p>
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-[#2B2B2B]/60 ml-1">Name</Label>
                                            <div className="relative">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#BCA28A]" />
                                                <Input
                                                    id="name"
                                                    required
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    className="bg-white/50 border-[#BCA28A]/20 h-12 pl-12 rounded-xl focus:bg-white transition-all shadow-none"
                                                    placeholder="Enter your name"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-[#2B2B2B]/60 ml-1">Email</Label>
                                                <div className="relative">
                                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#BCA28A]" />
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        required
                                                        value={formData.email}
                                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                        className="bg-white/50 border-[#BCA28A]/20 h-12 pl-12 rounded-xl focus:bg-white transition-all shadow-none"
                                                        placeholder="email@example.com"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="phone" className="text-[10px] font-bold uppercase tracking-widest text-[#2B2B2B]/60 ml-1">Phone (Optional)</Label>
                                                <div className="relative">
                                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#BCA28A]" />
                                                    <Input
                                                        id="phone"
                                                        value={formData.phone}
                                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                        className="bg-white/50 border-[#BCA28A]/20 h-12 pl-12 rounded-xl focus:bg-white transition-all shadow-none"
                                                        placeholder="(555) 000-0000"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="message" className="text-[10px] font-bold uppercase tracking-widest text-[#2B2B2B]/60 ml-1">Message</Label>
                                            <div className="relative">
                                                <MessageSquare className="absolute left-4 top-4 h-4 w-4 text-[#BCA28A]" />
                                                <Textarea
                                                    id="message"
                                                    required
                                                    value={formData.message}
                                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                                    rows={4}
                                                    className="bg-white/50 border-[#BCA28A]/20 pl-12 pt-3.5 rounded-xl focus:bg-white transition-all shadow-none resize-none"
                                                    placeholder="How can we assist you?"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-4 pt-4">
                                            <Button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="bg-[#463930] text-[#ECE9E7] hover:bg-[#2B2B2B] h-14 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 shadow-lg"
                                            >
                                                {isSubmitting ? "Sending..." : (
                                                    <>
                                                        Send Message
                                                        <Send className="h-3.5 w-3.5" />
                                                    </>
                                                )}
                                            </Button>

                                            <div className="text-center">
                                                <a
                                                    href="mailto:angela@wilson-premier.com"
                                                    className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#BCA28A] hover:text-[#9D5F36] transition-colors inline-flex items-center gap-2"
                                                >
                                                    Email Concierge Directly
                                                    <ArrowRight className="h-3 w-3" />
                                                </a>
                                            </div>

                                            <div className="text-center pt-2">
                                                <a
                                                    href="/contact"
                                                    className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#2B2B2B]/40 hover:text-[#2B2B2B]/60 transition-colors border-b border-[#2B2B2B]/10 hover:border-[#2B2B2B]/30 pb-0.5"
                                                >
                                                    Go to Full Contact Page
                                                </a>
                                            </div>
                                        </div>
                                    </form>
                                </>
                            )}
                        </div>
                    </motion.div>
                </div >
            )
            }
        </AnimatePresence >
    )
}

function ArrowRight(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
        </svg>
    )
}
