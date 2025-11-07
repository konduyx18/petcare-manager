import { useRef, useEffect } from 'react'
import type { KeyboardEvent, ClipboardEvent } from 'react'
import { Input } from '@/components/ui/input'

interface OtpInputProps {
  value: string
  onChange: (value: string) => void
  onComplete?: (value: string) => void
  length?: number
}

export function OtpInput({ value, onChange, onComplete, length = 8 }: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length)
  }, [length])

  // Auto-focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [])

  // Handle input change
  const handleChange = (index: number, digit: string) => {
    // Only allow numbers
    if (digit && !/^\d$/.test(digit)) {
      return
    }

    // Update value
    const newValue = value.split('')
    newValue[index] = digit
    const updatedValue = newValue.join('').slice(0, length)
    onChange(updatedValue)

    // Move to next input if digit was entered
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    // Call onComplete if all digits entered
    if (updatedValue.length === length && onComplete) {
      onComplete(updatedValue)
    }
  }

  // Handle keydown for backspace and arrow keys
  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      
      // If current input has value, clear it
      if (value[index]) {
        const newValue = value.split('')
        newValue[index] = ''
        onChange(newValue.join(''))
      } else if (index > 0) {
        // Move to previous input and clear it
        const newValue = value.split('')
        newValue[index - 1] = ''
        onChange(newValue.join(''))
        inputRefs.current[index - 1]?.focus()
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault()
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault()
      inputRefs.current[index + 1]?.focus()
    }
  }

  // Handle paste event
  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text/plain').trim()
    
    // Only allow numeric paste
    if (!/^\d+$/.test(pastedData)) {
      return
    }

    // Take only the required length
    const pastedValue = pastedData.slice(0, length)
    onChange(pastedValue)

    // Focus the next empty input or the last input
    const nextIndex = Math.min(pastedValue.length, length - 1)
    inputRefs.current[nextIndex]?.focus()

    // Call onComplete if all digits pasted
    if (pastedValue.length === length && onComplete) {
      onComplete(pastedValue)
    }
  }

  return (
    <div className="flex gap-1.5 justify-center">
      {Array.from({ length }).map((_, index) => (
        <Input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className="w-11 h-14 text-center text-2xl font-mono focus:ring-2 focus:ring-green-600 sm:w-9 sm:h-12 sm:text-xl"
          aria-label={`Digit ${index + 1}`}
        />
      ))}
    </div>
  )
}
