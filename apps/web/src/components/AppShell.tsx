"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, BookOpen, BriefcaseBusiness, ChevronDown, FileText, Grid2X2, Library, Menu, Plus, Settings, Sparkles, Users, ArrowLeft } from "lucide-react";
import clsx from "clsx";

export function AppShell({ children, title }: { children: React.ReactNode; title: string }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <main className="app-frame">
      <aside className="sidebar">
        <Logo />
        <Link className="create-pill" href="/create">
          <Sparkles size={18} /> Create Assignment
        </Link>
        <nav>
          <NavItem href="/" icon={<Grid2X2 size={20} />} label="Home" active={pathname === "/home"} />
          <NavItem href="/" icon={<Users size={20} />} label="My Groups" />
          <NavItem href="/" icon={<FileText size={20} />} label="Assignments" active={pathname === "/" || pathname.startsWith("/assignments")} badge="10" />
          <NavItem href="/create" icon={<BookOpen size={20} />} label="AI Teacher’s Toolkit" active={pathname === "/create"} />
          <NavItem href="/" icon={<Library size={20} />} label="My Library" badge={pathname === "/create" ? "32" : undefined} />
        </nav>
        <div className="sidebar-bottom">
          <NavItem href="/" icon={<Settings size={20} />} label="Settings" />
          <SchoolCard />
        </div>
      </aside>

      <section className="main-panel">
        <header className="topbar">
          <button className="round-button" onClick={() => (pathname === "/" ? undefined : router.back())} aria-label="Go back">
            <ArrowLeft size={24} />
          </button>
          <span className="crumb"><BriefcaseBusiness size={20} /> {title}</span>
          <div className="account">
            <button className="notification" aria-label="Notifications"><Bell size={22} /><span /></button>
            <span className="avatar">👩🏻‍🏫</span>
            <strong>John Doe</strong>
            <ChevronDown size={18} />
          </div>
        </header>

        <header className="mobile-topbar">
          <Logo />
          <div className="mobile-actions">
            <button className="notification" aria-label="Notifications"><Bell size={20} /><span /></button>
            <span className="avatar small">👨🏻‍💼</span>
            <Menu size={25} />
          </div>
        </header>

        <div className="content">{children}</div>

        <nav className="mobile-nav">
          <MobileItem icon={<Grid2X2 size={22} />} label="Home" />
          <MobileItem icon={<BriefcaseBusiness size={22} />} label="Assignments" active />
          <MobileItem icon={<FileText size={22} />} label="Library" />
          <MobileItem icon={<Sparkles size={22} />} label="AI Toolkit" />
        </nav>
        <Link className="mobile-fab" href="/create" aria-label="Create assignment"><Plus size={24} /></Link>
      </section>
    </main>
  );
}

function Logo() {
  return (
    <Link href="/" className="logo" aria-label="VedaAI home">
      <span>V</span>
      <strong>VedaAI</strong>
    </Link>
  );
}

function NavItem({ href, icon, label, active, badge }: { href: string; icon: React.ReactNode; label: string; active?: boolean; badge?: string }) {
  return (
    <Link className={clsx("nav-item", active && "active")} href={href}>
      {icon}
      <span>{label}</span>
      {badge ? <b>{badge}</b> : null}
    </Link>
  );
}

function MobileItem({ icon, label, active }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <Link className={clsx("mobile-nav-item", active && "active")} href="/">
      {icon}
      <span>{label}</span>
    </Link>
  );
}

function SchoolCard() {
  return (
    <div className="school-card">
      <span className="school-avatar">🎓</span>
      <div>
        <strong>Delhi Public School</strong>
        <p>Bokaro Steel City</p>
      </div>
    </div>
  );
}
