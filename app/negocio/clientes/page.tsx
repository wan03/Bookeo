import { getMyBusiness } from '@/app/actions'
import { getClientStats } from '@/lib/api'
import ClientsClient from '@/components/business/clients-client'
import { redirect } from 'next/navigation'

export default async function ClientsPage() {
    const business = await getMyBusiness()

    if (!business) {
        redirect('/auth')
    }

    const clients = await getClientStats(business.id)

    return <ClientsClient initialClients={clients} />
}
