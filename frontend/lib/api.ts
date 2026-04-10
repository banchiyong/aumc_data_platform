import { cookies } from 'next/headers';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:10402';

interface ApiOptions extends RequestInit {
  auth?: boolean;
}

function withQuery(endpoint: string, params?: Record<string, string | number | boolean | undefined>) {
  if (!params) return endpoint

  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value))
    }
  })

  return query.toString() ? `${endpoint}?${query.toString()}` : endpoint
}

async function fetchAPI(endpoint: string, options: ApiOptions = {}) {
  const { auth = false, ...fetchOptions } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  // 인증이 필요한 경우 토큰 추가
  if (auth) {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${BACKEND_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || `API Error: ${response.status}`);
  }

  return response.json();
}

export const api = {
  auth: {
    async me() {
      try {
        const data = await fetchAPI('/api/auth/me', { auth: true });
        return { data };
      } catch (error) {
        return { data: null };
      }
    },
  },

  applications: {
    async list(params?: Record<string, string | number | boolean | undefined>) {
      try {
        const data = await fetchAPI(withQuery('/api/applications', params), { auth: true });
        return { data };
      } catch (error) {
        return { data: [] };
      }
    },

    async get(id: string) {
      try {
        const data = await fetchAPI(`/api/applications/${id}`, { auth: true });
        return { data };
      } catch (error) {
        return {
          data: null,
          error: error instanceof Error ? error.message : '신청서를 불러오지 못했습니다',
        };
      }
    },

    async create(data: any) {
      return fetchAPI('/api/applications', {
        method: 'POST',
        body: JSON.stringify(data),
        auth: true,
      });
    },

    async update(id: string, data: any) {
      return fetchAPI(`/api/applications/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        auth: true,
      });
    },

    async submit(id: string) {
      return fetchAPI(`/api/applications/${id}/submit`, {
        method: 'POST',
        auth: true,
      });
    },

    async review(id: string, data: { status: string; reason?: string }) {
      return fetchAPI(`/api/applications/${id}/review`, {
        method: 'POST',
        body: JSON.stringify(data),
        auth: true,
      });
    },

    async history(id: string) {
      try {
        const data = await fetchAPI(`/api/applications/${id}/history`, { auth: true })
        return { data }
      } catch (error) {
        return { data: [] }
      }
    },
  },

  automationRequests: {
    async list() {
      try {
        const data = await fetchAPI('/api/automation-requests', { auth: true })
        return { data }
      } catch (error) {
        return { data: [] }
      }
    },

    async get(id: string) {
      try {
        const data = await fetchAPI(`/api/automation-requests/${id}`, { auth: true })
        return { data }
      } catch (error) {
        return {
          data: null,
          error: error instanceof Error ? error.message : '자동화 서비스 요청을 불러오지 못했습니다',
        }
      }
    },

    async history(id: string) {
      try {
        const data = await fetchAPI(`/api/automation-requests/${id}/history`, { auth: true })
        return { data }
      } catch (error) {
        return { data: [] }
      }
    },
  },

  notices: {
    async list() {
      try {
        const data = await fetchAPI('/api/notices')
        return { data }
      } catch (error) {
        return { data: [] }
      }
    },
  },

  admin: {
    users: {
      async list() {
        try {
          const data = await fetchAPI('/api/admin/users', { auth: true });
          return { data };
        } catch (error) {
          return {
            data: [],
            error: error instanceof Error ? error.message : '사용자 목록을 불러오지 못했습니다',
          };
        }
      },

      async update(id: string, data: any) {
        return fetchAPI(`/api/admin/users/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
          auth: true,
        });
      },

      async delete(id: string) {
        return fetchAPI(`/api/admin/users/${id}`, {
          method: 'DELETE',
          auth: true,
        });
      },
    },

    async statistics() {
      try {
        const data = await fetchAPI('/api/admin/statistics', { auth: true });
        return { data };
      } catch (error) {
        return {
          data: null,
          error: error instanceof Error ? error.message : '통계를 불러오지 못했습니다',
        };
      }
    },

    async applicationHistory() {
      try {
        const data = await fetchAPI('/api/admin/application-history', { auth: true })
        return { data }
      } catch (error) {
        return { data: [] }
      }
    },

    notices: {
      async list() {
        try {
          const data = await fetchAPI('/api/notices/admin', { auth: true })
          return { data }
        } catch (error) {
          return {
            data: [],
            error: error instanceof Error ? error.message : '공지사항을 불러오지 못했습니다',
          }
        }
      },
    },
  },
};
