import Link from "next/link"
import * as React from "react"
import { getDictionary, t } from "@/lib/i18n"
import { PhSealCheckFill } from "./icons/PhSealCheckFill"

export function AppFooter() {
    const dict = getDictionary()
    return (
        <div className="py-4 h-16 flex items-center bg-white border-t border-gray-300 px-4">
            <div className="w-full">
                <div className="flex items-center text-gray-600 text-xs font-semibold">
                    <div className="flex items-center flex-1">
                        <span className="ml-3">
                            <PhSealCheckFill className="size-6" />
                        </span>
                        <Link className="hover:text-primary" href={'https://www.esssam.com'} target="_blank">
                            <span>{t('app.developer', dict)}</span>
                        </Link>
                        <span className="text-gray-900 font-bold mx-2">/</span>
                        <Link className="hover:text-primary" href={'https://www.ashwab.com'} target="_blank">
                            <span>{t('app.developerCompany', dict)}</span>
                        </Link>
                    </div>
                    <div className="">
                        {`${t('app.version', dict)} ${process.env.NEXT_PUBLIC_VERSION || '2.0.0'}`}
                    </div>
                </div>
            </div>
        </div>
    )
}