"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin, Send } from "lucide-react"
import Navigation from "@/components/navigation"

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        interest: "",
        message: ""
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        // TODO: Implement actual form submission to backend/email service
        console.log("Form submitted:", formData)

        // Simulate submission
        await new Promise(resolve => setTimeout(resolve, 1500))

        alert("Thank you for reaching out to Wilson Premier Properties. Our concierge team will review your plans and follow up with thoughtful, customized recommendations for your stay.")
        setFormData({ name: "", email: "", phone: "", interest: "", message: "" })
        setIsSubmitting(false)
    }

    return (
        <>
            <Navigation theme="light" />

            <main className="min-h-screen bg-[#ECE9E7]">
                {/* Hero Section */}
                <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-gradient-to-b from-[#2B2B2B] to-[#2B2B2B]/95 text-[#ECE9E7]">
                    <div className="container mx-auto px-6 md:px-12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="max-w-3xl mx-auto text-center"
                        >
                            <span className="text-[#BCA28A] text-xs font-bold uppercase tracking-[0.25em] mb-6 block">
                                We're Here to Help
                            </span>
                            <h1 className="text-5xl md:text-7xl font-serif font-medium mb-6 tracking-tight">
                                Plan Your Extraordinary Lake Stay
                            </h1>
                            <p className="text-lg md:text-xl text-[#ECE9E7]/80 leading-relaxed font-light mb-4">
                                From selecting the perfect residence to arranging curated experiences, our team is dedicated to ensuring every detail exceeds your expectations.
                            </p>
                            <p className="text-base md:text-lg text-[#BCA28A]/90 leading-relaxed font-light">
                                Reach out today, and we'll guide you through creating an unforgettable Smith Mountain Lake experience.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Lake Experiences Section */}
                <section className="py-20 md:py-28">
                    <div className="container mx-auto px-6 md:px-12 max-w-3xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-4xl md:text-5xl font-serif font-medium text-[#2B2B2B] mb-8 text-center tracking-tight">
                                Elevated Lake Experiences
                            </h2>
                            <div className="h-0.5 w-16 bg-[#9D5F36] mx-auto mb-12"></div>
                            <p className="text-lg md:text-xl text-[#2B2B2B]/80 leading-relaxed font-light mb-10 text-center">
                                From adrenaline-pumping water sports to serene vineyard tastings, discover the very best of Smith Mountain Lake. Wander from hidden coves to wide-open channels, detouring to trails, wineries, marinas, and dock-and-dine spots along the way—each turn of the lake revealing a new way to play, taste, and experience something unexpected.
                            </p>

                            <div className="grid md:grid-cols-2 gap-6 md:gap-8 bg-white border border-[#BCA28A]/30 rounded-2xl p-8 shadow-lg">
                                <div>
                                    <h3 className="text-xl font-serif font-medium text-[#2B2B2B] mb-4">Smith Mountain Lake</h3>
                                    <ul className="space-y-2 text-[#2B2B2B]/80">
                                        <li className="flex items-center gap-3">
                                            <div className="w-1 h-1 rounded-full bg-[#9D5F36]"></div>
                                            <span>Smith Mountain Lake Dam & Visitor Center</span>
                                        </li>
                                        <li className="flex items-center gap-3">
                                            <div className="w-1 h-1 rounded-full bg-[#9D5F36]"></div>
                                            <span>Hidden coves and waterways</span>
                                        </li>
                                        <li className="flex items-center gap-3">
                                            <div className="w-1 h-1 rounded-full bg-[#9D5F36]"></div>
                                            <span>Trails and marinas</span>
                                        </li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-xl font-serif font-medium text-[#2B2B2B] mb-4">Places to Visit</h3>
                                    <ul className="space-y-2 text-[#2B2B2B]/80">
                                        <li className="flex items-center gap-3">
                                            <div className="w-1 h-1 rounded-full bg-[#9D5F36]"></div>
                                            <span>Hickory Hill Vineyards</span>
                                        </li>
                                        <li className="flex items-center gap-3">
                                            <div className="w-1 h-1 rounded-full bg-[#9D5F36]"></div>
                                            <span>Booker T. Washington National Monument</span>
                                        </li>
                                        <li className="flex items-center gap-3">
                                            <div className="w-1 h-1 rounded-full bg-[#9D5F36]"></div>
                                            <span>SML Farm Alpacas</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Divider */}
                <div className="container mx-auto px-6 md:px-12">
                    <div className="h-px bg-gradient-to-r from-transparent via-[#BCA28A]/40 to-transparent"></div>
                </div>

                {/* Contact Cards & Form Section */}
                <section className="py-20 md:py-28">
                    <div className="container mx-auto px-6 md:px-12 max-w-6xl">

                        {/* Contact Cards */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="grid md:grid-cols-2 gap-6 mb-16"
                        >
                            {/* Phone Card */}
                            <div className="bg-white border border-[#BCA28A]/30 rounded-2xl p-8 hover:border-[#9D5F36] transition-all duration-300 hover:shadow-lg">
                                <div className="w-12 h-12 rounded-full bg-[#9D5F36]/10 flex items-center justify-center mb-4">
                                    <Phone className="h-6 w-6 text-[#9D5F36]" />
                                </div>
                                <h3 className="text-lg font-serif font-medium text-[#2B2B2B] mb-2">Call Us</h3>
                                <p className="text-[#2B2B2B]/70 text-sm">
                                    {/* TODO: Add actual phone number */}
                                    (XXX) XXX-XXXX
                                </p>
                            </div>

                            {/* Location Card */}
                            <div className="bg-white border border-[#BCA28A]/30 rounded-2xl p-8 hover:border-[#9D5F36] transition-all duration-300 hover:shadow-lg">
                                <div className="w-12 h-12 rounded-full bg-[#9D5F36]/10 flex items-center justify-center mb-4">
                                    <MapPin className="h-6 w-6 text-[#9D5F36]" />
                                </div>
                                <h3 className="text-lg font-serif font-medium text-[#2B2B2B] mb-2">Visit Us</h3>
                                <p className="text-[#2B2B2B]/70 text-sm">
                                    Smith Mountain Lake<br />
                                    Virginia
                                    {/* TODO: Add actual office address if available */}
                                </p>
                            </div>
                        </motion.div>

                        {/* Contact Form */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="bg-white border border-[#BCA28A]/30 rounded-3xl p-8 md:p-12 shadow-xl"
                        >
                            <div className="max-w-2xl mx-auto">
                                <h2 className="text-3xl md:text-4xl font-serif font-medium text-[#2B2B2B] mb-4 text-center">
                                    Send Us a Message
                                </h2>
                                <p className="text-[#2B2B2B]/70 text-center mb-6 leading-relaxed">
                                    Share your vision for the perfect lake retreat, and we'll make it a reality.
                                </p>
                                <p className="text-sm text-[#9D5F36] text-center mb-10 leading-relaxed font-medium">
                                    Your message goes straight to our concierge team.
                                </p>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-[#2B2B2B] mb-2">
                                                Name *
                                            </label>
                                            <Input
                                                id="name"
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="h-12 border-[#BCA28A]/40 focus:border-[#9D5F36] focus:ring-[#9D5F36] rounded-xl"
                                                placeholder="Your name"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-[#2B2B2B] mb-2">
                                                Email *
                                            </label>
                                            <Input
                                                id="email"
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="h-12 border-[#BCA28A]/40 focus:border-[#9D5F36] focus:ring-[#9D5F36] rounded-xl"
                                                placeholder="your@email.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="phone" className="block text-sm font-medium text-[#2B2B2B] mb-2">
                                                Phone (Optional)
                                            </label>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="h-12 border-[#BCA28A]/40 focus:border-[#9D5F36] focus:ring-[#9D5F36] rounded-xl"
                                                placeholder="(XXX) XXX-XXXX"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="interest" className="block text-sm font-medium text-[#2B2B2B] mb-2">
                                                Area of Interest
                                            </label>
                                            <select
                                                id="interest"
                                                value={formData.interest}
                                                onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                                                className="h-12 w-full border border-[#BCA28A]/40 focus:border-[#9D5F36] focus:ring-[#9D5F36] rounded-xl px-4 bg-white text-[#2B2B2B]"
                                            >
                                                <option value="">Select an option</option>
                                                <option value="reunion-homes">Reunion Homes</option>
                                                <option value="resort">Milan at Waters Edge Resort</option>
                                                <option value="community">Community Properties</option>
                                                <option value="experiences">Lake Experiences</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="message" className="block text-sm font-medium text-[#2B2B2B] mb-2">
                                            Message *
                                        </label>
                                        <Textarea
                                            id="message"
                                            required
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            className="min-h-[150px] border-[#BCA28A]/40 focus:border-[#9D5F36] focus:ring-[#9D5F36] rounded-xl resize-none"
                                            placeholder="Tell us about your ideal lake experience..."
                                        />
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                        <Button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="flex-1 h-14 bg-[#9D5F36] hover:bg-[#9D5F36]/90 text-white rounded-xl font-medium text-base transition-all duration-300 hover:shadow-lg disabled:opacity-50"
                                        >
                                            {isSubmitting ? (
                                                "Sending..."
                                            ) : (
                                                <>
                                                    <Send className="h-5 w-5 mr-2" />
                                                    Send Message
                                                </>
                                            )}
                                        </Button>
                                        <a
                                            href="mailto:angela@wilson-premier.com"
                                            className="flex-1 h-14 flex items-center justify-center border-2 border-[#9D5F36] text-[#9D5F36] hover:bg-[#9D5F36] hover:text-white rounded-xl font-medium text-base transition-all duration-300"
                                        >
                                            <Mail className="h-5 w-5 mr-2" />
                                            Email Our Team
                                        </a>
                                    </div>
                                </form>
                            </div>
                        </motion.div>

                    </div>
                </section>

                {/* Divider */}
                <div className="container mx-auto px-6 md:px-12">
                    <div className="h-px bg-gradient-to-r from-transparent via-[#BCA28A]/40 to-transparent"></div>
                </div>

                {/* Additional Info Section */}
                <section className="py-20 md:py-28">
                    <div className="container mx-auto px-6 md:px-12 max-w-4xl text-center">
                        <h3 className="text-2xl md:text-3xl font-serif font-medium text-[#2B2B2B] mb-6">
                            What Happens Next?
                        </h3>
                        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
                            <div>
                                <div className="w-10 h-10 rounded-full bg-[#9D5F36] text-white flex items-center justify-center mx-auto mb-4 font-serif font-medium">
                                    1
                                </div>
                                <h4 className="font-medium text-[#2B2B2B] mb-2">We Respond</h4>
                                <p className="text-sm text-[#2B2B2B]/70 leading-relaxed">
                                    Our team will reach out within 24 hours to understand your needs.
                                </p>
                            </div>
                            <div>
                                <div className="w-10 h-10 rounded-full bg-[#9D5F36] text-white flex items-center justify-center mx-auto mb-4 font-serif font-medium">
                                    2
                                </div>
                                <h4 className="font-medium text-[#2B2B2B] mb-2">We Curate</h4>
                                <p className="text-sm text-[#2B2B2B]/70 leading-relaxed">
                                    We'll recommend the perfect residence and experiences for your stay.
                                </p>
                            </div>
                            <div>
                                <div className="w-10 h-10 rounded-full bg-[#9D5F36] text-white flex items-center justify-center mx-auto mb-4 font-serif font-medium">
                                    3
                                </div>
                                <h4 className="font-medium text-[#2B2B2B] mb-2">You Relax</h4>
                                <p className="text-sm text-[#2B2B2B]/70 leading-relaxed">
                                    We handle every detail so you can simply enjoy the extraordinary.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    )
}
