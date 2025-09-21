import { CustomSidebarTrigger } from "@/components/ui/sidebar-trigger"
import { Menu } from "lucide-react"
import * as React from "react"
import { useState, useEffect } from "react"
import { EmployeeAvatar } from "@/components/employee-avatar"
import { getDictionary, t } from "@/lib/i18n"
import { SessionData, Employee } from "@/types"

interface AppHeaderProps {
  session: SessionData
}

export function AppHeader({ session }: AppHeaderProps) {
    const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null)
    const dict = getDictionary()

    useEffect(() => {
        const fetchCurrentEmployee = async () => {
            try {
                const response = await fetch(`/api/employees/${session.employeeId}`)
                if (response.ok) {
                    const employee = await response.json()
                    setCurrentEmployee(employee)
                }
            } catch (error) {
                console.error('Failed to fetch current employee:', error)
            }
        }

        if (session.employeeId) {
            fetchCurrentEmployee()
        }
    }, [session.employeeId])

    return (
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear bg-white border-b border-gray-300 sticky top-0 z-10">
            <div className="flex items-center justify-between w-full">
                <div className="flex items-center px-4">
                    <CustomSidebarTrigger className="md:hidden hover:bg-transparent active:bg-transparent text-gray-500 border-none p-0 [&>svg]:!size-8" icon={<Menu strokeWidth={1.5} />} />
                    <CustomSidebarTrigger className="-mr-2 ltr:mr-0 ltr:-ml-2 hidden group-has-[[data-collapsible=icon]]/sidebar-wrapper:md:flex text-gray-500" />
                </div>
                <div className="flex items-center px-4 gap-4">
                    <div className="flex items-center gap-3 flex-row-reverse">
                        <div className="flex-1 text-right">
                            <p className="text-sm font-medium text-sidebar-foreground">
                                {session.employeeName}
                            </p>
                            <p className="text-xs text-sidebar-foreground/70">
                                {t('app.name', dict)}
                            </p>
                        </div>
                        <EmployeeAvatar
                            name={session.employeeName}
                            avatar={currentEmployee ? currentEmployee.avatar : session.employeeAvatar}
                            size="md"
                            updatedAt={currentEmployee?.updatedAt}
                        />
                    </div>
                </div>
            </div>
        </header>
    )
}