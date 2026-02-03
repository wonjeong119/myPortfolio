import "./calendar-panel.css";
import { ChevronLeft, ChevronRight, Clock, X, Trash2, CheckCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import * as React from "react";

type EventType = "meeting" | "deadline" | "presentation" | "today" | "review" | "task";

type CalendarEvent = {
  id?: number;
  date: number;     // "일" (1~31)
  title: string;
  type: EventType;
  time: string;
  memo?: string;
  isTask?: boolean; // 태스크 여부
  projectId?: number; // 태스크인 경우 프로젝트 ID
  taskId?: number;    // 태스크 ID
};

const INITIAL_EVENTS: CalendarEvent[] = [];

const MONTH_NAMES = [
  "1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월",
];
const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function getDaysInMonth(month: number, year: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(month: number, year: number) {
  return new Date(year, month, 1).getDay();
}

// 서버(API) 이벤트 타입(예: Spring 응답)
type ApiEvent = {
  id: number;
  date: string;   // "2026-01-05"
  title: string;
  type: string;   // "meeting" | ...
  time: string;
  memo: string;
};

// 태스크 타입 (TaskResponse)
type TaskResponse = {
  projectId: number;
  taskId: number;
  title: string;
  description: string;
  completed: boolean;
  priority: string;
  deadline: string | null; // "YYYY-MM-DD"
  createdAt: string;
  updatedAt: string;
};

const API_BASE = "http://localhost:8080";

// 모달 select(한글) -> 서버/프론트 EventType(영문)
function mapKoreanTypeToEventType(v: string): EventType {
  switch (v) {
    case "미팅": return "meeting";
    case "마감": return "deadline";
    case "발표": return "presentation";
    case "리뷰": return "review";
    // 개인/일정/기타는 지금 UI 점 색상 규칙이 없어서 일단 review로 통일(원하면 타입 확장 가능)
    case "개인":
    case "일정":
    case "기타":
      return "review";
    default:
      return "review";
  }
}

function dayFromIso(iso: string) {
  const d = iso?.split("-")?.[2];
  return d ? Number(d) : NaN;
}

function mapApiToUi(e: ApiEvent): CalendarEvent {
  return {
    id: e.id,
    date: dayFromIso(e.date),
    title: e.title,
    type: (e.type as EventType) ?? "review",
    time: e.time ?? "",
    memo: e.memo ?? "",
    isTask: false,
  };
}

export default function CalendarPanel() {

  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0=1월
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // 폼 데이터
  const [formData, setFormData] = useState({
    date: "",
    title: "",
    type: "-선택-",
    time: "",
    memo: "",
  });

  const [events, setEvents] = useState<CalendarEvent[]>(INITIAL_EVENTS);

  // 이벤트 삭제
  const handleDeleteEvent = async (id: number) => {
    if (!id) return;

    const ok = window.confirm("정말 삭제할까요?");
    if (!ok) return;

    try {
      const res = await fetch(`${API_BASE}/api/calendar/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error(await res.text());

      setEvents((prev) => prev.filter((e) => e.id !== id));
      await fetchEvents();
    } catch (e) {
      console.error("삭제 실패:", e);
      alert("삭제 실패. 콘솔 확인!");
    }

  };

  // 에러 메시지
  const [formError, setFormError] = useState<string>("");

  const { days, daysInMonth } = useMemo(() => {
    const dim = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

    const arr: Array<number | null> = [];
    for (let i = 0; i < firstDay; i++) arr.push(null);
    for (let i = 1; i <= dim; i++) arr.push(i);

    return { days: arr, daysInMonth: dim };
  }, [currentMonth, currentYear]);

  // DB에서 현재 월 이벤트 + 태스크 가져오기
  const fetchEvents = async () => {
    try {
      const month = currentMonth + 1; // 1~12
      const start = `${currentYear}-${String(month).padStart(2, "0")}-01`;
      const end = `${currentYear}-${String(month).padStart(2, "0")}-${String(daysInMonth).padStart(2, "0")}`;

      // 1. 캘린더 이벤트 조회
      const calRes = await fetch(`${API_BASE}/api/calendar?start=${start}&end=${end}`);
      let uiEvents: CalendarEvent[] = [];

      if (calRes.ok) {
        const data: ApiEvent[] = await calRes.json();
        uiEvents = data.map(mapApiToUi);
      }

      // 2. 태스크 조회 (전체 가져와서 날짜 필터링) - 더 효율적으로 하려면 API에 날짜 필터 추가 필요
      const taskRes = await fetch(`${API_BASE}/api/tasks`);
      if (taskRes.ok) {
        const tasks: TaskResponse[] = await taskRes.json();

        tasks.forEach(task => {
          if (task.deadline) {
            // deadline format: "YYYY-MM-DD"
            const [tYear, tMonth, tDay] = task.deadline.split("-").map(Number);

            // 현재 달력의 연/월과 일치하는지 확인
            if (tYear === currentYear && tMonth === (currentMonth + 1)) {
              uiEvents.push({
                id: task.taskId, // ID 충돌 가능성? CalendarEvent ID와 겹칠 수 있음. 구분 필요.
                // UI 렌더링 시 key는 id가 유니크해야함.
                // 여기서는 id를 그대로 쓰고, isTask로 구분. key={isTask ? `task-${id}` : `cal-${id}`} 처리 필요
                date: tDay,
                title: `[Task] ${task.title}`,
                type: "deadline", // 태스크는 마감일(deadline)로 표시하거나 별도 타입
                time: "",
                memo: task.description,
                isTask: true,
                projectId: task.projectId,
                taskId: task.taskId
              });
            }
          }
        });
      }

      const now = new Date();
      const isSameMonth =
        now.getFullYear() === currentYear && now.getMonth() === currentMonth;

      if (isSameMonth) {
        const todayDay = now.getDate();

        const hasTodayType = uiEvents.some((e) => e.type === "today");
        const hasTodayOnDate = uiEvents.some(
          (e) => e.type === "today" && e.date === todayDay
        );

        if (!hasTodayType && !hasTodayOnDate) {
          uiEvents.push({
            id: -1,
            date: todayDay,
            title: "오늘",
            type: "today",
            time: "",
            memo: "",
            isTask: false
          });
        }
      }
      setEvents(uiEvents);
    } catch (e) {
      console.error("월별 일정 조회 실패:", e);
    }
  };

  // 월 이동/일수 계산 변경될 때 자동 조회
  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMonth, daysInMonth]);

  const hasEvent = (day: number | null) => {
    if (!day) return null;
    return events.find((e) => e.date === day) ?? null;
  };

  const upcomingEvents = useMemo(() => {
    return [...events]
      .filter((e) => e.type !== "today")
      .sort((a, b) => a.date - b.date)
      .slice(0, 8);
  }, [events]);

  const prevMonth = () => setCurrentMonth((prev) => {
    if (prev === 0) {
      setCurrentYear((y) => y - 1);
      return 11;
    }
    return prev - 1;
  });
  const nextMonth = () => setCurrentMonth((prev) => {
    if (prev === 11) {
      setCurrentYear((y) => y + 1);
      return 0;
    }
    return prev + 1;
  });

  const openModal = async () => {
    setFormError("");
    setSelectedEvent(null); // 추가 모드
    setFormData({ date: "", title: "", type: "-선택-", time: "", memo: "" }); // 폼 초기화
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setFormError("");
    setSelectedEvent(null);
  };

  // 저장 시 DB로 POST + 성공하면 다시 조회해서 화면 반영
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    // 기본 검증
    if (!formData.date) {
      setFormError("날짜를 선택해 주세요.");
      return;
    }
    if (!formData.title.trim()) {
      setFormError("제목을 입력해 주세요.");
      return;
    }
    if (!formData.type || formData.type === "-선택-") {
      setFormError("유형을 선택해 주세요.");
      return;
    }

    const apiType = mapKoreanTypeToEventType(formData.type);

    try {
      const isEdit = Boolean(selectedEvent?.id);
      const url = isEdit
        ? `${API_BASE}/api/calendar/${selectedEvent!.id}`
        : `${API_BASE}/api/calendar`;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: formData.date,              // "2026-01-05"
          title: formData.title.trim(),
          type: apiType,                    // "meeting" 등
          time: formData.time ?? "",
          memo: formData.memo ?? "",
        }),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg);
      }

      closeModal();
      setFormData({ date: "", title: "", type: "-선택-", time: "", memo: "" });
      await fetchEvents();
    } catch (err) {
      console.error("일정 저장 실패:", err);
      setFormError("저장에 실패했습니다. 콘솔 로그를 확인해 주세요.");
    }
  };

  return (
    <>
      <div className="calendarPanel">
        {/* Calendar Header */}
        <div className="calendarHeader">
          <div className="calendarHeaderTop">
            <h2 className="calendarTitle">일정</h2>

            <div className="monthNav">
              <button onClick={prevMonth} className="iconBtn" aria-label="이전 달">
                <ChevronLeft className="icon" />
              </button>

              <span className="monthLabel">
                {currentYear + "년"} {MONTH_NAMES[currentMonth]}
              </span>

              <button onClick={nextMonth} className="iconBtn" aria-label="다음 달">
                <ChevronRight className="icon" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="calendarGrid">
            {WEEKDAYS.map((day, idx) => (
              <div
                key={day}
                className={[
                  "weekday",
                  idx === 0 ? "weekdaySun" : idx === 6 ? "weekdaySat" : "",
                ].join(" ")}
              >
                {day}
              </div>
            ))}

            {days.map((day, index) => {
              const event = hasEvent(day);
              const dayOfWeek = index % 7;

              const cellClass = [
                "dayCell",
                day ? "dayCellClickable" : "dayCellEmpty",
                day && event?.type === "today" ? "dayCellToday" : "",
                day && event && event.type !== "today" ? "dayCellHasEvent" : "",
                day && !event && dayOfWeek === 0 ? "dayCellSun" : "",
                day && !event && dayOfWeek === 6 ? "dayCellSat" : "",
              ].join(" ");

              return (
                <div key={index} className={cellClass}>
                  {day}
                  {event && event.type !== "today" && (
                    <span className={["eventDot", `eventDot--${event.type}`].join(" ")} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="upcomingArea">
          <h3 className="upcomingHeader">다가오는 일정</h3>

          <div className="upcomingStack">
            {upcomingEvents.map((event) => (
              <div key={event.isTask ? `task-${event.id}` : `evt-${event.id}`}
                className="eventCardRow"
                style={event.isTask ? { opacity: 0.9, borderLeft: '3px solid #6366f1' } : {}}
                onClick={() => {
                  if (event.isTask) {
                    alert("태스크 일정은 '작업' 탭에서 관리해주세요.");
                    return;
                  }

                  // 수정 모드: 선택 이벤트 세팅
                  setSelectedEvent(event);

                  const month = String(currentMonth + 1).padStart(2, "0");
                  const day = String(event.date).padStart(2, "0");

                  setFormData({
                    date: `${currentYear}-${month}-${day}`,
                    title: event.title ?? "",
                    type:
                      event.type === "meeting" ? "미팅" :
                        event.type === "deadline" ? "마감" :
                          event.type === "presentation" ? "발표" :
                            event.type === "review" ? "리뷰" :
                              "-선택-",
                    time: event.time ?? "",
                    memo: event.memo ?? "",
                  });

                  setFormError("");
                  setIsModalOpen(true);
                }}
              >
                <div className="eventRowInner">
                  <div
                    className={[
                      "eventColorBar",
                      event.isTask ? "" : // 태스크일 경우 별도 스타일(인라인) 또는 여기서 처리
                        event.type === "deadline" ? "eventColorBar--deadline" :
                          event.type === "meeting" ? "eventColorBar--meeting" :
                            event.type === "presentation" ? "eventColorBar--presentation" :
                              "eventColorBar--review"
                    ].join(" ")}
                    style={event.isTask ? { backgroundColor: '#6366f1' } : {}}
                  />

                  <div className="eventRowBody">
                    <p className="eventRowTitle">
                      {event.title}
                      {event.isTask && <span style={{ fontSize: '0.7em', color: '#666', marginLeft: '6px' }}>(Task)</span>}
                    </p>
                    <div className="eventRowMeta">
                      <span>{MONTH_NAMES[currentMonth]} {event.date}일</span>
                      {event.time && (
                        <>
                          <span className="eventRowSep">•</span>
                          <span className="eventRowTime">
                            <Clock className="clockIcon" />
                            {event.time}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {!event.isTask && (
                    <button
                      className="deleteBtn"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!event.id) return;
                        handleDeleteEvent(event.id);
                      }}
                      aria-label="일정 삭제"
                      type="button"
                    >
                      <Trash2 className="trashIcon" />
                    </button>
                  )}

                  {event.isTask && (
                    <div style={{ padding: '0 8px', color: '#aaa' }}>
                      <CheckCircle size={16} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add Event Button */}
        <div className="calendarFooter">
          <button onClick={openModal} className="addEventBtn">
            + 일정 추가
          </button>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modalOverlay" onMouseDown={closeModal}>
          <div className="modalContainer" onMouseDown={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="modalHeader">
              <div>
                <h3 className="modalHeaderTitle">{selectedEvent ? "일정 수정" : "일정 추가"}</h3>
                <p className="modalHeaderDesc">{selectedEvent ? "일정을 수정하세요" : "새로운 일정을 등록하세요"}</p>
              </div>
              <button onClick={closeModal} className="modalCloseBtn" aria-label="닫기">
                <X className="modalCloseIcon" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="modalForm">
              <div className="formField">
                <label className="formLabel">날짜</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="formInput"
                  required
                />
              </div>

              <div className="formField">
                <label className="formLabel">제목</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="예: 팀 미팅"
                  className="formInput"
                  required
                />
              </div>

              <div className="formField">
                <label className="formLabel">유형</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="formSelect"
                  required
                >
                  <option value="-선택-">-선택-</option>
                  <option value="개인">개인</option>
                  <option value="일정">일정</option>
                  <option value="미팅">미팅</option>
                  <option value="마감">마감</option>
                  <option value="발표">발표</option>
                  <option value="리뷰">리뷰</option>
                  <option value="기타">기타</option>
                </select>
              </div>

              <div className="formField">
                <label className="formLabel">시간 (선택)</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="formInput"
                />
              </div>

              <div className="formField">
                <label className="formLabel">메모 (선택)</label>
                <textarea
                  value={formData.memo}
                  onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                  placeholder="추가 정보를 입력하세요..."
                  rows={4}
                  className="formTextarea"
                />
              </div>

              {/* 에러 표시(필요 없으면 제거 가능) */}
              {formError && <div className="formError">{formError}</div>}

              <div className="modalActions">
                <button type="button" onClick={closeModal} className="btnCancel">
                  취소
                </button>
                <button type="submit" className="btnSave">
                  {selectedEvent ? "수정" : "저장"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}