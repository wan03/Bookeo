import { getMyBusiness } from '@/app/actions'
import MarketingClient from '@/components/business/marketing-client'
import { redirect } from 'next/navigation'

export default async function MarketingPage() {
    const business = await getMyBusiness()

    if (!business) {
        redirect('/auth')
    }

    return <MarketingClient business={business} />
}
