import { useEffect, useRef, useState } from "react";
import { PHONE_COUNTRIES, buildPhoneCandidate, formatNationalNumber, splitPhoneNumber } from "../../utils/phone.js";

export default function PhoneNumberField({
  value,
  onChange,
  defaultCountry = "CI",
  placeholder = "Téléphone",
  disabled = false
}) {
  const [country, setCountry] = useState(defaultCountry);
  const [nationalNumber, setNationalNumber] = useState("");
  const lastEmittedValueRef = useRef(value || "");

  useEffect(() => {
    if ((value || "") === lastEmittedValueRef.current) {
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
    <div className="grid grid-cols-[9rem,1fr] gap-3">
      <select
        value={country}
        onChange={(e) => {
          const nextCountry = e.target.value;
          setCountry(nextCountry);
          emit(nextCountry, nationalNumber);
        }}
        disabled={disabled}
        className="h-10 rounded-md border border-input bg-background px-3 text-sm"
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
        disabled={disabled}
        className="h-10 rounded-md border border-input bg-background px-3 text-sm"
      />
    </div>
  );
}
