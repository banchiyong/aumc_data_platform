import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.BACKEND_URL || 'http://localhost:10402'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; fileType: string } }
) {
  const cookieStore = cookies()
  const accessToken = cookieStore.get('access_token')

  if (!accessToken) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/applications/${params.id}/delete-file/${params.fileType}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken.value}`,
        },
      }
    )

    if (!response.ok) {
      const error = await response.text()
      return new NextResponse(error, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Delete file error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}