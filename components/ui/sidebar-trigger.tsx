'use client'

import { useSidebar } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { PanelRight } from "@/components/icons/panel"
import { JSX } from "react"
import { cn } from "@/lib/utils"

interface CustomTriggerProps {
  className?: string
  icon?: JSX.Element
}

export function CustomSidebarTrigger({ 
  className,
  icon 
}: CustomTriggerProps) {
  const { toggleSidebar } = useSidebar()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleSidebar}
      className={cn(
        "size-10 md:size-12 p-0 hover:text-primary active:text-primary hover:bg-primary/10 active:bg-primary/15 cursor-pointer",
        "[&>svg]:!size-6",
        "border border-gray-200 rounded-full md:border-none md:rounded-lg",
        className
      )}
    >
      {icon || <PanelRight size={24} />}
      <span className="sr-only">Toggle sidebar navigation</span>
    </Button>
  )
}