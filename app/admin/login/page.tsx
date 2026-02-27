"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      if (!res.ok) {
        setError("Invalid credentials")
        setLoading(false)
        return
      }

      const from = searchParams.get("from") || "/admin"
      router.push(from)
    } catch {
      setError("Something went wrong")
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-[#ECE9E7]/60 text-xs font-medium uppercase tracking-[0.1em] mb-2">
          Username
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-[#2B2B2B] border border-white/10 text-[#ECE9E7] placeholder-white/20 focus:border-[#9D5F36] focus:ring-1 focus:ring-[#9D5F36] outline-none transition-colors"
          placeholder="Username"
          required
        />
      </div>
      <div>
        <label className="block text-[#ECE9E7]/60 text-xs font-medium uppercase tracking-[0.1em] mb-2">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-[#2B2B2B] border border-white/10 text-[#ECE9E7] placeholder-white/20 focus:border-[#9D5F36] focus:ring-1 focus:ring-[#9D5F36] outline-none transition-colors"
          placeholder="Password"
          required
        />
      </div>

      {error && (
        <p className="text-red-400 text-sm text-center">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl bg-[#9D5F36] hover:bg-[#874E2B] text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </form>
  )
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#2B2B2B] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Image
            src="/brand/logo-icon-linen.png"
            alt="Wilson Premier"
            width={64}
            height={64}
            className="opacity-80"
          />
        </div>

        <div className="bg-[#363636] rounded-2xl p-8 border border-white/10 shadow-2xl">
          <h1 className="text-[#ECE9E7] font-serif text-2xl text-center mb-1">Admin Dashboard</h1>
          <p className="text-[#ECE9E7]/40 text-sm text-center mb-8">Wilson Premier Properties</p>

          <Suspense fallback={<div className="h-48" />}>
            <LoginForm />
          </Suspense>
        </div>

        <p className="text-[#ECE9E7]/20 text-xs text-center mt-6">
          Wilson Premier Properties Admin
        </p>
      </div>
    </div>
  )
}
