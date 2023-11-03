'use client'

import React from 'react'
import Link from 'next/link'
import {usePathname} from 'next/navigation'
import NavigationItem from "@/common/components/NavigationItem";

function Header() {
    const currentRoute = usePathname();

    return (
        <div className='block bg-white h-20 shadow-xl flex justify-between px-12 items-center'>
            <Link href='/'><h1 className='text-xl'><span className='font-bold'>Trust</span> registry</h1></Link>
            <nav className='flex gap-4'>
                <NavigationItem name='Trusted Entities' href='/'/>
                <NavigationItem name='Schemas' href='/schemas'/>
                <NavigationItem name='Log as Admin' href='/auth'/>
            </nav>
        </div>
    )
}

export default Header