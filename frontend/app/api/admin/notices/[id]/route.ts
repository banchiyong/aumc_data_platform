import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.BACKEND_URL || 'http://localhost:10402'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('access_token')

  if (!accessToken) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { id } = await params

  try {
    const body = await request.json()
    const response = await fetch(`${API_BASE_URL}/api/notices/admin/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken.value}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.text()
      return new NextResponse(error, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Admin notice update proxy error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('access_token')

  if (!accessToken) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { id } = await params

  try {
    const response = await fetch(`${API_BASE_URL}/api/notices/admin/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken.value}`,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      return new NextResponse(error, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Admin notice delete proxy error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
