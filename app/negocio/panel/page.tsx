import { getAppointments } from '@/lib/api'
import { getMyBusiness } from '@/app/actions'
import DashboardClient from '@/components/business/dashboard-client'
import { redirect } from 'next/navigation'

export default async function BusinessDashboard() {
    console.log('[PanelPage] Fetching business...')
    const business = await getMyBusiness()
    console.log('[PanelPage] Business result:', business ? business.id : 'null')

    if (!business) {
        console.log('[PanelPage] No business found, redirecting to /')
        redirect('/')
    }

    const appointments = await getAppointments(business.id)

    return <DashboardClient initialAppointments={appointments} business={business} />
}
