import { useEffect, useCallback } from 'react';
import { getLoginTime, logout, SESSION_TIMEOUT_MS } from '../api';

/**
 * 로그인 후 30분이 지나면 자동으로 로그아웃하는 커스텀 훅.
 * - setTimeout: 탭이 활성 상태일 때 정확한 시간에 로그아웃
 * - visibilitychange / focus: 사이트를 나갔다 돌아올 때 즉시 만료 체크
 * @param onLogout 로그아웃 시 호출할 콜백 (상태 업데이트용)
 */
export function useAutoLogout(onLogout: () => void): void {
    /** 세션 만료 여부를 확인하고, 만료 시 로그아웃 */
    const checkExpiry = useCallback(() => {
        const loginTime = getLoginTime();
        if (!loginTime) return;

        const elapsed = Date.now() - loginTime;
        if (elapsed >= SESSION_TIMEOUT_MS) {
            alert('세션이 만료되었습니다. 다시 로그인해 주세요.');
            logout();
            onLogout();
        }
    }, [onLogout]);

    useEffect(() => {
        const loginTime = getLoginTime();
        if (!loginTime) return;

        const elapsed = Date.now() - loginTime;
        const remaining = SESSION_TIMEOUT_MS - elapsed;

        // 이미 만료된 경우 즉시 로그아웃
        if (remaining <= 0) {
            alert('세션이 만료되었습니다. 다시 로그인해 주세요.');
            logout();
            onLogout();
            return;
        }

        // 남은 시간 후 자동 로그아웃 (탭이 활성 상태일 때)
        const timerId = setTimeout(() => {
            alert('세션이 만료되었습니다. 다시 로그인해 주세요.');
            logout();
            onLogout();
        }, remaining);

        // 탭 복귀 시 만료 체크 (브라우저 탭을 나갔다 돌아올 때)
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                checkExpiry();
            }
        };

        // 브라우저 창 포커스 시 만료 체크
        const handleFocus = () => {
            checkExpiry();
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);

        return () => {
            clearTimeout(timerId);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, [onLogout, checkExpiry]);
}
