import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import ApperIcon from '../components/ApperIcon'

const Settings = () => {
  const navigate = useNavigate()
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      sms: false
    },
    privacy: {
      publicProfile: false,
      showEmail: true,
      allowMarketing: false
    },
    appearance: {
      theme: 'light',
      language: 'en',
      timezone: 'UTC'
    },
    account: {
      twoFactor: false,
      sessionTimeout: 60
    }
  })
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('general')

  const handleSave = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Settings saved successfully')
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings to default?')) {
      setSettings({
        notifications: {
          email: true,
          push: false,
          sms: false
        },
        privacy: {
          publicProfile: false,
          showEmail: true,
          allowMarketing: false
        },
        appearance: {
          theme: 'light',
          language: 'en',
          timezone: 'UTC'
        },
        account: {
          twoFactor: false,
          sessionTimeout: 60
        }
      })
      toast.success('Settings reset to default')
    }
  }

  const tabs = [
    { id: 'general', label: 'General', icon: 'Settings' },
    { id: 'notifications', label: 'Notifications', icon: 'Bell' },
    { id: 'privacy', label: 'Privacy', icon: 'Shield' },
    { id: 'appearance', label: 'Appearance', icon: 'Palette' },
    { id: 'account', label: 'Account', icon: 'User' }
  ]

  const SettingSection = ({ title, children }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 shadow-card border border-surface-200 mb-6"
    >
      <h3 className="text-lg font-semibold text-surface-900 mb-4">{title}</h3>
      {children}
    </motion.div>
  )

  const ToggleSwitch = ({ enabled, onChange, label, description }) => (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium text-surface-900">{label}</p>
        {description && <p className="text-xs text-surface-500">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-primary' : 'bg-surface-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div>
            <SettingSection title="General Settings">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">Organization Name</label>
                  <input
                    type="text"
                    defaultValue="PulsePoint Analytics"
                    className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">Default Date Range</label>
                  <select className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20">
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 90 days</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">Time Zone</label>
                  <select 
                    value={settings.appearance.timezone}
                    onChange={(e) => setSettings({
                      ...settings,
                      appearance: { ...settings.appearance, timezone: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="UTC">UTC</option>
                    <option value="EST">Eastern Time</option>
                    <option value="PST">Pacific Time</option>
                    <option value="CST">Central Time</option>
                  </select>
                </div>
              </div>
            </SettingSection>
          </div>
        )

      case 'notifications':
        return (
          <SettingSection title="Notification Preferences">
            <div className="space-y-1">
              <ToggleSwitch
                enabled={settings.notifications.email}
                onChange={(value) => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, email: value }
                })}
                label="Email Notifications"
                description="Receive notifications via email"
              />
              <ToggleSwitch
                enabled={settings.notifications.push}
                onChange={(value) => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, push: value }
                })}
                label="Push Notifications"
                description="Receive browser push notifications"
              />
              <ToggleSwitch
                enabled={settings.notifications.sms}
                onChange={(value) => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, sms: value }
                })}
                label="SMS Notifications"
                description="Receive notifications via SMS"
              />
            </div>
          </SettingSection>
        )

      case 'privacy':
        return (
          <SettingSection title="Privacy Settings">
            <div className="space-y-1">
              <ToggleSwitch
                enabled={settings.privacy.publicProfile}
                onChange={(value) => setSettings({
                  ...settings,
                  privacy: { ...settings.privacy, publicProfile: value }
                })}
                label="Public Profile"
                description="Make your profile visible to other users"
              />
              <ToggleSwitch
                enabled={settings.privacy.showEmail}
                onChange={(value) => setSettings({
                  ...settings,
                  privacy: { ...settings.privacy, showEmail: value }
                })}
                label="Show Email"
                description="Display your email in your profile"
              />
              <ToggleSwitch
                enabled={settings.privacy.allowMarketing}
                onChange={(value) => setSettings({
                  ...settings,
                  privacy: { ...settings.privacy, allowMarketing: value }
                })}
                label="Marketing Communications"
                description="Receive marketing emails and updates"
              />
            </div>
          </SettingSection>
        )

      case 'appearance':
        return (
          <SettingSection title="Appearance Settings">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-2">Theme</label>
                <select 
                  value={settings.appearance.theme}
                  onChange={(e) => setSettings({
                    ...settings,
                    appearance: { ...settings.appearance, theme: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-2">Language</label>
                <select 
                  value={settings.appearance.language}
                  onChange={(e) => setSettings({
                    ...settings,
                    appearance: { ...settings.appearance, language: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>
            </div>
          </SettingSection>
        )

      case 'account':
        return (
          <div>
            <SettingSection title="Account Security">
              <div className="space-y-1">
                <ToggleSwitch
                  enabled={settings.account.twoFactor}
                  onChange={(value) => setSettings({
                    ...settings,
                    account: { ...settings.account, twoFactor: value }
                  })}
                  label="Two-Factor Authentication"
                  description="Add an extra layer of security to your account"
                />
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-surface-700 mb-2">Session Timeout (minutes)</label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={settings.account.sessionTimeout}
                  onChange={(e) => setSettings({
                    ...settings,
                    account: { ...settings.account, sessionTimeout: parseInt(e.target.value) || 60 }
                  })}
                  className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </SettingSection>
            
            <SettingSection title="Danger Zone">
              <div className="space-y-4">
                <button className="w-full px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">
                  Export Account Data
                </button>
                <button className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                  Delete Account
                </button>
              </div>
            </SettingSection>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 to-surface-100">
      {/* Header */}
      <div className="bg-white border-b border-surface-200 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center space-x-4 mb-2">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 hover:bg-surface-100 rounded-lg transition-colors flex items-center space-x-2 text-surface-600 hover:text-surface-900"
                >
                  <ApperIcon name="ArrowLeft" className="h-5 w-5" />
                  <span className="hidden sm:inline">Back</span>
                </button>
                <h1 className="text-2xl font-bold text-surface-900">Settings</h1>
              </div>
              <p className="text-surface-600">Manage your account preferences and application settings</p>
            </div>
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              <button
                onClick={handleReset}
                className="px-4 py-2 border border-surface-200 text-surface-600 rounded-lg hover:bg-surface-50 transition-colors"
              >
                Reset to Default
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-4 shadow-card border border-surface-200">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary text-white'
                        : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'
                    }`}
                  >
                    <ApperIcon name={tab.icon} className="h-5 w-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings