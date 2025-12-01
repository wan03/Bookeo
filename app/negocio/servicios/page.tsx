import { getMyBusiness } from '@/app/actions'
import { getBusinessResources } from '@/lib/api'
import ServicesClient from '@/components/business/services-client'
import { redirect } from 'next/navigation'

export default async function ServicesPage() {
    const business = await getMyBusiness()

    if (!business) {
        redirect('/auth') // Or handle appropriately
    }

    const resources = await getBusinessResources(business.id)

    return <ServicesClient business={business} initialResources={resources} />
}
