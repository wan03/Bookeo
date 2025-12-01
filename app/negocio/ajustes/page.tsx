import { getMyBusiness } from '@/app/actions'
import { getStaff, getBusinessResources } from '@/lib/api'
import SettingsClient from '@/components/business/settings-client'
import { redirect } from 'next/navigation'

export default async function SettingsPage() {
    const business = await getMyBusiness()

    if (!business) {
        redirect('/auth')
    }

    const staff = await getStaff(business.id)
    const resources = await getBusinessResources(business.id)

    return <SettingsClient business={business} initialStaff={staff} initialResources={resources} />
}
