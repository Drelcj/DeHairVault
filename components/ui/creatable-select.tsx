"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface CreatableSelectOption {
  value: string
  label: string
}

interface CreatableSelectProps {
  options: CreatableSelectOption[]
  value: string
  onChange: (value: string) => void
  onCreateOption?: (value: string) => Promise<void>
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  className?: string
  disabled?: boolean
}

export function CreatableSelect({
  options,
  value,
  onChange,
  onCreateOption,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyMessage = "No option found.",
  className,
  disabled = false,
}: CreatableSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [isCreating, setIsCreating] = React.useState(false)

  const selectedOption = options.find((opt) => opt.value === value)

  // Check if the search term matches an existing option
  const exactMatch = options.some(
    (opt) => opt.label.toLowerCase() === search.toLowerCase() ||
             opt.value.toLowerCase() === search.toLowerCase()
  )

  // Filter options based on search
  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase()) ||
    opt.value.toLowerCase().includes(search.toLowerCase())
  )

  const handleCreate = async () => {
    if (!search.trim() || !onCreateOption) return
    
    setIsCreating(true)
    try {
      await onCreateOption(search.trim())
      // The parent component should refresh options and set the new value
      setSearch("")
      setOpen(false)
    } catch (error) {
      console.error("Failed to create option:", error)
    } finally {
      setIsCreating(false)
    }
  }

  const formatNewValue = (input: string): string => {
    // Convert to SCREAMING_SNAKE_CASE for database value
    return input.toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '')
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between bg-background", className)}
          disabled={disabled}
        >
          {selectedOption ? selectedOption.label : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>
              {search.trim() && !exactMatch && onCreateOption ? (
                <div className="p-2">
                  <p className="text-sm text-muted-foreground mb-2">{emptyMessage}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handleCreate}
                    disabled={isCreating}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {isCreating ? "Creating..." : `Create "${search.trim()}"`}
                  </Button>
                </div>
              ) : (
                emptyMessage
              )}
            </CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => {
                    onChange(option.value)
                    setOpen(false)
                    setSearch("")
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
            {search.trim() && !exactMatch && onCreateOption && filteredOptions.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={handleCreate}
                    disabled={isCreating}
                    className="text-accent"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {isCreating ? "Creating..." : `Create "${search.trim()}"`}
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
