
import React, { useEffect, useState, useRef } from "react";
import { DndContext, closestCorners } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UserSidebar from "./UserSidebar";
import Column from "./Column";
import SortableItem from "./SortableItem";
import notificationSound from "./notification.mp3";

const UserDashboard = () => {
  const [tasks, setTasks] = useState({
    "To Do": [],
    "In Progress": [],
    Completed: [],
  });

  const [notes, setNotes] = useState(localStorage.getItem("notes") || "");
  const audioRef = useRef(new Audio(notificationSound));

  // 🔹 Ensure page starts from top when component loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const storedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const categorizedTasks = {
      "To Do": storedTasks.filter((task) => task.progress <= 40),
      "In Progress": storedTasks.filter((task) => task.progress > 40 && task.progress <= 80),
      Completed: storedTasks.filter((task) => task.progress > 80),
    };
    setTasks(categorizedTasks);
    checkDeadlines(storedTasks);
  }, []);

  useEffect(() => {
    localStorage.setItem("notes", notes);
  }, [notes]);

  const checkDeadlines = (tasks) => {
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    tasks.forEach((task) => {
      if (task.deadline === today) {
        showNotification(`🚨 Task Due Today: "${task.title}"`, "bg-red-500 text-white");
      } else if (task.deadline === tomorrowStr) {
        showNotification(`⏳ Task Due Tomorrow: "${task.title}"`, "bg-yellow-500 text-black");
      }
    });
  };

  const showNotification = (message, bgClass) => {
    toast(
      <div className={`p-2 rounded-lg shadow-md font-semibold text-lg ${bgClass}`}>
        {message}
      </div>,
      { position: "top-right", autoClose: 5000, hideProgressBar: false }
    );
    audioRef.current.play();
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const sourceColumn = Object.keys(tasks).find((column) =>
      tasks[column].some((task) => task.id === active.id)
    );
    const targetColumn = Object.keys(tasks).find((column) => tasks[column].some((task) => task.id === over.id)) || over.id;

    if (!sourceColumn || !targetColumn || sourceColumn === targetColumn) return;

    setTasks((prevTasks) => {
      const updatedTasks = { ...prevTasks };
      const movedTask = updatedTasks[sourceColumn].find((task) => task.id === active.id);
      updatedTasks[sourceColumn] = updatedTasks[sourceColumn].filter((task) => task.id !== active.id);
      updatedTasks[targetColumn] = [...(updatedTasks[targetColumn] || []), movedTask];

      return updatedTasks;
    });

    localStorage.setItem("tasks", JSON.stringify([...tasks["To Do"], ...tasks["In Progress"], ...tasks["Completed"]]));
  };

  // Task Analytics Chart Data (Bar Graph)
  const chartData = {
    labels: ["To Do", "In Progress", "Completed"],
    datasets: [
      {
        label: "Number of Tasks",
        data: [
          tasks["To Do"].length,
          tasks["In Progress"].length,
          tasks.Completed.length,
        ],
        backgroundColor: ["#FF6384", "#FFCE56", "#36A2EB"],
        borderRadius: 8,
      },
    ],
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
      <UserSidebar />

      <div className="flex-1 p-6 lg:p-8">
        {/* Header */}
        <div className="relative mb-8">
          <div className="absolute inset-0 blur-3xl opacity-30 bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 rounded-2xl" />
          <div className="relative bg-white/70 backdrop-blur-xl border border-white/40 shadow-xl rounded-2xl px-6 py-5 flex items-center justify-between">
            <div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 bg-clip-text text-transparent">
                🚀 User Dashboard
              </h2>
              <p className="text-sm md:text-base text-slate-600 mt-1">
                Manage tasks, track progress, and jot quick notes—beautifully.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <div className="px-3 py-2 rounded-xl bg-indigo-600 text-white shadow-md">
                <span className="text-xs uppercase tracking-wide">To Do</span>
                <div className="text-lg font-bold">{tasks["To Do"].length}</div>
              </div>
              <div className="px-3 py-2 rounded-xl bg-amber-500 text-white shadow-md">
                <span className="text-xs uppercase tracking-wide">In Progress</span>
                <div className="text-lg font-bold">{tasks["In Progress"].length}</div>
              </div>
              <div className="px-3 py-2 rounded-xl bg-emerald-600 text-white shadow-md">
                <span className="text-xs uppercase tracking-wide">Completed</span>
                <div className="text-lg font-bold">{tasks.Completed.length}</div>
              </div>
            </div>
          </div>
        </div>

        <ToastContainer position="top-right" autoClose={5000} hideProgressBar />

        {/* Kanban Board */}
        <div className="glassmorphism p-4 md:p-6 rounded-2xl shadow-2xl bg-gradient-to-br from-white/60 to-white/30 backdrop-blur-xl border border-white/40">
          <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Object.keys(tasks).map((columnKey) => (
                <div
                  key={columnKey}
                  className="group rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200 shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                    <h3 className="text-sm font-bold tracking-wide uppercase text-slate-700">
                      {columnKey}
                    </h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full border ${
                        columnKey === "To Do"
                          ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                          : columnKey === "In Progress"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      }`}
                    >
                      {tasks[columnKey].length} items
                    </span>
                  </div>

                  <div className="p-3">
                    <SortableContext items={tasks[columnKey].map((task) => task.id)} strategy={verticalListSortingStrategy}>
                      <div className="space-y-3">
                        {tasks[columnKey].map((task) => (
                          <div
                            key={task.id}
                            className="transform transition-all duration-200 hover:-translate-y-0.5"
                          >
                            <SortableItem id={task.id} task={task} />
                          </div>
                        ))}
                        {tasks[columnKey].length === 0 && (
                          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60 text-slate-500 text-sm p-4 text-center">
                            Drag tasks here
                          </div>
                        )}
                      </div>
                    </SortableContext>
                  </div>
                </div>
              ))}
            </div>
          </DndContext>
        </div>

        {/* Task Analytics & Notes Section */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Task Analytics Chart */}
          <div className="relative p-6 bg-white/80 backdrop-blur-xl shadow-xl rounded-2xl border border-slate-200">
            <div className="absolute -top-3 -left-3 w-20 h-20 bg-gradient-to-br from-indigo-300 to-purple-300 blur-2xl opacity-40 rounded-full" />
            <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 mb-4 tracking-wide">
              📊 Task Analytics
            </h2>
            <div className="rounded-xl border border-slate-100 p-3 bg-white">
              <Bar data={chartData} />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded bg-[#FF6384]" />
                <span className="text-slate-600">To Do</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded bg-[#FFCE56]" />
                <span className="text-slate-600">In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded bg-[#36A2EB]" />
                <span className="text-slate-600">Completed</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="relative p-6 bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900 text-white rounded-2xl border-[12px] border-[#8B4501] shadow-2xl flex flex-col">
            <div className="absolute -top-6 -right-6 w-28 h-28 bg-amber-300 blur-2xl opacity-30 rounded-full" />
            <h2 className="text-2xl font-bold text-yellow-300 mb-3 text-center tracking-wide">
              📌 Notes
            </h2>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-emerald-200">
                Jot down quick thoughts, reminders, or ideas.
              </p>
              <span className="text-[10px] px-2 py-1 rounded-full bg-yellow-400 text-emerald-900 font-bold">
                Auto‑saved
              </span>
            </div>
            <div className="rounded-xl bg-emerald-950/40 border border-emerald-700/60 shadow-inner">
              <textarea
                className="w-full bg-transparent border-none outline-none text-white text-lg p-6 leading-relaxed placeholder:opacity-70"
                placeholder="Write your notes here..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                autoFocus
                style={{
                  fontFamily: "Chalkduster, Comic Sans MS, cursive",
                  height: "320px",
                  minHeight: "280px",
                  textAlign: "left",
                  resize: "none",
                }}
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-emerald-200">
              <span>Tip: Use short bullets for clarity.</span>
              <span className="opacity-80">Press Esc to unfocus</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-10 text-center text-xs text-slate-500">
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/70 backdrop-blur-md border border-slate-200 shadow-sm">
            <span>Made with care</span>
            <span className="text-slate-400">•</span>
            <span>Drag & drop to organize</span>
            <span className="text-slate-400">•</span>
            <span>Real‑time reminders</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default UserDashboard;
