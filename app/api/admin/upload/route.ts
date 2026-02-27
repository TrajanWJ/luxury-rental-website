import { NextRequest, NextResponse } from "next/server"

const UPLOAD_URL = `${process.env.MEDIA_BASE_URL}/upload.php`
const UPLOAD_SECRET = process.env.UPLOAD_SECRET!

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const property = formData.get("property") as string
  const files = formData.getAll("files") as File[]

  if (!property || files.length === 0) {
    return NextResponse.json({ error: "Missing property or files" }, { status: 400 })
  }

  // Forward to VPS PHP upload endpoint
  const vpsForm = new FormData()
  vpsForm.append("property", property)
  for (const file of files) {
    vpsForm.append("files[]", file)
  }

  const res = await fetch(UPLOAD_URL, {
    method: "POST",
    headers: { "X-Upload-Secret": UPLOAD_SECRET },
    body: vpsForm,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Upload failed" }))
    return NextResponse.json(err, { status: res.status })
  }

  const { urls } = await res.json()
  return NextResponse.json({ ok: true, urls })
}
