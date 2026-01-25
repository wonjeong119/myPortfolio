import { useState } from "react";
import "./App.css";

import Sidebar from "./components/sidebar";
import Topbar from "./components/topbar";
import HeroPanel from "./components/hero-panel";
import SummaryCards from "./components/summary-cards";
import ItemsTable from "./components/items-table";
import CalendarPanel from "./components/calendar-panel";
import ProjectsView from "./components/projects-view";
import TasksView from "./components/tasks-view";
import DocumentsView from "./components/documents-view";
import AnalyticsView from "./components/analytics-view";

type Page = "home" | "projects" | "tasks" | "docs" | "analytics";

export default function App() {
    const [currentPage, setCurrentPage] = useState<Page>("home");

    return (
        <div className="appRoot">
            <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />

            <div className="appShell">
                <div className="appMain">
                    <Topbar />

                    <main className="appContent">
                        {currentPage === "home" ? (
                            <div className="homeScroll">
                                <HeroPanel />
                                <SummaryCards />
                                <ItemsTable />
                            </div>
                        ) : currentPage === "projects" ? (
                            <ProjectsView />
                        ) : currentPage === "tasks" ? (
                            <TasksView />
                        ) : currentPage === "docs" ? (
                            <DocumentsView />
                        ) : currentPage === "analytics" ? (
                            <AnalyticsView />
                        ) : null}
                    </main>
                </div>

                {currentPage === "home" && (
                    <div className="rightPanel">
                        <div className="rightPanelInner">
                            <CalendarPanel />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}