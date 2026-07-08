'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  MessageSquare,
  Search,
  FileText,
  FileBarChart,
  Settings,
  ChevronDown,
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/chat', label: 'Chat', icon: MessageSquare },
  { href: '/explore', label: 'Explore', icon: Search },
  { href: '/documents', label: 'Documents', icon: FileText },
  { href: '/reports', label: 'Reports', icon: FileBarChart },
  { href: '/settings', label: 'Settings', icon: Settings },
]

const folders = [
  { name: 'Fundraising', count: 12 },
  { name: 'Diligence', count: 8 },
  { name: 'Market Intel', count: 5 },
  { name: 'Portfolio X', count: 3 },
]

export function Sidebar() {
  const pathname = usePathname()
  const [foldersOpen, setFoldersOpen] = useState(true)

  return (
    <aside className="flex h-full w-64 flex-col border-r border-surface-150 bg-surface/50 backdrop-blur-xl">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-surface-150 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 shadow-glow">
          <span className="text-sm font-bold text-white">K</span>
        </div>
        <div>
          <h1 className="text-sm font-semibold text-white">Kapitali</h1>
          <p className="text-[10px] text-muted-foreground tracking-wide uppercase">Intelligence for Capital</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-surface-100 border border-transparent',
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}

        {/* Folders */}
        <div className="pt-4">
          <button
            onClick={() => setFoldersOpen(!foldersOpen)}
            className="flex w-full items-center justify-between px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider"
          >
            Folders
            <ChevronDown className={cn('h-3 w-3 transition-transform', foldersOpen && 'rotate-180')} />
          </button>
          {foldersOpen && (
            <div className="mt-1 space-y-0.5">
              {folders.map((folder) => (
                <button
                  key={folder.name}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-surface-100 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-500/60" />
                    {folder.name}
                  </span>
                  <span className="text-xs text-muted-foreground/60">{folder.count}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* User area */}
      <div className="border-t border-surface-150 p-4">
        <div className="flex items-center gap-3 rounded-lg bg-surface-100 px-3 py-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-500/20 text-xs font-medium text-brand-400">
            SK
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">Sarah Kim</p>
            <p className="text-xs text-muted-foreground truncate">sarah@fund.com</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
