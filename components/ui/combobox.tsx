"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface ComboboxOption {
  value: string
  label: string
}

interface ComboboxProps {
  options: ComboboxOption[]
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  className?: string
  disabled?: boolean
  loading?: boolean
  onOpenChange?: (open: boolean) => void
  onClick?: (e: React.MouseEvent) => void
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyText = "No option found.",
  className,
  disabled = false,
  loading = false,
  onOpenChange,
  onClick,
  ...props
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    onOpenChange?.(newOpen)
  }

  const selectedOption = options.find((option) => option.value === value)

  return (
    <Popover
      open={open}
      onOpenChange={handleOpenChange}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between py-0 h-14 px-4 border-gray-300 focus:border-primary focus:ring-3 focus:ring-primary/25 focus:text-primary shadow-none text-xs font-semibold text-black rounded-xl", className)}
          disabled={disabled || loading}
          onClick={onClick}
          {...props}
        >
          {loading ? "جارٍ التحميل..." : (selectedOption ? selectedOption.label : placeholder)}
          {loading ? (
            <Loader2 className="opacity-50 h-4 w-4 -ml-1 mr-2 shrink-0 animate-spin" />
          ) : (
            <ChevronsUpDown className="opacity-50 h-4 w-4 -ml-1 mr-2 shrink-0" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 border-gray-300 bg-white rounded-xl" style={{ width: "var(--radix-popover-trigger-width)" }}>
        <Command>
          <CommandInput placeholder={searchPlaceholder} className="h-14 py-1 border-gray-300" />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    onValueChange?.(currentValue === value ? "" : currentValue)
                    setOpen(false)
                  }}
                  className="h-12 px-3 border-gray-300 hover:bg-primary/10 hover:text-primary cursor-pointer rounded-lg text-sm font-medium"
                >
                  <span className="flex-1">{option.label}</span>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
