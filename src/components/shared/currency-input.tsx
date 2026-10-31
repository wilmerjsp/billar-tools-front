import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface CurrencyInputProps {
  value: number
  onChange: (value: number) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

function formatCOP(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
}

export function CurrencyInput({
  value,
  onChange,
  placeholder = '$ 0',
  className,
  disabled,
}: CurrencyInputProps) {
  const [display, setDisplay] = useState<string>(() =>
    value > 0 ? formatCOP(value) : ''
  )

  useEffect(() => {
    setDisplay(value > 0 ? formatCOP(value) : '')
  }, [value])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, '')
    const num = digits ? parseInt(digits, 10) : 0
    setDisplay(num > 0 ? formatCOP(num) : '')
    onChange(num)
  }

  return (
    <Input
      type='text'
      inputMode='numeric'
      value={display}
      onChange={handleChange}
      placeholder={placeholder}
      className={cn(className)}
      disabled={disabled}
    />
  )
}
