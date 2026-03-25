import { Bell, ShieldAlert, AlertTriangle, ShieldCheck, Info, Trash2, CheckCheck } from 'lucide-react'

const ICON_MAP = {
  critical: ShieldAlert,
  high: AlertTriangle,
  medium: AlertTriangle,
  low: Info,
  info: Info,
}

export default function NotificationsPanel({ notifications, onDismiss, onClearAll, onMarkAllRead }) {
  const unread = notifications.filter((n) => !n.read).length

  if (!notifications.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Bell className="w-10 h-10 text-gray-700 mb-3" />
        <p className="text-sm text-gray-500">No notifications</p>
        <p className="text-xs text-gray-600 mt-1">
          Alerts will appear here when analyses detect issues
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Notifications</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {unread > 0 ? `${unread} unread alert(s)` : 'All caught up'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unread > 0 && (
            <button
              onClick={onMarkAllRead}
              className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 px-3 py-1.5 rounded-lg border border-blue-500/20 hover:bg-blue-500/10 transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark All Read
            </button>
          )}
          <button
            onClick={onClearAll}
            className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg border border-red-500/20 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {notifications.map((notif) => {
          const Icon = ICON_MAP[notif.level] || Info
          return (
            <div
              key={notif.id}
              className={`card p-4 flex items-start gap-3 transition-colors ${
                notif.read ? 'opacity-60' : ''
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 risk-bg-${notif.level} border`}>
                <Icon className={`w-4 h-4 risk-${notif.level}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${notif.read ? 'text-gray-400' : 'text-gray-200'}`}>
                  {notif.title}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{notif.message}</p>
                <p className="text-[10px] text-gray-600 mt-1">{notif.time}</p>
              </div>
              <button
                onClick={() => onDismiss(notif.id)}
                className="text-gray-600 hover:text-gray-400 p-1 flex-shrink-0"
                title="Dismiss"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
