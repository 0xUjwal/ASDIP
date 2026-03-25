import { Save, RotateCcw, Eye, EyeOff, Cpu, Sparkles, Bot, KeyRound, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'

const DEFAULT_SETTINGS = {
  aiProvider: 'none',
  openaiKey: '',
  anthropicKey: '',
  defaultMask: false,
  defaultBlockHighRisk: false,
  defaultLogAnalysis: true,
  maxFileSize: 10,
  theme: 'dark',
}

const PROVIDERS = [
  {
    id: 'none',
    label: 'Rule-Based',
    desc: 'Built-in heuristic engine. No API key required.',
    icon: Cpu,
    color: 'emerald',
  },
  {
    id: 'openai',
    label: 'OpenAI',
    desc: 'GPT-4o-mini for advanced insight generation.',
    icon: Sparkles,
    color: 'green',
    keyField: 'openaiKey',
    keyPlaceholder: 'sk-...',
    keyLabel: 'OpenAI API Key',
    keyLink: 'https://platform.openai.com/api-keys',
    keyLinkLabel: 'Get your key at platform.openai.com',
  },
  {
    id: 'anthropic',
    label: 'Anthropic',
    desc: 'Claude Haiku for fast, accurate analysis.',
    icon: Bot,
    color: 'orange',
    keyField: 'anthropicKey',
    keyPlaceholder: 'sk-ant-...',
    keyLabel: 'Anthropic API Key',
    keyLink: 'https://console.anthropic.com/settings/keys',
    keyLinkLabel: 'Get your key at console.anthropic.com',
  },
]

const COLOR_MAP = {
  emerald: {
    activeBorder: 'border-emerald-500/60',
    activeBg: 'bg-emerald-500/8',
    activeText: 'text-emerald-300',
    iconBg: 'bg-emerald-500/15',
    iconText: 'text-emerald-400',
    ring: 'ring-emerald-500/30',
  },
  green: {
    activeBorder: 'border-green-500/60',
    activeBg: 'bg-green-500/8',
    activeText: 'text-green-300',
    iconBg: 'bg-green-500/15',
    iconText: 'text-green-400',
    ring: 'ring-green-500/30',
  },
  orange: {
    activeBorder: 'border-orange-500/60',
    activeBg: 'bg-orange-500/8',
    activeText: 'text-orange-300',
    iconBg: 'bg-orange-500/15',
    iconText: 'text-orange-400',
    ring: 'ring-orange-500/30',
  },
}

export default function SettingsPanel({ settings, onSave }) {
  const [local, setLocal] = useState({ ...DEFAULT_SETTINGS, ...settings })
  const [saved, setSaved] = useState(false)
  const [showKeys, setShowKeys] = useState({})

  const update = (key, value) => {
    setLocal((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  const handleSave = () => {
    onSave(local)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleReset = () => {
    setLocal({ ...DEFAULT_SETTINGS })
    setShowKeys({})
    setSaved(false)
  }

  const toggleShowKey = (field) => {
    setShowKeys((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const selectedProvider = PROVIDERS.find((p) => p.id === local.aiProvider)

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-white">Settings</h2>
        <p className="text-xs text-gray-500 mt-0.5">Configure platform behavior and defaults</p>
      </div>

      {/* ── AI Provider Selection ── */}
      <Section title="AI Provider" desc="Select how the platform generates security insights">
        <div className="space-y-3">
          {PROVIDERS.map((provider) => {
            const Icon = provider.icon
            const isSelected = local.aiProvider === provider.id
            const colors = COLOR_MAP[provider.color]
            const hasKey = provider.keyField ? (local[provider.keyField] || '').trim().length > 0 : true

            return (
              <div key={provider.id}>
                {/* Provider card */}
                <button
                  onClick={() => update('aiProvider', provider.id)}
                  className={`w-full text-left rounded-lg border p-4 transition-all ${
                    isSelected
                      ? `${colors.activeBorder} ${colors.activeBg} ring-1 ${colors.ring}`
                      : 'border-[var(--border-color)] hover:border-gray-600 hover:bg-white/[0.015]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Radio circle */}
                    <div
                      className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        isSelected ? colors.activeBorder : 'border-gray-600'
                      }`}
                    >
                      {isSelected && (
                        <div className={`w-2.5 h-2.5 rounded-full ${colors.iconBg.replace('/15', '')}`} />
                      )}
                    </div>

                    {/* Icon */}
                    <div className={`w-9 h-9 rounded-lg ${colors.iconBg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-[18px] h-[18px] ${colors.iconText}`} />
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${isSelected ? colors.activeText : 'text-gray-200'}`}>
                          {provider.label}
                        </span>
                        {isSelected && provider.keyField && hasKey && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">{provider.desc}</p>
                    </div>
                  </div>
                </button>

                {/* API Key input — shown inline when this provider is selected */}
                {isSelected && provider.keyField && (
                  <div
                    className={`mt-0 ml-4 mr-0 border-l-2 pl-5 py-4 ${colors.activeBorder} transition-all`}
                  >
                    <label className="text-xs font-medium text-gray-300 mb-1.5 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-gray-500" />
                      {provider.keyLabel}
                    </label>
                    <div className="relative">
                      <input
                        type={showKeys[provider.keyField] ? 'text' : 'password'}
                        value={local[provider.keyField] || ''}
                        onChange={(e) => update(provider.keyField, e.target.value)}
                        placeholder={provider.keyPlaceholder}
                        spellCheck={false}
                        autoComplete="off"
                        className="w-full bg-[var(--bg-primary)] border rounded-lg px-3 py-2.5 pr-10 text-sm text-gray-200 font-mono placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
                        style={{ borderColor: 'var(--border-color)' }}
                      />
                      <button
                        type="button"
                        onClick={() => toggleShowKey(provider.keyField)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                        title={showKeys[provider.keyField] ? 'Hide key' : 'Show key'}
                      >
                        {showKeys[provider.keyField]
                          ? <EyeOff className="w-4 h-4" />
                          : <Eye className="w-4 h-4" />
                        }
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-600 mt-2">
                      Your key is stored locally in your browser and sent only to the backend server.{' '}
                      <a
                        href={provider.keyLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${colors.iconText} hover:underline`}
                      >
                        {provider.keyLinkLabel} &rarr;
                      </a>
                    </p>
                    {!hasKey && (
                      <p className="text-[11px] text-yellow-500/80 mt-1.5 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 inline-block" />
                        API key required to use {provider.label} insights
                      </p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Section>

      {/* ── Default Options ── */}
      <Section title="Default Analysis Options" desc="Applied to new analyses by default">
        <div className="space-y-3">
          <Toggle
            label="Mask sensitive data"
            desc="Replace detected secrets with asterisks in output"
            checked={local.defaultMask}
            onChange={(v) => update('defaultMask', v)}
          />
          <Toggle
            label="Block high risk content"
            desc="Reject content classified as high or critical risk"
            checked={local.defaultBlockHighRisk}
            onChange={(v) => update('defaultBlockHighRisk', v)}
          />
          <Toggle
            label="Enable log analysis"
            desc="Run log-specific detection (brute-force, IP analysis)"
            checked={local.defaultLogAnalysis}
            onChange={(v) => update('defaultLogAnalysis', v)}
          />
        </div>
      </Section>

      {/* ── File Upload ── */}
      <Section title="File Upload" desc="Constraints for file-based analysis">
        <div>
          <label className="text-xs text-gray-400 block mb-1.5">Max file size (MB)</label>
          <input
            type="number"
            min={1}
            max={50}
            value={local.maxFileSize}
            onChange={(e) => update('maxFileSize', parseInt(e.target.value) || 10)}
            className="w-24 bg-transparent border rounded-md px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
            style={{ borderColor: 'var(--border-color)' }}
          />
        </div>
      </Section>

      {/* ── Actions ── */}
      <div className="flex items-center gap-3 pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            saved
              ? 'bg-green-600 text-white'
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20'
          }`}
        >
          {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg border text-gray-400 hover:text-gray-200 hover:bg-white/[0.03] text-sm transition-colors"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <RotateCcw className="w-4 h-4" />
          Reset Defaults
        </button>
      </div>
    </div>
  )
}

function Section({ title, desc, children }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-200">{title}</h3>
      {desc && <p className="text-[11px] text-gray-500 mt-0.5 mb-3">{desc}</p>}
      {children}
    </div>
  )
}

function Toggle({ label, desc, checked, onChange }) {
  return (
    <div
      className="flex items-start gap-3 cursor-pointer group"
      onClick={() => onChange(!checked)}
    >
      <div
        className={`relative mt-0.5 w-9 h-5 rounded-full flex-shrink-0 transition-colors ${
          checked ? 'bg-blue-600' : 'bg-gray-700'
        }`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
            checked ? 'left-[18px]' : 'left-0.5'
          }`}
        />
      </div>
      <div>
        <p className="text-sm text-gray-300 group-hover:text-gray-100 transition-colors">{label}</p>
        {desc && <p className="text-[10px] text-gray-600 mt-0.5">{desc}</p>}
      </div>
    </div>
  )
}
