import { useState } from 'react'
import {
  CloudOffIcon,
  LeafIcon,
  PhoneIcon,
  ShieldIcon,
} from './icons'

const PHONE_OK = /^[6-9]\d{9}$/
const OTP_OK = /^\d{6}$/

export default function LoginScreen({ onLogin }) {
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [offline, setOffline] = useState(true)

  const phoneValid = PHONE_OK.test(phone)
  const otpValid = OTP_OK.test(otp)
  const canLogin = phoneValid && otpValid

  const sendOtp = () => {
    if (phoneValid) setOtpSent(true)
  }

  return (
    <main className="flex min-h-dvh flex-col bg-white">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 pb-8 pt-12 sm:pt-16">
        <header className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-lime-400 via-green-500 to-emerald-600 text-white shadow-lg shadow-green-600/30 ring-4 ring-green-50">
            <LeafIcon className="h-10 w-10" />
          </div>
          <h1 className="mt-5 text-2xl font-bold tracking-tight text-green-950">
            Welcome to AgriScan AI
          </h1>
          <p className="mt-1.5 text-sm text-gray-500">
            Edge-Native Crop Diagnostics
          </p>
        </header>

        <form
          className="mt-10 flex flex-1 flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault()
            onLogin()
          }}
        >
          <div>
            <label
              htmlFor="phone"
              className="mb-1.5 block text-sm font-medium text-green-950"
            >
              Registered Mobile Number
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <PhoneIcon className="h-5 w-5" />
              </span>
              <input
                id="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                maxLength={13}
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value.replace(/\D/g, '').slice(0, 13))
                }
                placeholder="+91 98765 43210"
                className="w-full rounded-xl border border-green-200 bg-white py-3 pl-11 pr-4 text-sm text-green-950 placeholder:text-gray-400 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
              />
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label
                htmlFor="otp"
                className="block text-sm font-medium text-green-950"
              >
                One Time Password (OTP)
              </label>
              <button
                type="button"
                onClick={sendOtp}
                disabled={!phoneValid}
                className="text-xs font-semibold text-green-600 transition enabled:hover:text-green-700 disabled:cursor-not-allowed disabled:text-gray-400"
              >
                {otpSent ? 'Resend OTP' : 'Send OTP'}
              </button>
            </div>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
              }
              placeholder="Enter 6-digit OTP"
              className="w-full rounded-xl border border-green-200 bg-white px-4 py-3 text-sm text-green-950 placeholder:text-gray-400 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
            />
            {otpSent && phoneValid && (
              <p className="mt-1.5 text-xs text-green-600">
                OTP sent to +91 •••••{phone.slice(-4)}
              </p>
            )}
          </div>

          <div className="mt-2 flex flex-col gap-3">
            <button
              type="submit"
              disabled={!canLogin}
              className="w-full rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-green-600/25 transition enabled:hover:brightness-105 enabled:active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
            >
              Secure Login
            </button>
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-green-300 bg-white py-3.5 text-sm font-semibold text-green-700 transition hover:bg-green-50 active:scale-[0.99]"
            >
              <ShieldIcon className="h-4 w-4" />
              Login via KVK / Official ID
            </button>
          </div>
        </form>

        <footer className="mt-10">
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-green-100 bg-green-50/60 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700">
                <CloudOffIcon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-green-950">
                  Offline Mode Available
                </p>
                <p className="text-xs text-gray-500">
                  AI diagnostics run on-device
                </p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={offline}
              aria-label="Toggle offline mode"
              onClick={() => setOffline((prev) => !prev)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                offline ? 'bg-green-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  offline ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </footer>
      </div>
    </main>
  )
}