import { ShieldCheck, Activity, Bell } from 'lucide-react'

export default function Header({ connected, unreadCount, onNotificationsClick }) {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6"
      style={{
        height: 'var(--header-h)',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-blue-600/20 flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h1 className="text-base font-semibold tracking-tight text-white leading-tight">
            AI Secure Data Intelligence Platform
          </h1>
          <p className="text-[11px] text-gray-500 leading-tight">
            Gateway &bull; Scanner &bull; Log Analyzer &bull; Risk Engine
          </p>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Activity className="w-3.5 h-3.5" />
          <span className={connected ? 'text-green-400' : 'text-red-400'}>
            {connected ? 'Backend Connected' : 'Backend Offline'}
          </span>
        </div>
        <button
          onClick={onNotificationsClick}
          className="relative w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center cursor-pointer hover:bg-gray-700 transition-colors"
        >
          <Bell className="w-4 h-4 text-gray-400" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}
