import { getBusinessById } from '@/lib/api'
import BookingClient from '@/components/booking/booking-client'
import { notFound } from 'next/navigation'

interface BookingPageProps {
    params: Promise<{
        businessId: string
    }>
}

export default async function BookingPage({ params }: BookingPageProps) {
    const { businessId } = await params
    const business = await getBusinessById(businessId)

    if (!business) {
        notFound()
    }

    return <BookingClient business={business} />
}
