import React, { useState, useEffect, useRef } from 'react';
import { Lock } from 'lucide-react';

const hashPin = async (pin) => {
  const msgBuffer = new TextEncoder().encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export default function PinGate({ children }) {
  const [isLocked, setIsLocked] = useState(true);
  const [hasPin, setHasPin] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [setupStep, setSetupStep] = useState(1);
  const [firstPin, setFirstPin] = useState('');
  const [error, setError] = useState('');

  const inactivityTimerRef = useRef(null);

  useEffect(() => {
    const storedHash = localStorage.getItem('app_pin_hash');
    if (storedHash) {
      setHasPin(true);
    } else {
      setHasPin(false);
    }

    const lastActive = localStorage.getItem('last_active_time');
    const now = Date.now();
    if (storedHash && lastActive && (now - parseInt(lastActive, 10)) < 5 * 60 * 1000) {
      setIsLocked(false);
    }

    const resetTimer = () => {
      localStorage.setItem('last_active_time', Date.now().toString());
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keypress', resetTimer);
    window.addEventListener('touchstart', resetTimer);
    resetTimer();

    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keypress', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
    };
  }, []);

  useEffect(() => {
    if (!isLocked) {
      inactivityTimerRef.current = setInterval(() => {
        const lastActive = localStorage.getItem('last_active_time');
        if (lastActive && (Date.now() - parseInt(lastActive, 10)) >= 5 * 60 * 1000) {
          setIsLocked(true);
        }
      }, 60000);
    } else {
      clearInterval(inactivityTimerRef.current);
    }
    return () => clearInterval(inactivityTimerRef.current);
  }, [isLocked]);

  const handlePinInput = async (value) => {
    setPinInput(value);
    setError('');

    if (value.length === 4) {
      if (!hasPin) {
        if (setupStep === 1) {
          setFirstPin(value);
          setPinInput('');
          setSetupStep(2);
        } else {
          if (value === firstPin) {
            const hashed = await hashPin(value);
            localStorage.setItem('app_pin_hash', hashed);
            setHasPin(true);
            setIsLocked(false);
            localStorage.setItem('last_active_time', Date.now().toString());
          } else {
            setError('PINs do not match. Try again.');
            setPinInput('');
            setSetupStep(1);
          }
        }
      } else {
        const hashed = await hashPin(value);
        const storedHash = localStorage.getItem('app_pin_hash');
        if (hashed === storedHash) {
          setIsLocked(false);
          setPinInput('');
          localStorage.setItem('last_active_time', Date.now().toString());
        } else {
          setError('Incorrect PIN');
          setPinInput('');
        }
      }
    }
  };

  if (!isLocked && hasPin) {
    return children;
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-asphalt-900 px-4 text-smoke-100">
      <Lock size={48} className="mb-6 text-brand-500" />
      <h2 className="mb-2 text-2xl font-bold font-display">
        {!hasPin ? (setupStep === 1 ? 'Set 4-Digit PIN' : 'Confirm PIN') : 'Enter PIN'}
      </h2>
      <p className="mb-8 text-center text-sm text-smoke-400">
        {!hasPin ? 'Secure your sensitive data.' : 'Unlock your secure vault.'}
      </p>

      <div className="mb-4 flex justify-center gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`flex h-14 w-12 items-center justify-center rounded-xl border-2 text-2xl font-bold ${
              pinInput.length > i ? 'border-brand-500 bg-brand-500/20' : 'border-smoke-700 bg-asphalt-800'
            }`}
          >
            {pinInput.length > i ? '•' : ''}
          </div>
        ))}
      </div>

      {error && <p className="mb-4 text-sm text-emergency">{error}</p>}

      <div className="grid grid-cols-3 gap-4 mt-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => pinInput.length < 4 && handlePinInput(pinInput + num)}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-asphalt-800 text-2xl font-bold active:bg-asphalt-700"
          >
            {num}
          </button>
        ))}
        <div />
        <button
          onClick={() => pinInput.length < 4 && handlePinInput(pinInput + '0')}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-asphalt-800 text-2xl font-bold active:bg-asphalt-700"
        >
          0
        </button>
        <button
          onClick={() => setPinInput(pinInput.slice(0, -1))}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-asphalt-800 text-lg active:bg-asphalt-700"
        >
          Del
        </button>
      </div>
    </div>
  );
}
