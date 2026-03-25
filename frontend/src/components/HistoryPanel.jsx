import { Trash2, Clock, ShieldAlert, ChevronRight, AlertTriangle, ShieldCheck } from 'lucide-react'

const RISK_ICON = {
  none: ShieldCheck,
  low: ShieldCheck,
  medium: AlertTriangle,
  high: ShieldAlert,
  critical: ShieldAlert,
}

export default function HistoryPanel({ history, onSelect, onClear }) {
  if (!history.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Clock className="w-10 h-10 text-gray-700 mb-3" />
        <p className="text-sm text-gray-500">No analysis history yet</p>
        <p className="text-xs text-gray-600 mt-1">
          Run an analysis and it will appear here
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">History</h2>
          <p className="text-xs text-gray-500 mt-0.5">{history.length} past analysis result(s)</p>
        </div>
        <button
          onClick={onClear}
          className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg border border-red-500/20 hover:bg-red-500/10 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear All
        </button>
      </div>

      <div className="space-y-2">
        {history.map((entry, i) => {
          const Icon = RISK_ICON[entry.result.risk_level] || ShieldCheck
          return (
            <button
              key={i}
              onClick={() => onSelect(entry)}
              className="card w-full text-left p-4 hover:bg-white/[0.02] transition-colors group"
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 risk-bg-${entry.result.risk_level} border`}>
                  <Icon className={`w-4 h-4 risk-${entry.result.risk_level}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-200 truncate">
                      {entry.label}
                    </span>
                    <span className={`badge risk-bg-${entry.result.risk_level} risk-${entry.result.risk_level} border`}>
                      {entry.result.risk_level}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 truncate">{entry.result.summary}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-600">
                    <span>{entry.result.findings.length} finding(s)</span>
                    <span>Score: {entry.result.risk_score}</span>
                    <span>{entry.timestamp}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 flex-shrink-0 mt-1" />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
