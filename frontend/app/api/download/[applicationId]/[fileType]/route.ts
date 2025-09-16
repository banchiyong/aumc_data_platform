import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { applicationId: string; fileType: string } }
) {
  const cookieStore = cookies()
  const accessToken = cookieStore.get('access_token')

  if (!accessToken) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const API_BASE_URL = process.env.BACKEND_URL || 'http://localhost:10402'
  const { applicationId, fileType } = params

  try {
    // 백엔드에서 파일 다운로드
    const response = await fetch(
      `${API_BASE_URL}/api/applications/${applicationId}/download/${fileType}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken.value}`,
        },
      }
    )

    if (!response.ok) {
      const error = await response.text()
      return new NextResponse(error, { status: response.status })
    }

    // 파일 데이터와 헤더를 클라이언트로 전달
    const fileBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'application/octet-stream'
    const contentDisposition = response.headers.get('content-disposition')

    const headers = new Headers({
      'Content-Type': contentType,
    })

    if (contentDisposition) {
      headers.set('Content-Disposition', contentDisposition)
    }

    return new NextResponse(fileBuffer, {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error('Download proxy error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}