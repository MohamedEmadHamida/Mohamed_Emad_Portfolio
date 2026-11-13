import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/server/auth";
import { dbConfigured } from "@/lib/server/db";
import { logout } from "../actions";
import { AdminNav } from "@/components/admin/AdminNav";
import { IgnoreToggle } from "@/components/admin/IgnoreToggle";
import "../admin.css";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false, follow: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="adm">
      <aside className="adm-side">
        <Link href="/admin" className="adm-brand">
          <span className="dot" />
          Dashboard
        </Link>
        <AdminNav />
        <div className="adm-side-foot">
          <IgnoreToggle />
          <a href="/" className="adm-btn ghost sm" target="_blank" rel="noreferrer">
            View site ↗
          </a>
          <form action={logout}>
            <button className="adm-btn ghost sm" type="submit">
              Log out
            </button>
          </form>
        </div>
      </aside>
      <main className="adm-main">
        {!dbConfigured() && (
          <p className="adm-error" style={{ marginBottom: 16 }}>
            MONGODB_URI is not set: analytics are not collected and content edits cannot be saved.
          </p>
        )}
        {children}
      </main>
    </div>
  );
}
