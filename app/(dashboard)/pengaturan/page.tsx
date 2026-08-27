'use client'

import { useState } from 'react'
import AppShell from '@/components/layout/AppShell'
import {
  User, Mail, Lock, Eye, EyeOff,
  CheckCircle2, AlertTriangle, Save, Camera,
} from 'lucide-react'
import { useLang } from '@/lib/i18n/context'

export default function PengaturanPage() {
  const { lang } = useLang()

  const [name,        setName]        = useState('Administrator')
  const [email,       setEmail]       = useState('admin@filtrazon.local')
  const [currentPw,   setCurrentPw]   = useState('')
  const [newPw,       setNewPw]       = useState('')
  const [confirmPw,   setConfirmPw]   = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew,     setShowNew]     = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [saving,      setSaving]      = useState(false)
  const [saved,       setSaved]       = useState(false)
  const [pwError,     setPwError]     = useState('')

  const T = {
    title:       { id: 'Profil Admin',              en: 'Admin Profile'           },
    subtitle:    { id: 'Kelola informasi akun Anda', en: 'Manage your account info'},
    avatar:      { id: 'Foto Profil',               en: 'Profile Photo'           },
    avatarHint:  { id: 'Klik untuk ganti foto',     en: 'Click to change photo'   },
    infoSection: { id: 'Informasi Akun',            en: 'Account Information'     },
    nameLabel:   { id: 'Nama Lengkap',              en: 'Full Name'               },
    emailLabel:  { id: 'Email',                     en: 'Email'                   },
    roleLabel:   { id: 'Role',                      en: 'Role'                    },
    pwSection:   { id: 'Ganti Password',            en: 'Change Password'         },
    currentPw:   { id: 'Password Saat Ini',         en: 'Current Password'        },
    newPw:       { id: 'Password Baru',             en: 'New Password'            },
    confirmPw:   { id: 'Konfirmasi Password',       en: 'Confirm Password'        },
    pwHint:      { id: 'Minimal 8 karakter',        en: 'Minimum 8 characters'    },
    pwMismatch:  { id: 'Password baru tidak cocok', en: 'New passwords do not match'},
    pwTooShort:  { id: 'Password terlalu pendek',   en: 'Password too short'      },
    save:        { id: 'Simpan Perubahan',           en: 'Save Changes'            },
    saving:      { id: 'Menyimpan...',              en: 'Saving...'               },
    savedMsg:    { id: 'Perubahan berhasil disimpan!', en: 'Changes saved successfully!' },
    leaveBlank:  { id: 'Kosongkan jika tidak ingin mengubah password', en: 'Leave blank if you do not want to change password' },
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setPwError('')

    // Validate password if filled
    if (newPw || confirmPw || currentPw) {
      if (newPw.length > 0 && newPw.length < 8) {
        setPwError(T.pwTooShort[lang]); return
      }
      if (newPw !== confirmPw) {
        setPwError(T.pwMismatch[lang]); return
      }
    }

    setSaving(true)
    // Simulate API call
    setTimeout(() => {
      setSaving(false)
      setSaved(true)
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
      setTimeout(() => setSaved(false), 3000)
    }, 800)
  }

  return (
    <AppShell>
      <div className="px-4 md:px-6 pt-5 pb-8 max-w-lg mx-auto space-y-5">

        {/* Header */}
        <div>
          <h1 className="text-lg font-bold text-[#15324A]">{T.title[lang]}</h1>
          <p className="text-xs text-gray-400 mt-0.5">{T.subtitle[lang]}</p>
        </div>

        {/* Success message */}
        {saved && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-50 border border-green-200">
            <CheckCircle2 size={16} className="text-green-600 shrink-0" />
            <p className="text-sm font-semibold text-green-700">{T.savedMsg[lang]}</p>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">

          {/* ── Avatar section ── */}
          <div className="card p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">
              {T.avatar[lang]}
            </p>
            <div className="flex items-center gap-5">
              {/* Avatar circle */}
              <div className="relative shrink-0">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#E3F2FD] to-[#BBDEFB] border-2 border-[#90CAF9] flex items-center justify-center">
                  <User size={36} className="text-[#1565C0]" />
                </div>
                {/* Upload button overlay */}
                <label
                  htmlFor="avatar-upload"
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#0077B6] border-2 border-white flex items-center justify-center cursor-pointer hover:bg-[#0096C7] transition-colors"
                  aria-label={T.avatarHint[lang]}
                >
                  <Camera size={13} className="text-white" />
                </label>
                <input id="avatar-upload" type="file" accept="image/*" className="hidden" />
              </div>
              <div>
                <p className="font-bold text-sm text-[#1C2B3A]">{name}</p>
                <p className="text-xs text-[#0077B6] font-semibold mt-0.5">ADMIN</p>
                <p className="text-[11px] text-gray-400 mt-2">{T.avatarHint[lang]}</p>
              </div>
            </div>
          </div>

          {/* ── Account info ── */}
          <div className="card p-5 space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
              {T.infoSection[lang]}
            </p>

            {/* Name */}
            <div>
              <label htmlFor="admin-name"
                className="block text-xs font-semibold text-gray-600 mb-1.5">
                <span className="flex items-center gap-1">
                  <User size={12} /> {T.nameLabel[lang]}
                </span>
              </label>
              <input
                id="admin-name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0096C7] focus:border-transparent transition-colors min-h-[44px]"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="admin-email"
                className="block text-xs font-semibold text-gray-600 mb-1.5">
                <span className="flex items-center gap-1">
                  <Mail size={12} /> {T.emailLabel[lang]}
                </span>
              </label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0096C7] focus:border-transparent transition-colors min-h-[44px]"
              />
            </div>

            {/* Role — read only */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                {T.roleLabel[lang]}
              </label>
              <div className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-100 bg-gray-50 text-gray-500 min-h-[44px] flex items-center">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-[#E3F2FD] text-[#1565C0] border border-[#90CAF9]">
                  <Lock size={10} /> ADMIN
                </span>
              </div>
            </div>
          </div>

          {/* ── Change password ── */}
          <div className="card p-5 space-y-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                {T.pwSection[lang]}
              </p>
              <p className="text-[11px] text-gray-400 mt-1">{T.leaveBlank[lang]}</p>
            </div>

            {/* Current password */}
            <div>
              <label htmlFor="current-pw"
                className="block text-xs font-semibold text-gray-600 mb-1.5">
                {T.currentPw[lang]}
              </label>
              <div className="relative">
                <input
                  id="current-pw"
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPw}
                  onChange={e => setCurrentPw(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 pr-10 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0096C7] min-h-[44px]"
                />
                <button type="button" onClick={() => setShowCurrent(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showCurrent ? 'Hide' : 'Show'}>
                  {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* New password */}
            <div>
              <label htmlFor="new-pw"
                className="block text-xs font-semibold text-gray-600 mb-1.5">
                {T.newPw[lang]}
              </label>
              <div className="relative">
                <input
                  id="new-pw"
                  type={showNew ? 'text' : 'password'}
                  value={newPw}
                  onChange={e => setNewPw(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 pr-10 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0096C7] min-h-[44px]"
                />
                <button type="button" onClick={() => setShowNew(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showNew ? 'Hide' : 'Show'}>
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">{T.pwHint[lang]}</p>
            </div>

            {/* Confirm password */}
            <div>
              <label htmlFor="confirm-pw"
                className="block text-xs font-semibold text-gray-600 mb-1.5">
                {T.confirmPw[lang]}
              </label>
              <div className="relative">
                <input
                  id="confirm-pw"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPw}
                  onChange={e => setConfirmPw(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 pr-10 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0096C7] min-h-[44px]"
                />
                <button type="button" onClick={() => setShowConfirm(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showConfirm ? 'Hide' : 'Show'}>
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Password error */}
            {pwError && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-50 border border-red-200">
                <AlertTriangle size={13} className="text-red-500 shrink-0" />
                <p className="text-xs text-red-700 font-medium">{pwError}</p>
              </div>
            )}
          </div>

          {/* ── Save button ── */}
          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-sm font-bold text-white shadow-md hover:opacity-90 disabled:opacity-60 transition-all min-h-[48px]"
            style={{ background: 'linear-gradient(135deg,#0077B6,#0096C7)' }}
          >
            {saving
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{T.saving[lang]}</>
              : <><Save size={16} />{T.save[lang]}</>
            }
          </button>
        </form>
      </div>
    </AppShell>
  )
}
