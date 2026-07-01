import {
  LayoutGrid,
  GalleryHorizontalEnd,
  CalendarDays,
  BookOpen,
  Library,
  ClipboardCheck,
} from "lucide-react";
import { View } from "../types";

interface SidebarProps {
  view: View;
  onNavigate: (view: View) => void;
}

const items: { id: View; label: string; icon: typeof LayoutGrid }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutGrid },
  { id: "gallery", label: "Trade Gallery", icon: GalleryHorizontalEnd },
  { id: "calendar", label: "Performance Calendar", icon: CalendarDays },
  { id: "review", label: "Daily Review", icon: ClipboardCheck },
  { id: "playbook", label: "Rules & Playbooks", icon: BookOpen },
  { id: "wiki", label: "PD Array Wiki", icon: Library },
];

export default function Sidebar({ view, onNavigate }: SidebarProps) {
  return (
    <>
      <nav className="w-56 shrink-0 border-r border-border bg-panel px-3 py-4 hidden md:flex md:flex-col gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = view === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                active
                  ? "bg-win/10 text-win"
                  : "text-muted hover:text-ink hover:bg-surface"
              }`}
            >
              <Icon size={16} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <nav className="md:hidden flex overflow-x-auto scrollbar-none gap-1.5 px-3 py-2.5 border-b border-border bg-panel shrink-0">
        {items.map((item) => {
          const Icon = item.icon;
          const active = view === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors shrink-0 ${
                active
                  ? "bg-win/15 text-win"
                  : "text-muted hover:text-ink bg-surface border border-border"
              }`}
            >
              <Icon size={13} />
              {item.label}
            </button>
          );
        })}
      </nav>
    </>
  );
}
