'use client';
import '../app/globals.css'
import Header from "@/components/header";

export default function AppContainer({
   children,
}: {
    children: React.ReactNode
}) {
    console.log('Root applied')
    return (
        <>
            <Header />
            <main className="flex min-h-screen flex-col items-center p-4 pt-0">
                {children}</main>
        </>
    )
}
