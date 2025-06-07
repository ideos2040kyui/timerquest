"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import type { Todo } from "@/types";

export default function TimerPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const userName = decodeURIComponent(searchParams.get("user") || "");
  const todoId = Number(params.id);
  const [todo, setTodo] = useState<Todo | null>(null);
  const [time, setTime] = useState(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // タスク取得
    fetch("/api/userdata")
      .then(res => res.json())
      .then((data: { users: import("@/types").UserData[] }) => {
        const user = data.users.find((u) => u.userName === userName);
        const t = user?.todos.find((t) => t.id === todoId);
        if (t) {
          setTodo(t);
          setTime(t.timeRemaining ?? t.duration * 60);
        }
        setLoading(false);
      });
  }, [userName, todoId]);

  useEffect(() => {
    if (!loading && todo) {
      const id = setInterval(() => {
        setTime(t => (t > 0 ? t - 1 : 0));
      }, 1000);
      setIntervalId(id);
      return () => clearInterval(id);
    }
  }, [loading, todo]);

  useEffect(() => {
    if (time === 0 && intervalId && todo) {
      clearInterval(intervalId);
      fetch("/api/userdata")
        .then(res => res.json())
        .then((data: { users: import("@/types").UserData[] }) => {
          const users = data.users;
          const userIdx = users.findIndex((u) => u.userName === userName);
          if (userIdx === -1) return;
          const user = users[userIdx];
          const todoIdx = user.todos.findIndex((t) => t.id === todoId);
          if (todoIdx === -1) return;
          // XP加算
          const xpToAdd = todo.duration;
          user.xp += xpToAdd;
          // レベルアップ処理
          let level = user.level;
          let xp = user.xp;
          while ((level < 20) && (xp >= (level < 12 ? level * 10 : 120))) {
            xp -= (level < 12 ? level * 10 : 120);
            level++;
          }
          user.level = level;
          user.xp = xp;
          // タスクの中断情報リセットのみ
          user.todos[todoIdx].timeRemaining = user.todos[todoIdx].duration * 60;
          user.todos[todoIdx].lastPaused = null;
          fetch("/api/userdata", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ users }),
          }).then(() => {
            alert(`タスク完了！\n${xpToAdd} XPを獲得しました`);
            router.replace(`/${encodeURIComponent(userName)}`);
          });
        });
    }
  }, [time, intervalId, router, userName, todo, todoId]);

  const handlePause = async () => {
    if (intervalId) clearInterval(intervalId);
    if (!todo) return;
    // 中断情報保存（API呼び出し）
    const now = Date.now();
    fetch("/api/userdata")
      .then(res => res.json())
      .then((data: { users: import("@/types").UserData[] }) => {
        const users = data.users;
        const userIdx = users.findIndex((u) => u.userName === userName);
        if (userIdx === -1) return;
        const user = users[userIdx];
        const todoIdx = user.todos.findIndex((t) => t.id === todoId);
        if (todoIdx === -1) return;
        user.todos[todoIdx].timeRemaining = time;
        user.todos[todoIdx].lastPaused = now;
        fetch("/api/userdata", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ users }),
        }).then(() => {
          router.replace(`/${encodeURIComponent(userName)}`);
        });
      });
  };

  // 早期終了ボタンのハンドラ修正
  const handleEarlyFinish = async () => {
    if (!todo) return;
    if (!window.confirm("タイマーを早めにきりあげます．よろしいですか？")) return;
    if (intervalId) clearInterval(intervalId);
    // 経過時間（分、切り捨て）
    const elapsedSec = (todo.duration * 60) - time;
    const gainedXp = Math.floor(elapsedSec / 60);
    fetch("/api/userdata")
      .then(res => res.json())
      .then((data: { users: import("@/types").UserData[] }) => {
        const users = data.users;
        const userIdx = users.findIndex((u) => u.userName === userName);
        if (userIdx === -1) return;
        const user = users[userIdx];
        const todoIdx = user.todos.findIndex((t) => t.id === todoId);
        if (todoIdx === -1) return;
        // XP加算
        if (gainedXp > 0) user.xp += gainedXp;
        // レベルアップ処理
        let level = user.level;
        let xp = user.xp;
        while ((level < 20) && (xp >= (level < 12 ? level * 10 : 120))) {
          xp -= (level < 12 ? level * 10 : 120);
          level++;
        }
        user.level = level;
        user.xp = xp;
        // タスクの中断情報リセット
        user.todos[todoIdx].timeRemaining = user.todos[todoIdx].duration * 60;
        user.todos[todoIdx].lastPaused = null;
        fetch("/api/userdata", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ users }),
        }).then(() => {
          if (gainedXp > 0) {
            alert(`タスクを早期終了！\n${gainedXp} XPを獲得しました`);
          } else {
            alert("1分以上経過していません。XPは加算されません。");
          }
          router.replace(`/${encodeURIComponent(userName)}`);
        });
      });
  };

  if (loading) return <main style={{ minHeight: "100dvh", display: "flex", justifyContent: "center", alignItems: "center" }}>Loading...</main>;
  if (!todo) return <main style={{ minHeight: "100dvh", display: "flex", justifyContent: "center", alignItems: "center" }}>タスクが見つかりません</main>;

  return (
    <main style={{ minHeight: "100dvh", background: "#f8fafc", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative" }}>
      {/* 早期終了ボタン: カード外の右上に絶対配置 */}
      <button
        onClick={handleEarlyFinish}
        style={{ position: "absolute", top: 24, right: 32, background: "#ef4444", color: "#fff", fontWeight: 700, border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 16, zIndex: 10, boxShadow: "0 2px 8px #0002" }}
      >
        タスクの早期終了
      </button>
      <div style={{ position: "relative", background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px #0001", padding: 32, minWidth: 280, textAlign: "center" }}>
        <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 16, color: "#1e293b" }}>{todo.text}</div>
        <div style={{ fontSize: 48, fontWeight: 700, letterSpacing: 2, marginBottom: 16, color: "#1e293b" }}>
          {Math.floor(time / 60).toString().padStart(2, "0")}:{(time % 60).toString().padStart(2, "0")}
        </div>
        <button onClick={handlePause} style={{ background: "#f59e42", color: "#fff", fontWeight: 700, border: "none", borderRadius: 8, padding: "12px 32px", fontSize: 18 }}>中断</button>
      </div>
    </main>
  );
}
