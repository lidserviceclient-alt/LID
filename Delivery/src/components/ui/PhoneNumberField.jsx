import { useEffect, useRef, useState } from 'react'
import { PHONE_COUNTRIES, buildPhoneCandidate, formatNationalNumber, splitPhoneNumber } from '../../utils/phone'

export default function PhoneNumberField({
  value,
  onChange,
  defaultCountry = 'CI',
  placeholder = 'Numéro',
  disabled = false,
}) {
  const [country, setCountry] = useState(defaultCountry)
  const [nationalNumber, setNationalNumber] = useState('')
  const lastEmittedValueRef = useRef(value || '')

  useEffect(() => {
    if ((value || '') === lastEmittedValueRef.current) {
      return
    }
    const next = splitPhoneNumber(value, defaultCountry)
    setCountry(next.country)
    setNationalNumber(next.nationalNumber)
  }, [defaultCountry, value])

  const emit = (nextCountry, nextNational) => {
    const nextValue = buildPhoneCandidate(nextCountry, nextNational)
    lastEmittedValueRef.current = nextValue
    onChange?.(nextValue)
  }

  return (
    <div className="grid grid-cols-[9rem,1fr] gap-3">
      <select
        value={country}
        onChange={(e) => {
          const nextCountry = e.target.value
          setCountry(nextCountry)
          emit(nextCountry, nationalNumber)
        }}
        disabled={disabled}
        className="bg-neutral-900 border border-neutral-800 text-white rounded-xl px-3 py-4 outline-none focus:border-[#6aa200] focus:ring-1 focus:ring-[#6aa200]"
      >
        {PHONE_COUNTRIES.map((item) => (
          <option key={item.code} value={item.code}>
            {item.flag} {item.dialCode} {item.code}
          </option>
        ))}
      </select>
      <input
        type="tel"
        value={nationalNumber}
        onChange={(e) => {
          const nextNational = formatNationalNumber(country, e.target.value)
          setNationalNumber(nextNational)
          emit(country, nextNational)
        }}
        placeholder={placeholder}
        autoComplete="tel-national"
        disabled={disabled}
        className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-xl px-4 py-4 outline-none focus:border-[#6aa200] focus:ring-1 focus:ring-[#6aa200] transition-all placeholder:text-neutral-600"
      />
    </div>
  )
}
