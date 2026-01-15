
import { useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import UserSidebar from "./UserSidebar";

const locales = { "en-US": enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Fetch tasks from localStorage
  useEffect(() => {
    const storedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const taskEvents = storedTasks.map((task) => ({
      title: task.title,
      start: new Date(task.deadline),
      end: new Date(task.deadline),
      type: "deadline",
    }));
    setEvents(taskEvents);
  }, []);

  const handleSelectSlot = ({ start, end }) => {
    const title = prompt("Enter event title:");
    if (title) {
      const isDeadline = window.confirm("Is this a deadline? Click OK for Yes, Cancel for No.");
      setEvents([...events, { title, start, end, type: isDeadline ? "deadline" : "event" }]);
    }
  };

  const handleNavigate = (newDate) => {
    setCurrentDate(newDate);
  };

  const eventStyleGetter = (event) => {
    let style = {
      backgroundColor: event.type === "deadline" ? "rgb(239, 68, 68)" : "rgb(59, 130, 246)",
      borderRadius: "8px",
      opacity: 0.95,
      color: "white",
      padding: "6px",
      border: "none",
      boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
      fontWeight: "600",
    };
    return { style };
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50 to-purple-100">
      {/* Sidebar */}
      <UserSidebar />

      {/* Main Calendar Content */}
      <div className="flex-1 p-6 lg:p-10">
        <div className="relative bg-white/80 backdrop-blur-xl p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-6xl mx-auto border border-slate-200">
          {/* Decorative gradient glow */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-gradient-to-br from-indigo-300 via-purple-300 to-pink-300 blur-3xl opacity-30 rounded-full" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-br from-pink-300 via-rose-300 to-orange-300 blur-3xl opacity-30 rounded-full" />

          <h2 className="text-3xl md:text-4xl font-extrabold mb-6 text-center bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent tracking-tight">
            📅 Task & Deadline Calendar
          </h2>

          <p className="text-center text-slate-600 mb-6">
            Stay on top of your tasks and deadlines with a clear, interactive calendar view.
          </p>

          <div className="rounded-xl overflow-hidden border border-slate-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              selectable
              onSelectSlot={handleSelectSlot}
              style={{ height: 600 }}
              className="bg-white"
              date={currentDate}
              onNavigate={handleNavigate}
              eventPropGetter={eventStyleGetter}
            />
          </div>

          {/* Legend */}
          <div className="mt-6 flex justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-red-500 shadow-sm" />
              <span className="text-slate-700 font-medium">Deadline</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-blue-500 shadow-sm" />
              <span className="text-slate-700 font-medium">Event</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-10 text-center text-xs text-slate-500">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 backdrop-blur-md border border-slate-200 shadow-sm">
            <span>Drag to select slots</span>
            <span className="text-slate-400">•</span>
            <span>Add deadlines or events easily</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default CalendarPage;

