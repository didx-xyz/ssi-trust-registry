import React from 'react'
import Link from 'next/link'
import {usePathname} from 'next/navigation'

interface Params {
    name: string
    href: string
}
const NavigationItem = ({name, href}: Params) => {
    const currentRoute = usePathname()

    return (
        <Link href={href} className={'btn btn-outline border-0 ' + (currentRoute === href && 'btn-active')}>{name}</Link>
    )
}

export default NavigationItem;