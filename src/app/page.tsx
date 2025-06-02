import Image from "next/image";
import { redirect } from "next/navigation";
import styles from "./page.module.css";

export default function Home() {
  // ルートアクセス時は/loginへリダイレクト
  redirect("/login");
  return (
    <>
      <h1 style={{ fontWeight: 700, fontSize: 32, color: "#1e293b", marginBottom: 16 }}>
        TimerQuest
      </h1>
      <p style={{ color: "#1e293b", fontSize: 18, marginBottom: 24 }}>
        タスク管理・タイマー・XP成長型Webアプリへようこそ！
      </p>
    </>
  );
}
