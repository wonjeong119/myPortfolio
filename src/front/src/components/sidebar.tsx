// ✅ 추가
import "./sidebar.css";

import { Home, Briefcase, CheckSquare, FileText, BarChart3, Settings } from "lucide-react";

interface SidebarProps {
    currentPage: "home" | "projects" | "tasks" | "docs" | "analytics";
    onPageChange: (page: "home" | "projects" | "tasks" | "docs" | "analytics") => void;
}

const menuItems = [
    { icon: Home, label: "홈", page: "home" as const },
    { icon: Briefcase, label: "프로젝트", page: "projects" as const },
    { icon: CheckSquare, label: "작업", page: "tasks" as const },
    { icon: FileText, label: "문서", page: "docs" as const },
    { icon: BarChart3, label: "분석", page: "analytics" as const },
];

export default function Sidebar({ currentPage, onPageChange }: SidebarProps) {
    return (
        // CSS 클래스
        <aside className="sidebar">
            {/* Logo */}
            <div className="sidebarLogo">
                <div className="sidebarLogoInner">
                    <div className="sidebarLogoBadge">
                        <span className="sidebarLogoText">WJ</span>
                    </div>
                    <span className="sidebarBrand">PORTFOLIO</span>
                </div>
            </div>

            {/* Navigation Menu */}
            <nav className="sidebarNav">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPage === item.page;

                    return (
                        <button
                            key={item.label}
                            onClick={() => onPageChange(item.page)}
                            // 변경: active 상태 class 분리
                            className={`sidebarBtn ${isActive ? "sidebarBtnActive" : "sidebarBtnIdle"}`}
                            type="button"
                        >
                            <Icon className="sidebarIcon" />
                            <span className="sidebarLabel">{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            {/* Settings at bottom */}
            <div className="sidebarBottom">
                <button className="sidebarBtn sidebarBtnIdle" type="button">
                    <Settings className="sidebarIcon" />
                    <span className="sidebarLabel">설정</span>
                </button>
            </div>
        </aside>
    );
}