import { useState, useEffect, useCallback } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import InputPanel from './components/InputPanel'
import ResultsPanel from './components/ResultsPanel'
import LogViewer from './components/LogViewer'
import HistoryPanel from './components/HistoryPanel'
import SettingsPanel from './components/SettingsPanel'
import HelpPanel from './components/HelpPanel'
import NotificationsPanel from './components/NotificationsPanel'
import { analyzeText, analyzeFile, checkHealth } from './services/api'

const INPUT_TABS = ['text', 'file', 'log', 'sql', 'chat']
const DEFAULT_SETTINGS = {
  aiProvider: 'none',
  defaultMask: false,
  defaultBlockHighRisk: false,
  defaultLogAnalysis: true,
  maxFileSize: 10,
  theme: 'dark',
}

let notifIdCounter = 0

export default function App() {
  const [activeTab, setActiveTab] = useState('text')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastContent, setLastContent] = useState(null)
  const [connected, setConnected] = useState(false)

  // History
  const [history, setHistory] = useState([])

  // Settings
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('aisdep_settings')
      return saved ? JSON.parse(saved) : { ...DEFAULT_SETTINGS }
    } catch {
      return { ...DEFAULT_SETTINGS }
    }
  })

  // Notifications
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    checkHealth()
      .then(() => setConnected(true))
      .catch(() => setConnected(false))
  }, [])

  const addNotification = useCallback((level, title, message) => {
    const id = ++notifIdCounter
    setNotifications((prev) => [
      {
        id,
        level,
        title,
        message,
        time: new Date().toLocaleTimeString(),
        read: false,
      },
      ...prev,
    ])
  }, [])

  const handleAnalyze = async (payload) => {
    setLoading(true)
    setError(null)
    setResult(null)
    setLastContent(null)

    try {
      let data
      if (payload.type === 'file') {
        data = await analyzeFile(payload.file, payload.options)
      } else {
        data = await analyzeText(payload.content, payload.inputType, payload.options)
        setLastContent(payload.content)
      }
      setResult(data)

      // Add to history
      const label =
        payload.type === 'file'
          ? payload.file.name
          : payload.content.slice(0, 60).replace(/\n/g, ' ') + (payload.content.length > 60 ? '...' : '')
      setHistory((prev) => [
        {
          label,
          result: data,
          content: payload.type === 'file' ? null : payload.content,
          timestamp: new Date().toLocaleString(),
        },
        ...prev.slice(0, 49), // keep last 50
      ])

      // Generate notifications from findings
      if (data.risk_level === 'critical' || data.risk_level === 'high') {
        addNotification(
          data.risk_level,
          `${data.risk_level.toUpperCase()} risk detected`,
          `${data.findings.length} finding(s) — Score: ${data.risk_score}. ${data.summary}`
        )
      }
      const criticalFindings = data.findings.filter((f) => f.risk === 'critical')
      if (criticalFindings.length > 0) {
        criticalFindings.slice(0, 3).forEach((f) => {
          addNotification(
            'critical',
            `Critical: ${f.detail || f.type}`,
            `Detected at line ${f.line || '?'}: ${f.value || f.type}`
          )
        })
      }
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.message ||
        'Analysis failed. Make sure the backend server is running on port 8000.'
      setError(msg)
      addNotification('high', 'Analysis failed', msg)
    } finally {
      setLoading(false)
    }
  }

  const handleHistorySelect = (entry) => {
    setResult(entry.result)
    setLastContent(entry.content)
    setActiveTab('text') // switch back to show results
  }

  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings)
    try {
      localStorage.setItem('aisdep_settings', JSON.stringify(newSettings))
    } catch {
      // ignore storage errors
    }
  }

  const handleDismissNotif = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const handleClearNotifs = () => setNotifications([])

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const unreadCount = notifications.filter((n) => !n.read).length
  const isInputTab = INPUT_TABS.includes(activeTab)

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Header
        connected={connected}
        unreadCount={unreadCount}
        onNotificationsClick={() => setActiveTab(activeTab === 'notifications' ? 'text' : 'notifications')}
      />
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        historyCount={history.length}
      />

      {/* Main content area */}
      <main
        className="pt-[var(--header-h)]"
        style={{ marginLeft: 'var(--sidebar-w)' }}
      >
        <div className="max-w-4xl mx-auto px-6 py-6">

          {/* Input tabs — show input panel + results */}
          {isInputTab && (
            <>
              <InputPanel
                activeTab={activeTab}
                onAnalyze={handleAnalyze}
                loading={loading}
              />

              {error && (
                <div className="mt-4 card border-red-500/30 bg-red-500/5 p-4 text-sm text-red-400">
                  {error}
                </div>
              )}

              {result && (
                <>
                  <ResultsPanel result={result} />
                  {result.content_type === 'logs' && lastContent && (
                    <div className="mt-4">
                      <LogViewer content={lastContent} findings={result.findings} />
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* History */}
          {activeTab === 'history' && (
            <HistoryPanel
              history={history}
              onSelect={handleHistorySelect}
              onClear={() => setHistory([])}
            />
          )}

          {/* Settings */}
          {activeTab === 'settings' && (
            <SettingsPanel
              settings={settings}
              onSave={handleSaveSettings}
            />
          )}

          {/* Help */}
          {activeTab === 'help' && <HelpPanel />}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <NotificationsPanel
              notifications={notifications}
              onDismiss={handleDismissNotif}
              onClearAll={handleClearNotifs}
              onMarkAllRead={handleMarkAllRead}
            />
          )}
        </div>
      </main>
    </div>
  )
}
