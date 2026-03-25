import { ShieldCheck, FileText, ScrollText, Database, MessageSquare, Upload, Zap, AlertTriangle } from 'lucide-react'

const SECTIONS = [
  {
    title: 'Getting Started',
    items: [
      'Select an input source from the left sidebar (Text, File, Log, SQL, Chat)',
      'Paste or upload your content in the main area',
      'Configure options (Mask Output, Block High Risk, Log Analysis)',
      'Click "Run Analysis" to scan for sensitive data and security issues',
    ],
  },
  {
    title: 'Input Sources',
    items: [
      { icon: FileText, label: 'Text', desc: 'Paste any text to scan for credentials, PII, and secrets' },
      { icon: Upload, label: 'File Upload', desc: 'Upload PDF, DOCX, TXT, or LOG files (max 10 MB)' },
      { icon: ScrollText, label: 'Log Input', desc: 'Paste log content or upload log files for deep analysis' },
      { icon: Database, label: 'SQL', desc: 'Enter SQL queries to detect injection patterns' },
      { icon: MessageSquare, label: 'Chat', desc: 'Analyze chat messages for sensitive data' },
    ],
  },
]

const DETECTIONS = [
  { label: 'Passwords & Credentials', risk: 'critical' },
  { label: 'Secret Keys & Private Keys', risk: 'critical' },
  { label: 'Credit Card Numbers', risk: 'critical' },
  { label: 'API Keys & Tokens', risk: 'high' },
  { label: 'SQL Injection Patterns', risk: 'high' },
  { label: 'Brute-Force Attacks', risk: 'high' },
  { label: 'Suspicious IP Activity', risk: 'high' },
  { label: 'Stack Traces & Error Leaks', risk: 'medium' },
  { label: 'Debug Mode Leaks', risk: 'medium' },
  { label: 'Email Addresses', risk: 'low' },
  { label: 'Phone Numbers', risk: 'low' },
]

export default function HelpPanel() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white">Help & Guide</h2>
        <p className="text-xs text-gray-500 mt-0.5">Learn how to use the AI Secure Data Intelligence Platform</p>
      </div>

      {/* About */}
      <div className="card p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">AI Secure Data Intelligence Platform</p>
            <p className="text-[11px] text-gray-500">v1.0.0 &bull; Gateway + Scanner + Log Analyzer + Risk Engine</p>
          </div>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed">
          This platform ingests multi-source data and applies regex-based pattern matching,
          log anomaly detection, risk scoring, and AI-powered insights to identify sensitive data,
          security vulnerabilities, and suspicious activity.
        </p>
      </div>

      {/* Getting Started */}
      <div>
        <h3 className="text-sm font-semibold text-gray-200 mb-2">{SECTIONS[0].title}</h3>
        <ol className="space-y-2">
          {SECTIONS[0].items.map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-xs text-gray-400">
              <span className="w-5 h-5 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      {/* Input Sources */}
      <div>
        <h3 className="text-sm font-semibold text-gray-200 mb-2">{SECTIONS[1].title}</h3>
        <div className="grid gap-2">
          {SECTIONS[1].items.map((item, i) => {
            const Icon = item.icon
            return (
              <div key={i} className="card p-3 flex items-center gap-3">
                <Icon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-gray-300">{item.label}</p>
                  <p className="text-[10px] text-gray-500">{item.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Detection Capabilities */}
      <div>
        <h3 className="text-sm font-semibold text-gray-200 mb-2 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-orange-400" />
          Detection Capabilities
        </h3>
        <div className="card overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: 'var(--bg-hover)' }}>
                <th className="px-4 py-2 text-left text-gray-500 font-semibold">Pattern</th>
                <th className="px-4 py-2 text-left text-gray-500 font-semibold">Risk Level</th>
              </tr>
            </thead>
            <tbody>
              {DETECTIONS.map((d, i) => (
                <tr key={i} className="border-t" style={{ borderColor: 'var(--border-color)' }}>
                  <td className="px-4 py-1.5 text-gray-400">{d.label}</td>
                  <td className="px-4 py-1.5">
                    <span className={`badge risk-bg-${d.risk} risk-${d.risk} border`}>{d.risk}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Keyboard shortcuts */}
      <div>
        <h3 className="text-sm font-semibold text-gray-200 mb-2 flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-400" />
          Tips
        </h3>
        <ul className="space-y-1.5 text-xs text-gray-400">
          <li>&bull; Drag and drop files directly onto the upload zone</li>
          <li>&bull; Log analysis detects brute-force when 5+ failed logins are found</li>
          <li>&bull; Enable "Mask Output" to get a redacted version of your content</li>
          <li>&bull; Set AI Provider in Settings to get LLM-powered insights</li>
          <li>&bull; Analysis history is stored in your browser session</li>
        </ul>
      </div>
    </div>
  )
}
