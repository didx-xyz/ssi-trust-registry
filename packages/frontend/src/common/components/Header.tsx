import React from 'react'
import Link from 'next/link'
import NavigationItem from '@/common/components/NavigationItem'
import Image from 'next/image'

function Header() {
    return (
        <div className='sticky top-0 z-10 block bg-white h-[88px] shadow-lg flex justify-between px-6 items-center'>
            <Link href='/' className='flex gap-2'>
                <Image src='images/icons/logo.svg' width={116} height={24} alt='Trust Registry'/>
            </Link>
            <nav className='flex gap-4'>
                <NavigationItem name='Trusted Entities' href='/'/>
                <NavigationItem name='Schemas' href='/schemas'/>
                <NavigationItem name='Login as Admin' href='/login'/>
            </nav>
        </div>
    )
}

export default Header