import { useState } from 'react'
import { Terminal, ChevronDown, ChevronUp } from 'lucide-react'

const LINE_RISK_STYLES = {
  critical: 'bg-red-500/8 border-l-[3px] border-red-500',
  high:     'bg-orange-500/8 border-l-[3px] border-orange-500',
  medium:   'bg-yellow-500/8 border-l-[3px] border-yellow-400',
  low:      'bg-blue-500/8 border-l-[3px] border-blue-400',
}

export default function LogViewer({ content, findings }) {
  const [open, setOpen] = useState(true)

  if (!content) return null

  const lines = content.split('\n')
  const findingsByLine = {}
  for (const f of findings || []) {
    if (f.line) {
      if (!findingsByLine[f.line]) findingsByLine[f.line] = []
      findingsByLine[f.line].push(f)
    }
  }

  const riskOrder = ['critical', 'high', 'medium', 'low']

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 border-b flex items-center justify-between hover:bg-white/[0.02] transition-colors"
        style={{ borderColor: 'var(--border-color)' }}
      >
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-green-400" />
          <h4 className="text-sm font-semibold text-white">Log Viewer</h4>
          <span className="text-[10px] text-gray-500">({lines.length} lines)</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
      </button>

      {open && (
        <div className="max-h-[420px] overflow-y-auto font-mono text-[11px] leading-[1.6]" style={{ background: 'var(--bg-primary)' }}>
          {lines.map((line, i) => {
            const lineNum = i + 1
            const lineFindings = findingsByLine[lineNum]
            const highestRisk = lineFindings
              ? lineFindings.reduce((max, f) => {
                  return riskOrder.indexOf(f.risk) < riskOrder.indexOf(max) ? f.risk : max
                }, 'low')
              : null

            const rowStyle = highestRisk ? LINE_RISK_STYLES[highestRisk] : ''

            return (
              <div
                key={i}
                className={`flex min-h-[22px] hover:bg-white/[0.02] ${rowStyle}`}
                title={
                  lineFindings
                    ? lineFindings.map((f) => `[${f.risk.toUpperCase()}] ${f.type}: ${f.detail || ''}`).join('\n')
                    : undefined
                }
              >
                {/* Line number */}
                <span
                  className="w-10 flex-shrink-0 text-right pr-2 select-none text-gray-600 border-r"
                  style={{ borderColor: 'var(--border-color)' }}
                >
                  {lineNum}
                </span>

                {/* Content */}
                <span className="flex-1 px-3 whitespace-pre-wrap break-all text-gray-400">
                  {line || '\u00A0'}
                </span>

                {/* Risk tags */}
                {lineFindings && (
                  <span className="flex-shrink-0 flex items-center gap-1 pr-3">
                    {lineFindings.map((f, j) => (
                      <span
                        key={j}
                        className={`badge risk-bg-${f.risk} risk-${f.risk} border`}
                      >
                        {f.type}
                      </span>
                    ))}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
