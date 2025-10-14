'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import BottomNavigation from '@/components/BottomNavigation'
import { Shield, UserPlus, CheckCircle2, Search, KeyRound } from 'lucide-react'

export default function AdminUsersPage() {
  const [token, setToken] = useState('')
  const [createName, setCreateName] = useState('')
  const [createEmail, setCreateEmail] = useState('')
  const [createPhone, setCreatePhone] = useState('')
  const [createPassword, setCreatePassword] = useState('')
  const [creating, setCreating] = useState(false)
  const [createMsg, setCreateMsg] = useState<string | null>(null)

  const [verifyId, setVerifyId] = useState('')
  const [verifyEmail, setVerifyEmail] = useState(true)
  const [verifyPhone, setVerifyPhone] = useState(true)
  const [verifying, setVerifying] = useState(false)
  const [verifyMsg, setVerifyMsg] = useState<string | null>(null)

  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [searchMsg, setSearchMsg] = useState<string | null>(null)

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : ''
    if (saved) setToken(saved)
  }, [])

  useEffect(() => {
    if (!token) return
    if (typeof window !== 'undefined') localStorage.setItem('adminToken', token)
  }, [token])

  const callApi = async (path: string, init?: RequestInit) => {
    const headers = new Headers(init?.headers || {})
    headers.set('x-admin-token', token)
    headers.set('Content-Type', 'application/json')
    const resp = await fetch(path, { ...init, headers })
    const data = await resp.json().catch(() => ({}))
    if (!resp.ok) throw new Error(data?.error || 'Request failed')
    return data
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateMsg(null)
    if (!token) { setCreateMsg('Set admin token first'); return }
    if (!createEmail || !createPassword) { setCreateMsg('Email and password required'); return }
    try {
      setCreating(true)
      const data = await callApi('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify({ name: createName, email: createEmail, phone: createPhone, password: createPassword }),
      })
      const uid = data?.user?.id || 'unknown'
      setCreateMsg(`User created: ${uid}`)
      setCreateName(''); setCreateEmail(''); setCreatePhone(''); setCreatePassword('')
    } catch (e: any) {
      setCreateMsg(e?.message || 'Failed')
    } finally {
      setCreating(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setVerifyMsg(null)
    if (!token) { setVerifyMsg('Set admin token first'); return }
    if (!verifyId) { setVerifyMsg('Provide user id or email/phone in the search box then paste id'); return }
    try {
      setVerifying(true)
      const data = await callApi('/api/admin/users', {
        method: 'PATCH',
        body: JSON.stringify({ id: verifyId, email_confirm: verifyEmail, phone_confirm: verifyPhone }),
      })
      const uid = data?.user?.id || 'unknown'
      setVerifyMsg(`Updated verification for: ${uid}`)
    } catch (e: any) {
      setVerifyMsg(e?.message || 'Failed')
    } finally {
      setVerifying(false)
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setSearchMsg(null)
    if (!token) { setSearchMsg('Set admin token first'); return }
    try {
      setSearching(true)
      const data = await callApi(`/api/admin/users?q=${encodeURIComponent(query)}`)
      setResults(data?.users || [])
      setSearchMsg(`${(data?.users || []).length} users found`)
    } catch (e: any) {
      setResults([])
      setSearchMsg(e?.message || 'Failed')
    } finally {
      setSearching(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-4 pb-20 px-4 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-6 h-6 text-gray-700" />
          <h1 className="text-2xl font-bold text-gray-900">Admin • Users</h1>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <KeyRound className="w-4 h-4 text-gray-500" />
            <div className="font-medium text-gray-900">Admin Token</div>
          </div>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="Enter admin token"
          />
          <div className="text-xs text-gray-500 mt-2">Token is stored locally in your browser only.</div>
        </div>

        <form onSubmit={handleCreate} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="w-4 h-4 text-blue-600" />
            <div className="font-semibold text-gray-900">Create User</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input type="text" value={createName} onChange={e => setCreateName(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Full name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="tel" value={createPhone} onChange={e => setCreatePhone(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Phone number" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={createEmail} onChange={e => setCreateEmail(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Email address" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" value={createPassword} onChange={e => setCreatePassword(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Password" required />
            </div>
          </div>
          <button type="submit" disabled={creating} className="w-full mt-4 bg-gradient-to-r from-blue-500 to-green-500 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50">
            {creating ? 'Creating...' : 'Create User'}
          </button>
          {createMsg && <div className="mt-3 text-sm text-gray-700">{createMsg}</div>}
        </form>

        <form onSubmit={handleVerify} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <div className="font-semibold text-gray-900">Verify Email/Phone</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
              <input type="text" value={verifyId} onChange={e => setVerifyId(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Paste user id" required />
            </div>
            <div className="flex items-center gap-4">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={verifyEmail} onChange={e => setVerifyEmail(e.target.checked)} /> Email
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={verifyPhone} onChange={e => setVerifyPhone(e.target.checked)} /> Phone
              </label>
            </div>
          </div>
          <button type="submit" disabled={verifying} className="w-full mt-4 bg-green-600 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50">
            {verifying ? 'Updating...' : 'Mark as Verified'}
          </button>
          {verifyMsg && <div className="mt-3 text-sm text-gray-700">{verifyMsg}</div>}
        </form>

        <form onSubmit={handleSearch} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Search className="w-4 h-4 text-gray-600" />
            <div className="font-semibold text-gray-900">Search Users</div>
          </div>
          <div className="flex gap-3">
            <input type="text" value={query} onChange={e => setQuery(e.target.value)} className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Search by id/email/phone" />
            <button type="submit" disabled={searching} className="px-5 bg-gray-900 text-white rounded-lg font-medium hover:bg-black/90 transition-colors">
              {searching ? 'Searching...' : 'Search'}
            </button>
          </div>
          {searchMsg && <div className="mt-3 text-sm text-gray-700">{searchMsg}</div>}
          {results.length > 0 && (
            <div className="mt-4 divide-y divide-gray-100 border border-gray-100 rounded-lg overflow-hidden">
              {results.map((u) => (
                <div key={u.id} className="p-4 bg-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{u.email || 'no-email'}</div>
                      <div className="text-xs text-gray-600">{u.id}</div>
                    </div>
                    <div className="text-xs text-gray-600 text-right">
                      <div>Email: {u.email_confirmed_at ? 'verified' : 'pending'}</div>
                      <div>Phone: {u.phone_confirmed_at ? 'verified' : 'pending'}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </form>
      </div>
      <BottomNavigation />
    </div>
  )
}
