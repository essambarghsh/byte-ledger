export function Logo() {
    return (
        <div aria-label="ByteLedger Logo">
            <div className="flex items-center justify-center text-2xl font-black">
                <span className="group-data-[collapsible=icon]:hidden">
                    <span dir="ltr">
                        <span className="text-primary">Byte</span>
                        <span className="text-black">Ledger</span>
                    </span>
                </span>
                <span className="hidden group-data-[collapsible=icon]:block">
                    <span dir="ltr">
                        <span className="text-primary">B</span>
                        <span className="text-black">L</span>
                    </span>
                </span>
            </div>
        </div>
    )
}