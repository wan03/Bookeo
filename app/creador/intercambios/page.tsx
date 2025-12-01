import { getBarterOffers } from '@/lib/api'
import BarterClient from '@/components/barter/barter-client'

export default async function BarterHubPage() {
    const offers = await getBarterOffers()

    return <BarterClient initialOffers={offers} />
}
