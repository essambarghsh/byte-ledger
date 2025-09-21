import Link from "next/link"
import * as React from "react"

export function AppFooter() {
    return (
        <div className="py-5 bg-gray-100">
            <div className="container">
                <div className="flex items-center text-gray-600 text-xs font-bold">
                    <Link className="hover:text-primary" href={'https://www.esssam.com'} target="_blank">
                        <span>Made by Essam Barghsh</span>
                    </Link>
                    <span className="text-gray-900 font-bold mx-2">|</span>
                    <Link className="hover:text-primary" href={'https://www.ashwab.com'} target="_blank">
                        <span>Ashwab</span>
                    </Link>
                </div>
            </div>
        </div>
    )
}