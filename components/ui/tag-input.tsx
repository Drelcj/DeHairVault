'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TagInputProps {
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function TagInput({
  value = [],
  onChange,
  placeholder = 'Type and press Enter to add...',
  className,
  disabled = false,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    } else if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
      // Remove last tag when backspace is pressed on empty input
      removeTag(value.length - 1)
    }
  }

  const addTag = () => {
    const trimmedValue = inputValue.trim()
    if (trimmedValue && !value.includes(trimmedValue)) {
      onChange([...value, trimmedValue])
      setInputValue('')
    }
  }

  const removeTag = (index: number) => {
    const newTags = value.filter((_, i) => i !== index)
    onChange(newTags)
  }

  const handleContainerClick = () => {
    inputRef.current?.focus()
  }

  return (
    <div
      onClick={handleContainerClick}
      className={cn(
        'flex flex-wrap gap-2 p-3 min-h-[100px] rounded-md border border-input bg-background cursor-text',
        'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {value.map((tag, index) => (
        <span
          key={index}
          className={cn(
            'inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm',
            'bg-accent/10 text-accent-foreground border border-accent/20',
            'animate-scale-in'
          )}
        >
          <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-accent" />
          {tag}
          {!disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                removeTag(index)
              }}
              className="ml-1 p-0.5 rounded-full hover:bg-accent/20 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </span>
      ))}
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
        placeholder={value.length === 0 ? placeholder : ''}
        disabled={disabled}
        className={cn(
          'flex-1 min-w-[200px] bg-transparent outline-none text-sm placeholder:text-muted-foreground',
          disabled && 'cursor-not-allowed'
        )}
      />
    </div>
  )
}
