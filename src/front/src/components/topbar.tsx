// ✅ 추가
import "./topbar.css";

import { Bell, User, LogOut, Settings, Clock, CheckCircle, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { authFetchJson, logout } from "../api";

type Task = {
  taskId: number;
  title: string;
  completed: boolean;
  updatedAt: string;
};

export default function Topbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notiOpen, setNotiOpen] = useState(false);
  const [now, setNow] = useState(new Date());

  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const notiRef = useRef<HTMLDivElement>(null);

  // Close notification when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notiRef.current && !notiRef.current.contains(event.target as Node)) {
        setNotiOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    // Fetch tasks to check for completed ones
    const fetchTasks = async () => {
      try {
        const data: Task[] = await authFetchJson<Task[]>("http://localhost:8080/api/tasks/recent-completed");
        setCompletedTasks(data);
      } catch (e) {
        console.error("Failed to fetch tasks for notifications", e);
      }
    };

    fetchTasks();
    // Poll every 30 seconds for updates (optional but good for notifications)
    const pollTimer = setInterval(fetchTasks, 30000);

    return () => {
      clearInterval(timer);
      clearInterval(pollTimer);
    };
  }, []);

  const currentTime = now.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const currentDate = now.toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  return (
    <div className="topbar">
      <div className="topbarInner">
        {/* Search Field (지금은 비워둔 상태 유지) */}
        <div className="topbarSearch" />

        {/* Right side */}
        <div className="topbarRight">
          {/* Date & Time */}
          <div className="topbarTimeBox">
            <Clock className="topbarClockIcon" />
            <div className="topbarTimeText">
              <span className="topbarTime">{currentTime}</span>
              <span className="topbarDate">{` ${currentDate}`}</span>
            </div>
          </div>

          {/* Notifications */}
          <div className="topbarNotiWrap" style={{ position: 'relative' }} ref={notiRef}>
            <button
              className="topbarNotiBtn"
              type="button"
              aria-label="알림"
              onClick={() => setNotiOpen(!notiOpen)}
            >
              <Bell className="topbarNotiIcon" />
              {completedTasks.length > 0 && <span className="topbarNotiDot" />}
            </button>

            {notiOpen && (
              <div className="topbarMenu" style={{ width: '320px', right: '-60px' }}>
                <div className="topbarMenuHeader" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p className="topbarMenuName">알림</p>
                  <button onClick={() => setNotiOpen(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                    <X size={16} color="#9ca3af" />
                  </button>
                </div>

                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {completedTasks.length === 0 ? (
                    <div style={{ padding: '16px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
                      새로운 알림이 없습니다.
                    </div>
                  ) : (
                    completedTasks.map(task => (
                      <div key={task.taskId} className="topbarMenuItem" style={{ cursor: 'default', alignItems: 'flex-start' }}>
                        <div style={{ marginTop: '2px' }}>
                          <CheckCircle size={16} color="#10b981" />
                        </div>
                        <div>
                          <p style={{ margin: 0, fontSize: '14px', fontWeight: 500 }}>작업 완료</p>
                          <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#4b5563' }}>
                            '{task.title}' 작업이 완료되었습니다.
                          </p>
                          <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#9ca3af' }}>
                            {new Date(task.updatedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Avatar Dropdown */}
          <div className="topbarAvatarWrap">
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              className="topbarAvatarBtn"
              type="button"
              aria-label="사용자 메뉴"
            >
              <div className="topbarAvatar">
                <span className="topbarAvatarText">관</span>
              </div>
            </button>

            {dropdownOpen && (
              <div className="topbarMenu">
                <div className="topbarMenuHeader">
                  <p className="topbarMenuName">admin</p>
                  <p className="topbarMenuEmail">관리자</p>
                </div>

                {/*<button className="topbarMenuItem" type="button">
                  <User className="topbarMenuIcon" />
                  프로필
                </button>

                <button className="topbarMenuItem" type="button">
                  <Settings className="topbarMenuIcon" />
                  설정
                </button>
                */}
                <div className="topbarMenuFooter">
                  <button className="topbarMenuItemDanger" type="button" onClick={logout}>
                    <LogOut className="topbarMenuIcon" />
                    로그아웃
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
