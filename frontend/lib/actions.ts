'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:10402';

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: '로그인에 실패했습니다' }));
      return {
        success: false,
        error: error.detail || '로그인에 실패했습니다'
      }
    }

    const data = await response.json();

    // Set cookies
    const cookieStore = await cookies()
    cookieStore.set('access_token', data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 15, // 15 minutes
    })

    if (data.refresh_token) {
      cookieStore.set('refresh_token', data.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    }

    // Get user info to determine redirect path
    const userResponse = await fetch(`${BACKEND_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${data.access_token}`,
      },
    });

    const user = await userResponse.json();
    const redirectPath = user.role === 'ADMIN' ? '/admin' : '/main';

    return { success: true, redirectPath }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '로그인에 실패했습니다'
    }
  }
}

export async function registerAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string
  const department = formData.get('department') as string
  const position = formData.get('position') as string
  const phone = formData.get('phone') as string

  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        name,
        department: department || undefined,
        position: position || undefined,
        phone: phone || undefined,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Registration failed' }));
      return {
        success: false,
        error: error.detail || 'Registration failed'
      }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Registration failed'
    }
  }
}

export async function createApplicationAction(formData: FormData) {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('access_token')?.value

  if (!accessToken) {
    return {
      success: false,
      error: '로그인이 필요합니다',
    }
  }

  const status = (formData.get('status') as string | null) || 'SUBMITTED'

  try {
    const createResponse = await fetch(`${BACKEND_URL}/api/applications/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    })

    if (!createResponse.ok) {
      const error = await createResponse.json().catch(() => ({ detail: '신청서 제출에 실패했습니다' }))
      return {
        success: false,
        error: error.detail || '신청서 제출에 실패했습니다',
      }
    }

    const application = await createResponse.json()

    return {
      success: true,
      data: application,
      status,
    }
  } catch (error) {
    console.error('Create application action error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '신청서 제출에 실패했습니다',
    }
  }
}

export async function createAutomationRequestAction(formData: FormData) {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('access_token')?.value

  if (!accessToken) {
    return {
      success: false,
      error: '로그인이 필요합니다',
    }
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/automation-requests/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: '자동화 서비스 신청에 실패했습니다' }))
      return {
        success: false,
        error: error.detail || '자동화 서비스 신청에 실패했습니다',
      }
    }

    const automationRequest = await response.json()
    return {
      success: true,
      data: automationRequest,
    }
  } catch (error) {
    console.error('Create automation request action error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '자동화 서비스 신청에 실패했습니다',
    }
  }
}

export async function updateAutomationRequestAction(requestId: string, formData: FormData) {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('access_token')?.value

  if (!accessToken) {
    return {
      success: false,
      error: '로그인이 필요합니다',
    }
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/automation-requests/${requestId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: '자동화 서비스 수정에 실패했습니다' }))
      return {
        success: false,
        error: error.detail || '자동화 서비스 수정에 실패했습니다',
      }
    }

    const automationRequest = await response.json()
    return {
      success: true,
      data: automationRequest,
    }
  } catch (error) {
    console.error('Update automation request action error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '자동화 서비스 수정에 실패했습니다',
    }
  }
}

export async function updateUserAction(userId: string, data: Record<string, unknown>) {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('access_token')?.value

  if (!accessToken) {
    return {
      success: false,
      error: '로그인이 필요합니다',
    }
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/admin/users/${userId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: '사용자 정보 수정에 실패했습니다' }))
      return {
        success: false,
        error: error.detail || '사용자 정보 수정에 실패했습니다',
      }
    }

    const updatedUser = await response.json()
    return {
      success: true,
      data: updatedUser,
    }
  } catch (error) {
    console.error('Update user action error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '사용자 정보 수정에 실패했습니다',
    }
  }
}

export async function toggleUserActiveAction(userId: string) {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('access_token')?.value

  if (!accessToken) {
    return {
      success: false,
      error: '로그인이 필요합니다',
    }
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/admin/users/${userId}/toggle-active`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: '사용자 상태 변경에 실패했습니다' }))
      return {
        success: false,
        error: error.detail || '사용자 상태 변경에 실패했습니다',
      }
    }

    const updatedUser = await response.json()
    return {
      success: true,
      data: updatedUser,
    }
  } catch (error) {
    console.error('Toggle user active action error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '사용자 상태 변경에 실패했습니다',
    }
  }
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete('access_token')
  cookieStore.delete('refresh_token')
  redirect('/login')
}
