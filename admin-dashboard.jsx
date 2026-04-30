/**
 * AI Sales Agent Admin Dashboard
 * 
 * This is a React component that provides store owners with:
 * - Lead management and export
 * - Analytics and conversion tracking
 * - Store settings and configuration
 * - Plan management
 * 
 * Installation:
 * 1. Copy this file to your React project
 * 2. Install dependencies: npm install recharts lucide-react
 * 3. Import and use: <AdminDashboard shop="store.myshopify.com" />
 */

import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
  Download, Settings, Users, TrendingUp, MessageSquare,
  Mail, Phone, Calendar, ArrowRight
} from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'https://ai-chat-backend-c3y7.onrender.com';

export default function AdminDashboard({ shop }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState(null);
  const [leads, setLeads] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20 });

  // Fetch analytics
  useEffect(() => {
    fetchAnalytics();
    fetchSettings();
  }, [shop]);

  // Fetch leads when tab changes or pagination changes
  useEffect(() => {
    if (activeTab === 'leads') {
      fetchLeads();
    }
  }, [activeTab, pagination]);

  async function fetchAnalytics() {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}/api/admin/analytics?shop=${shop}&days=30`
      );
      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      setError('Failed to load analytics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchLeads() {
    try {
      const response = await fetch(
        `${API_URL}/api/admin/leads?shop=${shop}&page=${pagination.page}&limit=${pagination.limit}`
      );
      const data = await response.json();
      setLeads(data.leads);
      setPagination(prev => ({ ...prev, total: data.pagination.total }));
    } catch (err) {
      setError('Failed to load leads');
      console.error(err);
    }
  }

  async function fetchSettings() {
    try {
      const response = await fetch(`${API_URL}/api/admin/settings?shop=${shop}`);
      const data = await response.json();
      setSettings(data);
    } catch (err) {
      console.error('Failed to load settings', err);
    }
  }

  async function exportLeads() {
    try {
      const response = await fetch(`${API_URL}/api/admin/leads/export?shop=${shop}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads-${shop}-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } catch (err) {
      setError('Failed to export leads');
      console.error(err);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Sales Agent</h1>
              <p className="text-gray-600 text-sm mt-1">{shop}</p>
            </div>
            <div className="flex gap-4">
              {settings?.plan === 'free' && (
                <a
                  href={`${API_URL}/create-charge?shop=${shop}`}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition"
                >
                  Upgrade to Pro
                </a>
              )}
              <button
                onClick={() => setActiveTab('settings')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <Settings size={24} className="text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'leads', label: 'Leads', icon: Users },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && analytics && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Total Leads"
                value={analytics.metrics.totalLeads}
                icon={Users}
                color="blue"
              />
              <MetricCard
                title="Total Chats"
                value={analytics.metrics.totalChats}
                icon={MessageSquare}
                color="purple"
              />
              <MetricCard
                title="Conversion Rate"
                value={analytics.metrics.conversionRate}
                icon={TrendingUp}
                color="green"
              />
              <MetricCard
                title="Plan"
                value={analytics.metrics.plan.toUpperCase()}
                icon={Settings}
                color={analytics.metrics.plan === 'paid' ? 'gold' : 'gray'}
              />
            </div>

            {/* Lead Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Leads with Email</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {analytics.metrics.leadsWithEmail}
                    </p>
                  </div>
                  <Mail size={32} className="text-blue-500 opacity-20" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Leads with Phone</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {analytics.metrics.leadsWithPhone}
                    </p>
                  </div>
                  <Phone size={32} className="text-green-500 opacity-20" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Messages Used</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {analytics.metrics.messagesUsed}
                    </p>
                  </div>
                  <MessageSquare size={32} className="text-purple-500 opacity-20" />
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Leads Over Time */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Leads Over Time</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={Object.entries(analytics.leadsOverTime).map(([date, count]) => ({
                    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    leads: count
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="leads" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Chats Over Time */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Chats Over Time</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={Object.entries(analytics.chatsOverTime).map(([date, count]) => ({
                    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    chats: count
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="chats" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Leads Tab */}
        {activeTab === 'leads' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Captured Leads</h2>
              <button
                onClick={exportLeads}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Download size={18} />
                Export CSV
              </button>
            </div>

            {/* Leads Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {leads.length > 0 ? (
                      leads.map(lead => (
                        <tr key={lead.id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4 text-sm text-gray-900">{lead.name || '-'}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{lead.email || '-'}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{lead.phone || '-'}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(lead.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                          No leads yet. Start chatting with customers!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.total > pagination.limit && (
                <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                  <button
                    onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
                  </span>
                  <button
                    onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                    disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && settings && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Store Settings</h2>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="space-y-6">
                {/* Plan Info */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Plan</label>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                    <div>
                      <p className="text-lg font-bold text-gray-900">{settings.plan.toUpperCase()}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {settings.messagesLimit === 'unlimited'
                          ? 'Unlimited messages per month'
                          : `${settings.messagesLimit} messages per month`}
                      </p>
                    </div>
                    {settings.plan === 'free' && (
                      <a
                        href={`${API_URL}/create-charge?shop=${shop}`}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                      >
                        Upgrade
                      </a>
                    )}
                  </div>
                </div>

                {/* Messages Usage */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Messages Used</label>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${settings.plan === 'free'
                          ? (settings.messagesUsed / 50) * 100
                          : 0
                        }%`
                      }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {settings.messagesUsed} / {settings.messagesLimit}
                  </p>
                </div>

                {/* API Key */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="password"
                      value={settings.apiKey || '••••••••••••••••'}
                      readOnly
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 font-mono text-sm"
                    />
                    <button
                      onClick={() => navigator.clipboard.writeText(settings.apiKey)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                {/* Installed Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Installed</label>
                  <p className="text-gray-600">
                    {new Date(settings.installedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Metric Card Component
function MetricCard({ title, value, icon: Icon, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
    gold: 'bg-yellow-50 text-yellow-600',
    gray: 'bg-gray-50 text-gray-600'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}
