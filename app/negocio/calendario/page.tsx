import { getAppointments } from '@/lib/api'
import CalendarClient from '@/components/business/calendar-client'

export default async function CalendarPage() {
    // In a real app, we would get the business ID from the logged-in user
    const businessId = '1' // Hardcoded for now
    const appointments = await getAppointments(businessId)

    return <CalendarClient initialAppointments={appointments} />
}
