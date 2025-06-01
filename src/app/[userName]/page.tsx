"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import type { UserData, Todo } from "@/types";

function getXpToNextLevel(level: number) {
  if (level < 12) return level * 10;
  return 120;
}

export default function MainPage() {
  const router = useRouter();
  const params = useParams();
  const userName = decodeURIComponent(params.userName as string);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [taskText, setTaskText] = useState("");
  const [taskDuration, setTaskDuration] = useState(25);

  useEffect(() => {
    // ユーザーデータ取得
    fetch("/api/userdata")
      .then(res => res.json())
      .then(data => {
        const found = data.users?.find((u: any) => u.userName === userName);
        if (found) setUserData(found);
        setLoading(false);
      });
  }, [userName]);

  // タスク追加
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskText.trim()) return;
    const res = await fetch("/api/userdata");
    const data = await res.json();
    const users = data.users || [];
    const userIdx = users.findIndex((u: any) => u.userName === userName);
    if (userIdx === -1) return;
    const user = users[userIdx];
    const newId = user.todos.length > 0 ? Math.max(...user.todos.map((t: any) => t.id)) + 1 : 1;
    user.todos.push({
      id: newId,
      text: taskText,
      duration: taskDuration,
      timeRemaining: taskDuration * 60,
      lastPaused: null,
      userName,
      completed: false,
    });
    await fetch("/api/userdata", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ users }),
    });
    setTaskText("");
    setTaskDuration(25);
    setUserData({ ...user });
  };

  // タスク削除
  const handleDeleteTask = async (id: number) => {
    const res = await fetch("/api/userdata");
    const data = await res.json();
    const users = data.users || [];
    const userIdx = users.findIndex((u: any) => u.userName === userName);
    if (userIdx === -1) return;
    const user = users[userIdx];
    user.todos = user.todos.filter((t: any) => t.id !== id);
    await fetch("/api/userdata", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ users }),
    });
    setUserData({ ...user });
  };

  // タイマー再開・最初から開始の分岐UI
  const getTimerButton = (todo: Todo) => {
    if (todo.lastPaused && todo.timeRemaining < todo.duration * 60) {
      return (
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ background: "#22c55e", color: "#fff", fontWeight: 700, border: "none", borderRadius: 8, padding: "8px 12px" }}
            onClick={() => router.push(`/timer/${todo.id}?user=${encodeURIComponent(userName)}`)}>
            途中から再開
          </button>
          <button style={{ background: "#2563eb", color: "#fff", fontWeight: 700, border: "none", borderRadius: 8, padding: "8px 12px" }}
            onClick={async () => {
              // 最初から開始: timeRemaining/lastPausedリセット
              const res = await fetch("/api/userdata");
              const data = await res.json();
              const users = data.users || [];
              const userIdx = users.findIndex((u: any) => u.userName === userName);
              if (userIdx === -1) return;
              const user = users[userIdx];
              const todoIdx = user.todos.findIndex((t: any) => t.id === todo.id);
              if (todoIdx === -1) return;
              user.todos[todoIdx].timeRemaining = user.todos[todoIdx].duration * 60;
              user.todos[todoIdx].lastPaused = null;
              await fetch("/api/userdata", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ users }),
              });
              setUserData({ ...user });
            }}>
            最初から開始
          </button>
        </div>
      );
    }
    return (
      <button style={{ background: "#22c55e", color: "#fff", fontWeight: 700, border: "none", borderRadius: 8, padding: "8px 12px" }}
        onClick={() => router.push(`/timer/${todo.id}?user=${encodeURIComponent(userName)}`)}>
        タイマー開始
      </button>
    );
  };

  if (loading) return <main style={{ minHeight: "100dvh", display: "flex", justifyContent: "center", alignItems: "center" }}>Loading...</main>;
  if (!userData) return <main style={{ minHeight: "100dvh", display: "flex", justifyContent: "center", alignItems: "center" }}>ユーザーが見つかりません</main>;

  const xpToNext = getXpToNextLevel(userData.level) - userData.xp;

  return (
    <main style={{ minHeight: "100dvh", background: "#f8fafc", paddingBottom: 32 }}>
      <div style={{ background: "#2563eb", color: "#fff", padding: 16, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, textAlign: "center" }}>
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: 1 }}>TodoQuest</div>
        <div style={{ marginTop: 12, fontWeight: 600, fontSize: 18 }}>
          <span style={{ cursor: "pointer", textDecoration: "underline dotted", fontWeight: 700 }}
            title="ユーザー切り替え"
            onClick={() => {
              localStorage.removeItem("todoquest_user");
              router.push("/login");
            }}>{userName}</span>
          <span style={{ margin: "0 16px" }}></span>
          <span style={{ fontWeight: 700 }}>Lv.{userData.level}</span>
          <span style={{ margin: "0 16px" }}></span>
          <span style={{ color: "#facc15" }}>次Lvまで <span style={{ fontWeight: 700 }}>{xpToNext} XP</span></span>
        </div>
      </div>
      <div style={{ margin: "24px auto 0", maxWidth: 420, width: "95vw", background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px #0001", padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontWeight: 700, fontSize: 18 }}>タスクをこなして強くなろう！</span>
          <button aria-label="info" onClick={() => setShowInfo(v => !v)} style={{ background: "#e0e7ef", border: "none", borderRadius: 8, padding: "2px 8px", fontWeight: 700, cursor: "pointer" }}>i</button>
        </div>
        {showInfo && (
          <div style={{ marginTop: 8, fontSize: 15, color: "#334155", background: "#f1f5f9", borderRadius: 8, padding: 12 }}>
            タスクを登録し、タイマーで集中作業！<br />
            タスク完了でXPを獲得、レベルアップを目指そう！<br />
            <ul style={{ margin: "8px 0 0 16px", padding: 0 }}>
              <li>タスク名・所要時間（分）を入力して登録</li>
              <li>タスクの「タイマー開始」で作業スタート</li>
              <li>完了でXPゲット＆レベルアップ！</li>
            </ul>
          </div>
        )}
        <form style={{ marginTop: 20, display: "flex", gap: 8 }} onSubmit={handleAddTask}>
          <input type="text" placeholder="タスク名" value={taskText} onChange={e => setTaskText(e.target.value)} required style={{ flex: 2, fontSize: 16, padding: 8, borderRadius: 8, border: "1px solid #ccc" }} />
          <input type="number" min={1} max={180} value={taskDuration} onChange={e => setTaskDuration(Number(e.target.value))} required style={{ width: 70, fontSize: 16, padding: 8, borderRadius: 8, border: "1px solid #ccc" }} />
          <span style={{ alignSelf: "center", fontWeight: 600 }}>分</span>
          <button type="submit" style={{ background: "#2563eb", color: "#fff", fontWeight: 700, border: "none", borderRadius: 8, padding: "8px 16px" }}>追加</button>
        </form>
        <div style={{ marginTop: 24, maxHeight: 260, overflowY: "auto" }}>
          {userData.todos.length === 0 ? (
            <div style={{ color: "#64748b", textAlign: "center" }}>タスクがありません</div>
          ) : (
            userData.todos.map((todo: Todo) => (
              <div key={todo.id} style={{ background: "#f1f5f9", borderRadius: 8, padding: 12, marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{todo.text}</div>
                  <div style={{ fontSize: 13, color: "#64748b" }}>所要: {todo.duration}分</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {getTimerButton(todo)}
                  <button style={{ background: "#ef4444", color: "#fff", fontWeight: 700, border: "none", borderRadius: 8, padding: "8px 12px" }} onClick={() => handleDeleteTask(todo.id)}>
                    削除
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
