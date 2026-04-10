import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.BACKEND_URL || 'http://localhost:10402'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; fileType: string }> }
) {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('access_token')

  if (!accessToken) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { id, fileType } = await params

  try {
    const formData = await request.formData()
    
    const response = await fetch(
      `${API_BASE_URL}/api/applications/${id}/upload/${fileType}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken.value}`,
        },
        body: formData,
      }
    )

    if (!response.ok) {
      const error = await response.text()
      return new NextResponse(error, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Upload file error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
