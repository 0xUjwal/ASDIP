import {
  FileText, Upload, ScrollText, Database, MessageSquare,
  History, Settings, HelpCircle,
} from 'lucide-react'

const NAV_ITEMS = [
  { id: 'text', label: 'Text', icon: FileText, desc: 'Paste & scan text' },
  { id: 'file', label: 'File Upload', icon: Upload, desc: 'PDF, DOCX, TXT' },
  { id: 'log', label: 'Log Input', icon: ScrollText, desc: 'Analyze log files' },
  { id: 'sql', label: 'SQL', icon: Database, desc: 'Query analysis' },
  { id: 'chat', label: 'Chat', icon: MessageSquare, desc: 'Live chat input' },
]

const BOTTOM_ITEMS = [
  { id: 'history', label: 'History', icon: History },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'help', label: 'Help', icon: HelpCircle },
]

export default function Sidebar({ activeTab, onTabChange, historyCount }) {
  return (
    <aside
      className="fixed left-0 top-[var(--header-h)] bottom-0 flex flex-col"
      style={{
        width: 'var(--sidebar-w)',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-color)',
      }}
    >
      {/* Section label */}
      <div className="px-4 pt-5 pb-2">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
          Input Sources
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`sidebar-item w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-colors ${
                isActive
                  ? 'active bg-blue-600/10 text-blue-400'
                  : 'text-gray-400 hover:bg-white/[0.03] hover:text-gray-200'
              }`}
            >
              <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-blue-400' : 'text-gray-500'}`} />
              <div className="min-w-0">
                <span className={`block text-sm font-medium leading-tight ${isActive ? 'text-blue-300' : ''}`}>
                  {item.label}
                </span>
                <span className="block text-[10px] text-gray-600 leading-tight mt-0.5 truncate">
                  {item.desc}
                </span>
              </div>
            </button>
          )
        })}
      </nav>

      {/* Divider */}
      <div className="mx-4 border-t border-gray-800" />

      {/* Bottom actions */}
      <div className="px-2 py-3 space-y-0.5">
        {BOTTOM_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? 'bg-blue-600/10 text-blue-300'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.03]'
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon className="w-4 h-4" />
                {item.label}
              </span>
              {item.id === 'history' && historyCount > 0 && (
                <span className="text-[10px] bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded-full">
                  {historyCount}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Version badge */}
      <div className="px-4 pb-4">
        <div className="text-[10px] text-gray-600 text-center">
          v1.0.0 &bull; Hackathon Build
        </div>
      </div>
    </aside>
  )
}
