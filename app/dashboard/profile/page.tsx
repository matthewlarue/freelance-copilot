'use client'

import { useState, useEffect } from 'react'

interface UserProfile {
  id: string
  skills: string | null
  categories: string | null
  minHourlyRate: number | null
  maxHourlyRate: number | null
  jobTypes: string | null
  availability: string | null
  experienceLevel: string | null
  successfulProjects: string | null
  winRate: number | null
  preferredSources: string | null
  aiSummary: string | null
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Form state
  const [skills, setSkills] = useState('')
  const [categories, setCategories] = useState('')
  const [minRate, setMinRate] = useState('')
  const [maxRate, setMaxRate] = useState('')
  const [jobTypes, setJobTypes] = useState<string[]>([])
  const [availability, setAvailability] = useState('')
  const [experienceLevel, setExperienceLevel] = useState('')
  const [preferredSources, setPreferredSources] = useState<string[]>([])

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile')
      const data = await res.json()
      if (data.success) {
        setProfile(data.data)
        // Populate form
        setSkills(data.data.skills || '')
        setCategories(data.data.categories || '')
        setMinRate(data.data.minHourlyRate?.toString() || '')
        setMaxRate(data.data.maxHourlyRate?.toString() || '')
        setJobTypes(data.data.jobTypes?.split(',').filter(Boolean) || [])
        setAvailability(data.data.availability || '')
        setExperienceLevel(data.data.experienceLevel || '')
        setPreferredSources(data.data.preferredSources?.split(',').filter(Boolean) || [])
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skills,
          categories,
          minHourlyRate: minRate ? parseFloat(minRate) : null,
          maxHourlyRate: maxRate ? parseFloat(maxRate) : null,
          jobTypes: jobTypes.join(','),
          availability,
          experienceLevel,
          preferredSources: preferredSources.join(',')
        })
      })
      
      const data = await res.json()
      if (data.success) {
        setProfile(data.data)
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (error) {
      console.error('Failed to save profile:', error)
    } finally {
      setSaving(false)
    }
  }

  const toggleJobType = (type: string) => {
    setJobTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  const toggleSource = (source: string) => {
    setPreferredSources(prev => 
      prev.includes(source) 
        ? prev.filter(s => s !== source)
        : [...prev, source]
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading profile...</div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
        <p className="text-gray-600 mt-1">
          Set your skills and preferences to get AI-powered job matches
        </p>
      </div>

      {/* Skills */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Skills</h2>
        <textarea
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          placeholder="React, TypeScript, Node.js, Python, AWS, PostgreSQL..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={3}
        />
        <p className="text-sm text-gray-500 mt-2">
          List your skills separated by commas. The more specific, the better the matches.
        </p>
      </div>

      {/* Categories */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Preferred Categories</h2>
        <input
          type="text"
          value={categories}
          onChange={(e) => setCategories(e.target.value)}
          placeholder="frontend, backend, fullstack, devops, data, mobile..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="text-sm text-gray-500 mt-2">
          Categories you prefer to work in
        </p>
      </div>

      {/* Hourly Rate */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Hourly Rate Range</h2>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Minimum</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={minRate}
                onChange={(e) => setMinRate(e.target.value)}
                placeholder="50"
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Maximum</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={maxRate}
                onChange={(e) => setMaxRate(e.target.value)}
                placeholder="150"
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Job Types */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Types</h2>
        <div className="flex gap-3">
          {['fixed', 'hourly'].map(type => (
            <button
              key={type}
              onClick={() => toggleJobType(type)}
              className={`px-4 py-2 rounded-md border ${
                jobTypes.includes(type)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Experience Level */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Experience Level</h2>
        <select
          value={experienceLevel}
          onChange={(e) => setExperienceLevel(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select level...</option>
          <option value="junior">Junior (1-2 years)</option>
          <option value="mid">Mid-Level (3-5 years)</option>
          <option value="senior">Senior (5-8 years)</option>
          <option value="expert">Expert (8+ years)</option>
        </select>
      </div>

      {/* Preferred Sources */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Preferred Job Sources</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { id: 'upwork', label: 'Upwork' },
            { id: 'linkedin', label: 'LinkedIn' },
            { id: 'toptal', label: 'Toptal' },
            { id: 'indeed', label: 'Indeed' },
            { id: 'gun', label: 'Gun.io' },
            { id: 'manual', label: 'Manual Entry' }
          ].map(source => (
            <button
              key={source.id}
              onClick={() => toggleSource(source.id)}
              className={`px-4 py-2 rounded-md border ${
                preferredSources.includes(source.id)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
              }`}
            >
              {source.label}
            </button>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Availability</h2>
        <select
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select availability...</option>
          <option value="fulltime">Full-Time</option>
          <option value="parttime">Part-Time</option>
          <option value="contract">Contract</option>
        </select>
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
        {saved && (
          <span className="text-green-600 font-medium">✓ Saved!</span>
        )}
      </div>
    </div>
  )
}
