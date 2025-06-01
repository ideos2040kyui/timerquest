"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [userName, setUserName] = useState("");
  const [error, setError] = useState("");
  const [checkingCache, setCheckingCache] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // ローカルストレージに前回ログインユーザーがいれば自動遷移（ただし存在確認）
    const cached = localStorage.getItem("todoquest_user");
    if (cached) {
      fetch("/api/userdata")
        .then(res => res.json())
        .then(data => {
          const found = data.users?.find((u: any) => u.userName === cached);
          if (found) {
            router.replace("/" + encodeURIComponent(cached));
          } else {
            // キャッシュユーザーが存在しなければフォーム表示
            setCheckingCache(false);
          }
        })
        .catch(() => setCheckingCache(false));
    } else {
      setCheckingCache(false);
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    // サーバからユーザー存在確認
    const res = await fetch("/api/userdata");
    const data = await res.json();
    const found = data.users?.find((u: any) => u.userName === userName);
    if (found) {
      localStorage.setItem("todoquest_user", userName);
      router.push("/" + encodeURIComponent(userName));
    } else {
      setError("ユーザーが見つかりません");
    }
  };

  if (checkingCache) {
    return <main style={{ minHeight: "100dvh", display: "flex", justifyContent: "center", alignItems: "center" }}>Loading...</main>;
  }

  return (
    <main style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: "#f8fafc" }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 24, color: "#1e293b" }}>TodoQuest</h1>
      <form onSubmit={handleSubmit} style={{ width: "90vw", maxWidth: 400, background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px #0001", padding: 32, display: "flex", flexDirection: "column", gap: 16 }}>
        <label htmlFor="userName" style={{ fontWeight: 600, color: "#1e293b" }}>ユーザー名</label>
        <input id="userName" value={userName} onChange={e => setUserName(e.target.value)} autoFocus required style={{ fontSize: 18, padding: 12, borderRadius: 8, border: "1px solid #ccc" }} />
        <button type="submit" style={{ background: "#2563eb", color: "#fff", fontWeight: 700, fontSize: 18, border: "none", borderRadius: 8, padding: 12, marginTop: 8 }}>ログイン</button>
        {error && <div style={{ color: "#dc2626", fontWeight: 600 }}>{error}</div>}
      </form>
    </main>
  );
}
