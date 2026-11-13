import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";
import "../admin.css";

export const metadata: Metadata = { title: "Admin login", robots: { index: false, follow: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <main className="adm-login">
      <div className="adm-login-card">
        <p className="adm-eyebrow">Mohamed Emad</p>
        <h1>Dashboard</h1>
        <LoginForm next={next ?? ""} />
      </div>
    </main>
  );
}
