import { getMyBusiness, getOperatingHours, getBlockedTimes } from '@/app/actions'
import AvailabilityManager from '@/components/business/availability-manager'

export default async function AvailabilityPage() {
    const business = await getMyBusiness()

    if (!business) {
        return <div className="p-8 text-center">No se encontró el negocio.</div>
    }

    const hours = await getOperatingHours(business.id)
    const blocked = await getBlockedTimes(business.id)

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Disponibilidad</h1>
                <p className="text-zinc-400">Gestiona tus horarios de atención y días libres.</p>
            </div>

            <AvailabilityManager
                businessId={business.id}
                initialHours={hours || []}
                initialBlocked={blocked || []}
            />
        </div>
    )
}
