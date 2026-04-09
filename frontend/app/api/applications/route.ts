import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.BACKEND_URL || 'http://localhost:10402'

export async function POST(request: NextRequest) {
  const cookieStore = cookies()
  const accessToken = cookieStore.get('access_token')

  if (!accessToken) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const contentType = request.headers.get('content-type') || ''
    const isMultipart = contentType.includes('multipart/form-data')
    const body = isMultipart ? await request.formData() : await request.json()

    const response = await fetch(`${API_BASE_URL}/api/applications/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken.value}`,
        ...(isMultipart ? {} : { 'Content-Type': 'application/json' }),
      },
      body: isMultipart ? body : JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.text()
      return new NextResponse(error, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Create application error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
