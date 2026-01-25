import "./calendar-panel.css";
import { ChevronLeft, ChevronRight, Clock, X, Trash2  } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import * as React from "react";

type EventType = "meeting" | "deadline" | "presentation" | "today" | "review";

type CalendarEvent = {
  id?: number;
  date: number;     // "일" (1~31)
  title: string;
  type: EventType;
  time: string;
  memo?: string;
};

const INITIAL_EVENTS: CalendarEvent[] = [
  { date: 5, title: "팀 미팅", type: "meeting", time: "14:00" },
  { date: 12, title: "프로젝트 마감", type: "deadline", time: "18:00" },
  { date: 18, title: "발표", type: "presentation", time: "10:00" },
  { date: 20, title: "오늘", type: "today", time: "" },
  { date: 25, title: "리뷰", type: "review", time: "15:00" },
  { date: 28, title: "클라이언트 미팅", type: "meeting", time: "11:00" },
];

const MONTH_NAMES = [
  "1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월",
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
  };
}

export default function CalendarPanel() {

  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0=1월
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // 폼 데이터 (당신 원본 그대로)
  const [formData, setFormData] = useState({
    date: "",
    title: "",
    type: "-선택-",
    time: "",
    memo: "",
  });

  // events는 DB에서 불러오고, 초기엔 더미 보여주고 싶으면 INITIAL_EVENTS로 시작
  const [events, setEvents] = useState<CalendarEvent[]>(INITIAL_EVENTS);

  // 여기!
  const handleDeleteEvent = async (id: number) => {
    //setEvents((prev) => prev.filter((e) => e.id !== id));
    if (!id) return;

    const ok = window.confirm("정말 삭제할까요?");
    if (!ok) return;

    try {
      const res = await fetch(`${API_BASE}/api/calendar/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error(await res.text());

      // 1) UI 즉시 반영하고 싶으면 이 줄 유지
      setEvents((prev) => prev.filter((e) => e.id !== id));

      // 2) 더 안전하게는 서버 기준으로 다시 조회
      await fetchEvents();
    } catch (e) {
      console.error("삭제 실패:", e);
      alert("삭제 실패. 콘솔 확인!");
    }

  };

  // 에러 메시지(선택)
  const [formError, setFormError] = useState<string>("");

  const { days, daysInMonth } = useMemo(() => {
    const dim = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

    const arr: Array<number | null> = [];
    for (let i = 0; i < firstDay; i++) arr.push(null);
    for (let i = 1; i <= dim; i++) arr.push(i);

    return { days: arr, daysInMonth: dim };
  }, [currentMonth, currentYear]);

  // DB에서 현재 월 이벤트 가져오기
  const fetchEvents = async () => {
    try {
      const month = currentMonth + 1; // 1~12
      // 백엔드가 A안에서 /api/calendar?start=...&end=... 형태라면 아래처럼 호출
      const start = `${currentYear}-${String(month).padStart(2, "0")}-01`;
      const end = `${currentYear}-${String(month).padStart(2, "0")}-${String(daysInMonth).padStart(2, "0")}`;

      const res = await fetch(`${API_BASE}/api/calendar?start=${start}&end=${end}`);
      if (!res.ok) throw new Error(await res.text());

      const data: ApiEvent[] = await res.json();
      const uiEvents = data.map(mapApiToUi);
      const now = new Date();
      const isSameMonth =
          now.getFullYear() === currentYear && now.getMonth() === currentMonth;

      if (isSameMonth) {
        const todayDay = now.getDate();

        // 1) DB에서 today 타입이 이미 있으면 추가하지 않음
        const hasTodayType = uiEvents.some((e) => e.type === "today");

        // 2) 같은 날짜에 이미 today 이벤트가 있으면 추가하지 않음(혹시 모를 중복 방지)
        const hasTodayOnDate = uiEvents.some(
            (e) => e.type === "today" && e.date === todayDay
        );

        if (!hasTodayType && !hasTodayOnDate) {
          uiEvents.push({
            id: -1,                 // 임시 id (삭제/수정 시 막을 것)
            date: todayDay,
            title: "오늘",
            type: "today",
            time: "",
            memo: "",
          });
        }
      }
      /*setEvents(data.map(mapApiToUi));*/
      setEvents(uiEvents);
    } catch (e) {
      console.error("월별 일정 조회 실패:", e);
      // 조회 실패 시에는 기존 events 유지(또는 setEvents([])로 비워도 됨)
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
    if(prev === 0) {
      setCurrentYear((y) => y - 1);
      return 11;
    }
    return prev - 1;
  });
  const nextMonth = () => setCurrentMonth((prev) => {
      if(prev === 11) {
        setCurrentYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
  });

  const openModal = async() => {
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

      // 저장 성공 → 모달 닫기/폼 초기화
      closeModal();
      setFormData({ date: "", title: "", type: "-선택-", time: "", memo: "" });

      // 저장 후 최신 데이터로 재조회해서 즉시 반영
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
                {currentYear+ "년"} {MONTH_NAMES[currentMonth]}
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
                  <div key={event.id}
                       className="eventCardRow"
                       onClick={() => {
                         // 수정 모드: 선택 이벤트 세팅
                         setSelectedEvent(event);

                         // date는 input type="date"가 YYYY-MM-DD 형식이라 맞춰줘야 함
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
                            event.type === "deadline" ? "eventColorBar--deadline" :
                                event.type === "meeting" ? "eventColorBar--meeting" :
                                    event.type === "presentation" ? "eventColorBar--presentation" :
                                        "eventColorBar--review"
                          ].join(" ")}
                      />

                      <div className="eventRowBody">
                        <p className="eventRowTitle">{event.title}</p>
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

                      <button
                          className="deleteBtn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteEvent(event.id);
                          }}
                          aria-label="일정 삭제"
                          type="button"
                      >
                        <Trash2 className="trashIcon" />
                      </button>
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