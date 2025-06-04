import { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import ApperIcon from '../components/ApperIcon'

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile')
  const [settings, setSettings] = useState({
    profile: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      company: 'PulsePoint Analytics',
      phone: '+1 (555) 123-4567',
      timezone: 'America/New_York',
      avatar: ''
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      feedbackAlerts: true,
      reportGeneration: true,
      weeklyDigest: true,
      newClientAlerts: false
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: '30',
      passwordRequirements: true,
      loginAlerts: true
    },
    preferences: {
      theme: 'light',
      language: 'en',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12',
      defaultDashboard: 'analytics',
      itemsPerPage: '20'
    },
    integrations: {
      slackWebhook: '',
      emailProvider: 'smtp',
      apiKeys: []
    }
  })

  const tabs = [
    { id: 'profile', label: 'Profile', icon: 'User' },
    { id: 'notifications', label: 'Notifications', icon: 'Bell' },
    { id: 'security', label: 'Security', icon: 'Shield' },
    { id: 'preferences', label: 'Preferences', icon: 'Settings' },
    { id: 'integrations', label: 'Integrations', icon: 'Zap' },
    { id: 'data', label: 'Data Management', icon: 'Database' }
  ]

  const handleSaveSettings = (section) => {
    toast.success(`${section.charAt(0).toUpperCase() + section.slice(1)} settings saved successfully`)
  }

  const handleResetSection = (section) => {
    if (window.confirm('Are you sure you want to reset this section to default values?')) {
      toast.info(`${section.charAt(0).toUpperCase() + section.slice(1)} settings reset to defaults`)
    }
  }

  const ProfileSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-6">
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {settings.profile.name.charAt(0)}
          </div>
          <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full shadow-lg border-2 border-surface-200 flex items-center justify-center hover:bg-surface-50 transition-colors">
            <ApperIcon name="Camera" className="h-4 w-4 text-surface-600" />
          </button>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-surface-900">Profile Picture</h3>
          <p className="text-surface-600">Upload a new profile picture</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-2">Full Name</label>
          <input
            type="text"
            value={settings.profile.name}
            onChange={(e) => setSettings({
              ...settings,
              profile: { ...settings.profile, name: e.target.value }
            })}
            className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-700 mb-2">Email Address</label>
          <input
            type="email"
            value={settings.profile.email}
            onChange={(e) => setSettings({
              ...settings,
              profile: { ...settings.profile, email: e.target.value }
            })}
            className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-700 mb-2">Company</label>
          <input
            type="text"
            value={settings.profile.company}
            onChange={(e) => setSettings({
              ...settings,
              profile: { ...settings.profile, company: e.target.value }
            })}
            className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-700 mb-2">Phone Number</label>
          <input
            type="tel"
            value={settings.profile.phone}
            onChange={(e) => setSettings({
              ...settings,
              profile: { ...settings.profile, phone: e.target.value }
            })}
            className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-surface-700 mb-2">Timezone</label>
          <select
            value={settings.profile.timezone}
            onChange={(e) => setSettings({
              ...settings,
              profile: { ...settings.profile, timezone: e.target.value }
            })}
            className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="America/New_York">Eastern Time (ET)</option>
            <option value="America/Chicago">Central Time (CT)</option>
            <option value="America/Denver">Mountain Time (MT)</option>
            <option value="America/Los_Angeles">Pacific Time (PT)</option>
            <option value="UTC">UTC</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          onClick={() => handleResetSection('profile')}
          className="px-4 py-2 text-surface-600 hover:text-surface-900 transition-colors"
        >
          Reset
        </button>
        <button
          onClick={() => handleSaveSettings('profile')}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          Save Changes
        </button>
      </div>
    </div>
  )

  const NotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-surface-900 mb-4">Email Notifications</h3>
        <div className="space-y-4">
          {Object.entries(settings.notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <h4 className="text-surface-900 font-medium">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </h4>
                <p className="text-surface-600 text-sm">
                  {key === 'emailNotifications' && 'Receive notifications via email'}
                  {key === 'pushNotifications' && 'Receive push notifications in browser'}
                  {key === 'feedbackAlerts' && 'Get notified when new feedback is received'}
                  {key === 'reportGeneration' && 'Notifications when reports are generated'}
                  {key === 'weeklyDigest' && 'Weekly summary of platform activity'}
                  {key === 'newClientAlerts' && 'Alerts when new clients are added'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, [key]: e.target.checked }
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-surface-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          onClick={() => handleResetSection('notifications')}
          className="px-4 py-2 text-surface-600 hover:text-surface-900 transition-colors"
        >
          Reset
        </button>
        <button
          onClick={() => handleSaveSettings('notifications')}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          Save Changes
        </button>
      </div>
    </div>
  )

  const SecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-surface-900 mb-4">Account Security</h3>
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-surface-50 rounded-lg">
            <div>
              <h4 className="text-surface-900 font-medium">Two-Factor Authentication</h4>
              <p className="text-surface-600 text-sm">Add an extra layer of security to your account</p>
            </div>
            <div className="flex items-center space-x-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.security.twoFactorAuth}
                  onChange={(e) => setSettings({
                    ...settings,
                    security: { ...settings.security, twoFactorAuth: e.target.checked }
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-surface-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
              {settings.security.twoFactorAuth && (
                <button className="px-3 py-1 bg-primary text-white rounded text-sm hover:bg-primary-dark transition-colors">
                  Configure
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 mb-2">Session Timeout (minutes)</label>
            <select
              value={settings.security.sessionTimeout}
              onChange={(e) => setSettings({
                ...settings,
                security: { ...settings.security, sessionTimeout: e.target.value }
              })}
              className="w-full md:w-48 px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="120">2 hours</option>
              <option value="0">Never</option>
            </select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-surface-900 font-medium">Strong Password Requirements</h4>
                <p className="text-surface-600 text-sm">Enforce strong password policies</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.security.passwordRequirements}
                  onChange={(e) => setSettings({
                    ...settings,
                    security: { ...settings.security, passwordRequirements: e.target.checked }
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-surface-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-surface-900 font-medium">Login Alerts</h4>
                <p className="text-surface-600 text-sm">Get notified of unusual login activity</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.security.loginAlerts}
                  onChange={(e) => setSettings({
                    ...settings,
                    security: { ...settings.security, loginAlerts: e.target.checked }
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-surface-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <ApperIcon name="AlertTriangle" className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="text-yellow-800 font-medium">Password Change</h4>
            <p className="text-yellow-700 text-sm mb-3">
              It's recommended to change your password regularly for better security.
            </p>
            <button className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 transition-colors">
              Change Password
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          onClick={() => handleResetSection('security')}
          className="px-4 py-2 text-surface-600 hover:text-surface-900 transition-colors"
        >
          Reset
        </button>
        <button
          onClick={() => handleSaveSettings('security')}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          Save Changes
        </button>
      </div>
    </div>
  )

  const PreferencesSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-2">Theme</label>
          <select
            value={settings.preferences.theme}
            onChange={(e) => setSettings({
              ...settings,
              preferences: { ...settings.preferences, theme: e.target.value }
            })}
            className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-700 mb-2">Language</label>
          <select
            value={settings.preferences.language}
            onChange={(e) => setSettings({
              ...settings,
              preferences: { ...settings.preferences, language: e.target.value }
            })}
            className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-700 mb-2">Date Format</label>
          <select
            value={settings.preferences.dateFormat}
            onChange={(e) => setSettings({
              ...settings,
              preferences: { ...settings.preferences, dateFormat: e.target.value }
            })}
            className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-700 mb-2">Time Format</label>
          <select
            value={settings.preferences.timeFormat}
            onChange={(e) => setSettings({
              ...settings,
              preferences: { ...settings.preferences, timeFormat: e.target.value }
            })}
            className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="12">12-hour</option>
            <option value="24">24-hour</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-700 mb-2">Default Dashboard</label>
          <select
            value={settings.preferences.defaultDashboard}
            onChange={(e) => setSettings({
              ...settings,
              preferences: { ...settings.preferences, defaultDashboard: e.target.value }
            })}
            className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="analytics">Analytics</option>
            <option value="feedback">Feedback Forms</option>
            <option value="clients">Clients</option>
            <option value="reports">Reports</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-700 mb-2">Items Per Page</label>
          <select
            value={settings.preferences.itemsPerPage}
            onChange={(e) => setSettings({
              ...settings,
              preferences: { ...settings.preferences, itemsPerPage: e.target.value }
            })}
            className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          onClick={() => handleResetSection('preferences')}
          className="px-4 py-2 text-surface-600 hover:text-surface-900 transition-colors"
        >
          Reset
        </button>
        <button
          onClick={() => handleSaveSettings('preferences')}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          Save Changes
        </button>
      </div>
    </div>
  )

  const IntegrationsSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-surface-900 mb-4">Third-party Integrations</h3>
        
        <div className="space-y-4">
          <div className="p-4 border border-surface-200 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
                  <ApperIcon name="MessageSquare" className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-surface-900">Slack Integration</h4>
                  <p className="text-sm text-surface-600">Send notifications to Slack channels</p>
                </div>
              </div>
              <button className="px-3 py-1 bg-secondary text-white rounded text-sm hover:bg-secondary-dark transition-colors">
                Configure
              </button>
            </div>
            <input
              type="url"
              value={settings.integrations.slackWebhook}
              onChange={(e) => setSettings({
                ...settings,
                integrations: { ...settings.integrations, slackWebhook: e.target.value }
              })}
              placeholder="Enter Slack webhook URL"
              className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="p-4 border border-surface-200 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                  <ApperIcon name="Mail" className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-surface-900">Email Provider</h4>
                  <p className="text-sm text-surface-600">Configure email service settings</p>
                </div>
              </div>
              <select
                value={settings.integrations.emailProvider}
                onChange={(e) => setSettings({
                  ...settings,
                  integrations: { ...settings.integrations, emailProvider: e.target.value }
                })}
                className="px-3 py-1 border border-surface-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="smtp">SMTP</option>
                <option value="sendgrid">SendGrid</option>
                <option value="mailgun">Mailgun</option>
                <option value="ses">Amazon SES</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-surface-900 mb-4">API Keys</h3>
        <div className="bg-surface-50 border border-surface-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-medium text-surface-900">API Access</h4>
              <p className="text-sm text-surface-600">Manage API keys for external integrations</p>
            </div>
            <button className="px-3 py-1 bg-primary text-white rounded text-sm hover:bg-primary-dark transition-colors">
              Generate New Key
            </button>
          </div>
          <div className="text-sm text-surface-500">
            No API keys configured yet
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          onClick={() => handleResetSection('integrations')}
          className="px-4 py-2 text-surface-600 hover:text-surface-900 transition-colors"
        >
          Reset
        </button>
        <button
          onClick={() => handleSaveSettings('integrations')}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          Save Changes
        </button>
      </div>
    </div>
  )

  const DataManagementSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-surface-900 mb-4">Data Export</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="p-4 border border-surface-200 rounded-lg hover:bg-surface-50 transition-colors text-left">
            <div className="flex items-center space-x-3 mb-2">
              <ApperIcon name="Download" className="h-5 w-5 text-primary" />
              <h4 className="font-medium text-surface-900">Export All Data</h4>
            </div>
            <p className="text-sm text-surface-600">Download a complete backup of your data</p>
          </button>

          <button className="p-4 border border-surface-200 rounded-lg hover:bg-surface-50 transition-colors text-left">
            <div className="flex items-center space-x-3 mb-2">
              <ApperIcon name="FileText" className="h-5 w-5 text-secondary" />
              <h4 className="font-medium text-surface-900">Export Reports</h4>
            </div>
            <p className="text-sm text-surface-600">Download all generated reports</p>
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-surface-900 mb-4">Data Retention</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-2">Feedback Data Retention (months)</label>
            <select className="w-full md:w-48 px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20">
              <option value="12">12 months</option>
              <option value="24">24 months</option>
              <option value="36">36 months</option>
              <option value="0">Indefinite</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 mb-2">Report Data Retention (months)</label>
            <select className="w-full md:w-48 px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20">
              <option value="6">6 months</option>
              <option value="12">12 months</option>
              <option value="24">24 months</option>
              <option value="0">Indefinite</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <ApperIcon name="AlertTriangle" className="h-5 w-5 text-red-600 mt-0.5" />
          <div>
            <h4 className="text-red-800 font-medium">Danger Zone</h4>
            <p className="text-red-700 text-sm mb-3">
              These actions are permanent and cannot be undone.
            </p>
            <div className="space-y-2">
              <button className="block px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors">
                Delete All Feedback Data
              </button>
              <button className="block px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          onClick={() => handleSaveSettings('data')}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          Save Changes
        </button>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'profile': return <ProfileSettings />
      case 'notifications': return <NotificationSettings />
      case 'security': return <SecuritySettings />
      case 'preferences': return <PreferencesSettings />
      case 'integrations': return <IntegrationsSettings />
      case 'data': return <DataManagementSettings />
      default: return <ProfileSettings />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 to-surface-100">
      {/* Header */}
      <div className="bg-white border-b border-surface-200 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-surface-900 mb-2">Settings</h1>
          <p className="text-surface-600">Manage your account settings and preferences</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-64">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary text-white'
                      : 'text-surface-700 hover:bg-surface-100'
                  }`}
                >
                  <ApperIcon name={tab.icon} className="h-5 w-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl shadow-card border border-surface-200 p-6"
            >
              <h2 className="text-xl font-semibold text-surface-900 mb-6">
                {tabs.find(tab => tab.id === activeTab)?.label}
              </h2>
              {renderContent()}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings