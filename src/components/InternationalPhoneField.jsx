import { useEffect, useRef, useState } from 'react';
import { PHONE_COUNTRIES, buildPhoneCandidate, formatNationalNumber, splitPhoneNumber } from '@/utils/phone';

export default function InternationalPhoneField({
  value,
  onChange,
  onBlur,
  defaultCountry = 'CI',
  placeholder = 'Numéro de téléphone',
  selectClassName = '',
  inputClassName = '',
  containerClassName = ''
}) {
  const [country, setCountry] = useState(defaultCountry);
  const [nationalNumber, setNationalNumber] = useState('');
  const lastEmittedValueRef = useRef(value || '');

  useEffect(() => {
    if ((value || '') === lastEmittedValueRef.current) {
      return;
    }
    const next = splitPhoneNumber(value, defaultCountry);
    setCountry(next.country);
    setNationalNumber(next.nationalNumber);
  }, [defaultCountry, value]);

  const emit = (nextCountry, nextNational) => {
    const nextValue = buildPhoneCandidate(nextCountry, nextNational);
    lastEmittedValueRef.current = nextValue;
    onChange?.(nextValue);
  };

  return (
    <div className={`grid grid-cols-[9rem,1fr] gap-3 ${containerClassName}`.trim()}>
      <select
        value={country}
        onChange={(e) => {
          const nextCountry = e.target.value;
          setCountry(nextCountry);
          emit(nextCountry, nationalNumber);
        }}
        onBlur={onBlur}
        className={selectClassName}
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
          const nextNational = formatNationalNumber(country, e.target.value);
          setNationalNumber(nextNational);
          emit(country, nextNational);
        }}
        placeholder={placeholder}
        autoComplete="tel-national"
        onBlur={onBlur}
        className={inputClassName}
      />
    </div>
  );
}
