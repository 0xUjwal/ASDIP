import { useState, useRef } from 'react'
import { Upload, Loader2, ShieldAlert, Eye, Lock, ScrollText } from 'lucide-react'

export default function InputPanel({ activeTab, onAnalyze, loading }) {
  const [content, setContent] = useState('')
  const [file, setFile] = useState(null)
  const [options, setOptions] = useState({
    mask: false,
    blockHighRisk: false,
    logAnalysis: true,
  })
  const fileRef = useRef()
  const dropRef = useRef()

  const PLACEHOLDERS = {
    text: 'Paste text content to scan for sensitive data, credentials, PII...',
    file: '',
    log: 'Paste log content here or upload a log file below...\n\n# Example:\n2026-03-10 10:00:01 INFO  User login email=admin@company.com\n2026-03-10 10:01:15 ERROR password=admin123\n2026-03-10 10:02:30 ERROR stack trace: NullPointerException',
    sql: 'Enter SQL queries to analyze for injection patterns...\n\n# Example:\nSELECT * FROM users WHERE id = 1; DROP TABLE users;--',
    chat: 'Type or paste chat messages to analyze for sensitive data...',
  }

  const TITLES = {
    text: 'Text Analysis',
    file: 'File Upload',
    log: 'Log Analysis',
    sql: 'SQL Analysis',
    chat: 'Chat Analysis',
  }

  const handleSubmit = () => {
    if (activeTab === 'file' || (activeTab === 'log' && file && !content.trim())) {
      onAnalyze({ type: 'file', file, options })
    } else if (content.trim()) {
      const inputType = activeTab === 'log' ? 'log' : activeTab
      onAnalyze({ type: 'text', content, inputType, options })
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    dropRef.current?.classList.remove('!border-blue-500')
    const dropped = e.dataTransfer.files[0]
    if (dropped) setFile(dropped)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    dropRef.current?.classList.add('!border-blue-500')
  }

  const handleDragLeave = () => {
    dropRef.current?.classList.remove('!border-blue-500')
  }

  const canSubmit = content.trim() || file

  return (
    <div className="space-y-5">
      {/* Page title */}
      <div>
        <h2 className="text-lg font-semibold text-white">{TITLES[activeTab]}</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          {activeTab === 'file'
            ? 'Upload documents to scan for sensitive data and security issues'
            : activeTab === 'log'
            ? 'Paste log content or upload log files for security analysis'
            : 'Enter content below to detect sensitive data, secrets, and vulnerabilities'}
        </p>
      </div>

      {/* Textarea (shown for all except pure file mode) */}
      {activeTab !== 'file' && (
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Input</span>
            <span className="text-[10px] text-gray-600">{content.length} chars</span>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={PLACEHOLDERS[activeTab]}
            rows={12}
            className="w-full bg-transparent px-4 py-3 text-sm text-gray-200 placeholder-gray-600 resize-y font-mono border-none"
            style={{ minHeight: '200px' }}
          />
        </div>
      )}

      {/* File drop zone */}
      {(activeTab === 'file' || activeTab === 'log') && (
        <div
          ref={dropRef}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileRef.current?.click()}
          className="card border-dashed !border-2 cursor-pointer hover:!border-gray-600 transition-all group"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <div className="flex flex-col items-center justify-center py-10">
            <div className="w-12 h-12 rounded-xl bg-blue-600/10 flex items-center justify-center mb-3 group-hover:bg-blue-600/20 transition-colors">
              <Upload className="w-6 h-6 text-blue-400" />
            </div>
            {file ? (
              <div className="text-center">
                <p className="text-sm font-medium text-blue-300">{file.name}</p>
                <p className="text-xs text-gray-500 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                <button
                  onClick={(e) => { e.stopPropagation(); setFile(null) }}
                  className="text-xs text-red-400 hover:text-red-300 mt-2 underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm text-gray-300">
                  Drop file here or <span className="text-blue-400 underline">browse</span>
                </p>
                <p className="text-[11px] text-gray-600 mt-1">
                  Supported: .pdf, .docx, .txt, .log &mdash; Max 10 MB
                </p>
              </div>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.docx,.doc,.txt,.log"
            className="hidden"
            onChange={(e) => setFile(e.target.files[0] || null)}
          />
        </div>
      )}

      {/* Options row */}
      <div className="flex flex-wrap items-center gap-3">
        <OptionChip
          icon={Eye}
          label="Mask Output"
          active={options.mask}
          onClick={() => setOptions({ ...options, mask: !options.mask })}
        />
        <OptionChip
          icon={Lock}
          label="Block High Risk"
          active={options.blockHighRisk}
          onClick={() => setOptions({ ...options, blockHighRisk: !options.blockHighRisk })}
        />
        <OptionChip
          icon={ScrollText}
          label="Log Analysis"
          active={options.logAnalysis}
          onClick={() => setOptions({ ...options, logAnalysis: !options.logAnalysis })}
        />
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={loading || !canSubmit}
        className={`w-full py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
          loading || !canSubmit
            ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20'
        }`}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <ShieldAlert className="w-4 h-4" />
            Run Analysis
          </>
        )}
      </button>
    </div>
  )
}

function OptionChip({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
        active
          ? 'bg-blue-600/15 border-blue-500/40 text-blue-300'
          : 'bg-transparent border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-300'
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  )
}
