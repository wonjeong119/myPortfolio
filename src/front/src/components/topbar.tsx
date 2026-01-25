// ✅ 추가
import "./topbar.css";

import { Bell, User, LogOut, Settings, Clock } from "lucide-react";
import { useState } from "react";

export default function Topbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const currentTime = new Date().toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const currentDate = new Date().toLocaleDateString("ko-KR", {
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
            <button className="topbarNotiBtn" type="button" aria-label="알림">
              <Bell className="topbarNotiIcon" />
              <span className="topbarNotiDot" />
            </button>

            {/* Avatar Dropdown */}
            <div className="topbarAvatarWrap">
              <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="topbarAvatarBtn"
                  type="button"
                  aria-label="사용자 메뉴"
              >
                <div className="topbarAvatar">
                  <span className="topbarAvatarText">JD</span>
                </div>
              </button>

              {dropdownOpen && (
                  <div className="topbarMenu">
                    <div className="topbarMenuHeader">
                      <p className="topbarMenuName">John Doe</p>
                      <p className="topbarMenuEmail">john@example.com</p>
                    </div>

                    <button className="topbarMenuItem" type="button">
                      <User className="topbarMenuIcon" />
                      프로필
                    </button>

                    <button className="topbarMenuItem" type="button">
                      <Settings className="topbarMenuIcon" />
                      설정
                    </button>

                    <div className="topbarMenuFooter">
                      <button className="topbarMenuItemDanger" type="button">
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
