import Image from "next/image";
import { redirect } from "next/navigation";
import styles from "./page.module.css";

export default function Home() {
  // ルートアクセス時は/loginへリダイレクト
  redirect("/login");
  return null;
}
