import {
  AlertTriangle, ShieldAlert, ShieldCheck, Info,
  ChevronDown, ChevronUp, TrendingUp, AlertCircle,
} from 'lucide-react'
import { useState } from 'react'

const RISK_META = {
  none:     { icon: ShieldCheck, color: 'risk-none',     bg: 'risk-bg-none',     label: 'Clean' },
  low:      { icon: Info,        color: 'risk-low',      bg: 'risk-bg-low',      label: 'Low' },
  medium:   { icon: AlertCircle, color: 'risk-medium',   bg: 'risk-bg-medium',   label: 'Medium' },
  high:     { icon: AlertTriangle,color: 'risk-high',    bg: 'risk-bg-high',     label: 'High' },
  critical: { icon: ShieldAlert, color: 'risk-critical', bg: 'risk-bg-critical', label: 'Critical' },
}

const ACTION_META = {
  allowed: { label: 'Allowed', cls: 'text-green-400 bg-green-400/10' },
  masked:  { label: 'Masked',  cls: 'text-yellow-400 bg-yellow-400/10' },
  blocked: { label: 'Blocked', cls: 'text-red-400 bg-red-400/10' },
}

export default function ResultsPanel({ result }) {
  if (!result) return null

  const risk = RISK_META[result.risk_level] || RISK_META.none
  const RiskIcon = risk.icon
  const action = ACTION_META[result.action] || ACTION_META.allowed

  return (
    <div className="space-y-4 mt-6">
      {/* Top stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Risk Score" value={result.risk_score} sub={`/ ${result.risk_score >= 10 ? '10+' : '10'}`} color={risk.color} />
        <StatCard
          label="Risk Level"
          value={risk.label}
          color={risk.color}
          icon={<RiskIcon className="w-4 h-4" />}
        />
        <StatCard label="Findings" value={result.findings.length} color="text-gray-200" />
        <StatCard
          label="Action"
          value={action.label}
          color={action.cls.split(' ')[0]}
        />
      </div>

      {/* Summary banner */}
      <div className={`card border p-4 ${risk.bg}`}>
        <div className="flex items-start gap-3">
          <RiskIcon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${risk.color}`} />
          <p className="text-sm text-gray-200 leading-relaxed">{result.summary}</p>
        </div>
      </div>

      {/* Insights */}
      {result.insights?.length > 0 && <InsightsSection insights={result.insights} />}

      {/* Findings */}
      {result.findings?.length > 0 && <FindingsSection findings={result.findings} />}

      {/* Log summary */}
      {result.log_summary && <LogSummarySection data={result.log_summary} />}

      {/* Masked output */}
      {result.masked_content && <MaskedSection content={result.masked_content} />}
    </div>
  )
}

function StatCard({ label, value, sub, color, icon }) {
  return (
    <div className="card px-4 py-3">
      <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">{label}</p>
      <div className={`flex items-baseline gap-1.5 mt-1 ${color}`}>
        {icon && <span className="mt-0.5">{icon}</span>}
        <span className="text-xl font-bold">{value}</span>
        {sub && <span className="text-xs text-gray-500">{sub}</span>}
      </div>
    </div>
  )
}

function InsightsSection({ insights }) {
  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: 'var(--border-color)' }}>
        <TrendingUp className="w-4 h-4 text-blue-400" />
        <h4 className="text-sm font-semibold text-white">AI Insights</h4>
      </div>
      <div className="p-4 space-y-2">
        {insights.map((text, i) => {
          let borderCls = 'border-gray-700'
          let bgCls = ''
          if (text.startsWith('CRITICAL')) { borderCls = 'border-red-500/50'; bgCls = 'bg-red-500/5' }
          else if (text.startsWith('HIGH'))   { borderCls = 'border-orange-500/50'; bgCls = 'bg-orange-500/5' }
          else if (text.startsWith('MEDIUM')) { borderCls = 'border-yellow-500/50'; bgCls = 'bg-yellow-500/5' }
          else if (text.startsWith('LOW'))    { borderCls = 'border-blue-500/50'; bgCls = 'bg-blue-500/5' }
          else if (text.startsWith('WARNING')){ borderCls = 'border-yellow-500/50'; bgCls = 'bg-yellow-500/5' }

          return (
            <div key={i} className={`text-sm border-l-[3px] pl-3 py-2 rounded-r ${borderCls} ${bgCls} text-gray-300`}>
              {text}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function FindingsSection({ findings }) {
  const [open, setOpen] = useState(true)

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 border-b flex items-center justify-between hover:bg-white/[0.02] transition-colors"
        style={{ borderColor: 'var(--border-color)' }}
      >
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-orange-400" />
          <h4 className="text-sm font-semibold text-white">Findings ({findings.length})</h4>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
      </button>
      {open && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-500 text-left" style={{ background: 'var(--bg-hover)' }}>
                <th className="px-4 py-2 font-semibold">Type</th>
                <th className="px-4 py-2 font-semibold">Risk</th>
                <th className="px-4 py-2 font-semibold">Line</th>
                <th className="px-4 py-2 font-semibold">Value</th>
                <th className="px-4 py-2 font-semibold">Detail</th>
              </tr>
            </thead>
            <tbody>
              {findings.map((f, i) => {
                const meta = RISK_META[f.risk] || RISK_META.none
                return (
                  <tr key={i} className="border-t hover:bg-white/[0.015] transition-colors" style={{ borderColor: 'var(--border-color)' }}>
                    <td className="px-4 py-2 font-mono text-gray-300">{f.type}</td>
                    <td className="px-4 py-2">
                      <span className={`badge ${meta.bg} ${meta.color} border`}>
                        {f.risk}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-gray-500">{f.line ?? '-'}</td>
                    <td className="px-4 py-2 font-mono text-gray-400 max-w-[200px] truncate">{f.value || '-'}</td>
                    <td className="px-4 py-2 text-gray-500">{f.detail || '-'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function LogSummarySection({ data }) {
  const levels = data.log_levels || {}
  const ts = data.timestamps || {}

  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: 'var(--border-color)' }}>
        <Info className="w-4 h-4 text-purple-400" />
        <h4 className="text-sm font-semibold text-white">Log Summary</h4>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
          <MiniStat label="Total Lines" value={data.total_lines} />
          <MiniStat label="ERROR" value={(levels.ERROR || 0) + (levels.FATAL || 0) + (levels.CRITICAL || 0)} color="text-red-400" />
          <MiniStat label="WARN" value={levels.WARN || levels.WARNING || 0} color="text-yellow-400" />
          <MiniStat label="INFO" value={levels.INFO || 0} color="text-blue-400" />
          <MiniStat label="DEBUG" value={levels.DEBUG || 0} color="text-gray-400" />
        </div>
        {ts.first && (
          <p className="text-[10px] text-gray-600 mt-3">
            Time range: {ts.first} &rarr; {ts.last} ({ts.count} timestamps)
          </p>
        )}
        {data.ip_activity?.unique_count > 0 && (
          <p className="text-[10px] text-gray-600 mt-1">
            {data.ip_activity.unique_count} unique IP(s) detected
          </p>
        )}
      </div>
    </div>
  )
}

function MiniStat({ label, value, color = 'text-white' }) {
  return (
    <div className="py-2 px-3 rounded-md" style={{ background: 'var(--bg-hover)' }}>
      <p className="text-[10px] text-gray-500 font-semibold uppercase">{label}</p>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
    </div>
  )
}

function MaskedSection({ content }) {
  const [show, setShow] = useState(false)
  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setShow(!show)}
        className="w-full px-4 py-3 border-b flex items-center justify-between hover:bg-white/[0.02]"
        style={{ borderColor: 'var(--border-color)' }}
      >
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-green-400" />
          <h4 className="text-sm font-semibold text-white">Masked Output</h4>
        </div>
        {show ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
      </button>
      {show && (
        <pre className="p-4 text-xs font-mono text-gray-400 overflow-x-auto max-h-64 whitespace-pre-wrap" style={{ background: 'var(--bg-primary)' }}>
          {content}
        </pre>
      )}
    </div>
  )
}
