const API_BASE = 'http://localhost:8080';

/** localStorage에 저장된 JWT 토큰 키 */
const TOKEN_KEY = 'jwt_token';

/** 토큰 가져오기 */
export function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

/** 토큰 저장 */
export function setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
}

/** 토큰 삭제 */
export function removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
}

/** 로그인 여부 확인 */
export function isAuthenticated(): boolean {
    return !!getToken();
}

/**
 * 인증 헤더가 포함된 fetch 래퍼.
 * 401 응답 시 토큰을 삭제하고 로그인 페이지로 이동합니다.
 */
export async function authFetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
    const token = getToken();
    const headers: Record<string, string> = {
        ...(init?.headers as Record<string, string> || {}),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(input, {
        ...init,
        headers,
    });

    if (res.status === 401) {
        removeToken();
        window.location.reload();
    }

    return res;
}

/**
 * 인증이 포함된 JSON fetch 래퍼.
 * 응답을 자동으로 JSON 파싱합니다.
 */
export async function authFetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
    const res = await authFetch(input, init);

    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `HTTP ${res.status}`);
    }

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) return undefined as T;
    return res.json() as Promise<T>;
}

/** 로그인 API 호출 */
export async function loginApi(username: string, password: string): Promise<string> {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || '로그인에 실패했습니다.');
    }

    const data = await res.json();
    setToken(data.token);
    return data.token;
}

/** 로그아웃 */
export function logout(): void {
    removeToken();
    window.location.reload();
}
