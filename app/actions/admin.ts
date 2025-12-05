'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

// Type definitions
export type AdminStats = {
    totalUsers: number
    newUsers30d: number
    totalBusinessOwners: number
    totalBusinesses: number
    verifiedBusinesses: number
    pendingVerifications: number
    totalBookings: number
    completedBookings: number
    cancelledBookings: number
    bookings30d: number
    totalRevenue: number
    revenue30d: number
    totalBarterOffers: number
    activeBarterOffers: number
    totalBarterApplications: number
    pendingBarterApplications: number
    totalContentSubmissions: number
    approvedContentSubmissions: number
    totalReviews: number
    averageRating: number
    lastUpdated: string
}

export type RecentActivity = {
    activityType: string
    entityId: string
    entityName: string
    timestamp: string
    metadata: Record<string, any>
}

export type UserWithActivity = {
    id: string
    email: string
    fullName: string
    phoneNumber: string
    role: string
    createdAt: string
    bookingCount?: number
    reviewCount?: number
    lastLogin?: string
}

export type BusinessWithDetails = {
    id: string
    name: string
    slug: string
    description: string
    address: string
    category: string
    isVerified: boolean
    hasGenerator: boolean
    imageUrl: string
    rating: number
    reviewCount: number
    createdAt: string
    ownerName?: string
    ownerEmail?: string
    serviceCount?: number
}

// Helper function to verify admin access
async function verifyAdminAccess() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        redirect('/')
    }

    return { supabase, userId: user.id }
}

// Get dashboard statistics
export async function getAdminStats(): Promise<AdminStats | null> {
    const { supabase } = await verifyAdminAccess()

    const { data, error } = await supabase
        .from('admin_dashboard_stats')
        .select('*')
        .single()

    if (error) {
        console.error('Error fetching admin stats:', error)
        return null
    }

    return {
        totalUsers: data.total_users || 0,
        newUsers30d: data.new_users_30d || 0,
        totalBusinessOwners: data.total_business_owners || 0,
        totalBusinesses: data.total_businesses || 0,
        verifiedBusinesses: data.verified_businesses || 0,
        pendingVerifications: data.pending_verifications || 0,
        totalBookings: data.total_bookings || 0,
        completedBookings: data.completed_bookings || 0,
        cancelledBookings: data.cancelled_bookings || 0,
        bookings30d: data.bookings_30d || 0,
        totalRevenue: data.total_revenue || 0,
        revenue30d: data.revenue_30d || 0,
        totalBarterOffers: data.total_barter_offers || 0,
        activeBarterOffers: data.active_barter_offers || 0,
        totalBarterApplications: data.total_barter_applications || 0,
        pendingBarterApplications: data.pending_barter_applications || 0,
        totalContentSubmissions: data.total_content_submissions || 0,
        approvedContentSubmissions: data.approved_content_submissions || 0,
        totalReviews: data.total_reviews || 0,
        averageRating: data.average_rating || 0,
        lastUpdated: data.last_updated
    }
}

// Refresh admin statistics
export async function refreshAdminStats(): Promise<boolean> {
    const { supabase } = await verifyAdminAccess()

    const { error } = await supabase.rpc('refresh_admin_stats')

    if (error) {
        console.error('Error refreshing admin stats:', error)
        return false
    }

    return true
}

// Get recent activity feed
export async function getRecentActivity(limit: number = 50): Promise<RecentActivity[]> {
    const { supabase } = await verifyAdminAccess()

    const { data, error } = await supabase
        .from('admin_recent_activity')
        .select('*')
        .limit(limit)

    if (error) {
        console.error('Error fetching recent activity:', error)
        return []
    }

    return data.map(item => ({
        activityType: item.activity_type,
        entityId: item.entity_id,
        entityName: item.entity_name,
        timestamp: item.timestamp,
        metadata: item.metadata
    }))
}

// Get all users with pagination and search
export async function getUsers(
    page: number = 1,
    limit: number = 50,
    searchQuery?: string,
    roleFilter?: string
): Promise<{ users: UserWithActivity[], total: number }> {
    const { supabase } = await verifyAdminAccess()

    let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' })

    if (searchQuery) {
        query = query.or(`email.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%,phone_number.ilike.%${searchQuery}%`)
    }

    if (roleFilter && roleFilter !== 'all') {
        query = query.eq('role', roleFilter)
    }

    const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

    if (error) {
        console.error('Error fetching users:', error)
        return { users: [], total: 0 }
    }

    const users = data.map(user => ({
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        phoneNumber: user.phone_number,
        role: user.role,
        createdAt: user.created_at
    }))

    return { users, total: count || 0 }
}

// Get user activity history
export async function getUserActivity(userId: string) {
    const { supabase } = await verifyAdminAccess()

    const { data, error } = await supabase.rpc('get_user_activity', { user_uuid: userId })

    if (error) {
        console.error('Error fetching user activity:', error)
        return []
    }

    return data
}

// Update user role
export async function updateUserRole(userId: string, newRole: string): Promise<boolean> {
    const { supabase, userId: adminId } = await verifyAdminAccess()

    const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)

    if (error) {
        console.error('Error updating user role:', error)
        return false
    }

    // Log admin action
    await supabase.rpc('log_admin_action', {
        p_action_type: 'update_user_role',
        p_entity_type: 'profile',
        p_entity_id: userId,
        p_details: { new_role: newRole, admin_id: adminId }
    })

    return true
}

// Get all businesses with filters
export async function getBusinesses(
    page: number = 1,
    limit: number = 50,
    verificationFilter?: 'all' | 'verified' | 'unverified'
): Promise<{ businesses: BusinessWithDetails[], total: number }> {
    const { supabase } = await verifyAdminAccess()

    let query = supabase
        .from('businesses')
        .select(`
      *,
      profiles!businesses_owner_id_fkey (
        full_name,
        email
      ),
      services (count)
    `, { count: 'exact' })

    if (verificationFilter === 'verified') {
        query = query.eq('is_verified', true)
    } else if (verificationFilter === 'unverified') {
        query = query.eq('is_verified', false)
    }

    const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

    if (error) {
        console.error('Error fetching businesses:', error)
        return { businesses: [], total: 0 }
    }

    const businesses = data.map(biz => ({
        id: biz.id,
        name: biz.name,
        slug: biz.slug,
        description: biz.description,
        address: biz.address,
        category: biz.category,
        isVerified: biz.is_verified,
        hasGenerator: biz.has_generator,
        imageUrl: biz.image_url,
        rating: biz.rating,
        reviewCount: biz.review_count,
        createdAt: biz.created_at,
        ownerName: biz.profiles?.full_name,
        ownerEmail: biz.profiles?.email,
        serviceCount: biz.services?.[0]?.count || 0
    }))

    return { businesses, total: count || 0 }
}

// Verify a business
export async function verifyBusiness(businessId: string): Promise<boolean> {
    const { supabase, userId: adminId } = await verifyAdminAccess()

    const { error } = await supabase
        .from('businesses')
        .update({ is_verified: true })
        .eq('id', businessId)

    if (error) {
        console.error('Error verifying business:', error)
        return false
    }

    // Log admin action
    await supabase.rpc('log_admin_action', {
        p_action_type: 'verify_business',
        p_entity_type: 'business',
        p_entity_id: businessId,
        p_details: { admin_id: adminId }
    })

    return true
}

// Reject/Unverify a business
export async function rejectBusiness(businessId: string, reason?: string): Promise<boolean> {
    const { supabase, userId: adminId } = await verifyAdminAccess()

    const { error } = await supabase
        .from('businesses')
        .update({ is_verified: false })
        .eq('id', businessId)

    if (error) {
        console.error('Error rejecting business:', error)
        return false
    }

    // Log admin action
    await supabase.rpc('log_admin_action', {
        p_action_type: 'reject_business',
        p_entity_type: 'business',
        p_entity_id: businessId,
        p_details: { reason, admin_id: adminId }
    })

    return true
}

// Get all bookings with filters
export async function getAllBookings(
    page: number = 1,
    limit: number = 50,
    statusFilter?: string,
    dateFrom?: string,
    dateTo?: string
) {
    const { supabase } = await verifyAdminAccess()

    let query = supabase
        .from('bookings')
        .select(`
      *,
      businesses (name),
      profiles (full_name, email),
      services (name)
    `, { count: 'exact' })

    if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
    }

    if (dateFrom) {
        query = query.gte('start_time', dateFrom)
    }

    if (dateTo) {
        query = query.lte('start_time', dateTo)
    }

    const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

    if (error) {
        console.error('Error fetching bookings:', error)
        return { bookings: [], total: 0 }
    }

    return { bookings: data, total: count || 0 }
}

// Cancel a booking (admin override)
export async function adminCancelBooking(bookingId: string, reason: string): Promise<boolean> {
    const { supabase, userId: adminId } = await verifyAdminAccess()

    const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId)

    if (error) {
        console.error('Error cancelling booking:', error)
        return false
    }

    // Log admin action
    await supabase.rpc('log_admin_action', {
        p_action_type: 'cancel_booking',
        p_entity_type: 'booking',
        p_entity_id: bookingId,
        p_details: { reason, admin_id: adminId }
    })

    return true
}

// Get influencer leaderboard
export async function getInfluencerLeaderboard(limit: number = 20) {
    const { supabase } = await verifyAdminAccess()

    const { data, error } = await supabase
        .from('influencer_profiles')
        .select(`
      *,
      profiles (full_name, email)
    `)
        .order('reputation_score', { ascending: false })
        .limit(limit)

    if (error) {
        console.error('Error fetching influencer leaderboard:', error)
        return []
    }

    return data
}

// Get all barter offers and applications
export async function getBarterOffersWithApplications() {
    const { supabase } = await verifyAdminAccess()

    const { data, error } = await supabase
        .from('barter_offers')
        .select(`
      *,
      businesses (name),
      barter_applications (
        id,
        status,
        created_at,
        profiles (full_name, email)
      )
    `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching barter offers:', error)
        return []
    }

    return data
}

// Get content submissions for moderation
export async function getContentSubmissions(statusFilter?: string) {
    const { supabase } = await verifyAdminAccess()

    let query = supabase
        .from('content_submissions')
        .select(`
      *,
      profiles (full_name, email),
      businesses (name)
    `)

    if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
    }

    const { data, error } = await query
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching content submissions:', error)
        return []
    }

    return data
}

// Approve content submission
export async function approveContentSubmission(submissionId: string): Promise<boolean> {
    const { supabase, userId: adminId } = await verifyAdminAccess()

    const { error } = await supabase
        .from('content_submissions')
        .update({
            status: 'approved',
            approved_at: new Date().toISOString()
        })
        .eq('id', submissionId)

    if (error) {
        console.error('Error approving content:', error)
        return false
    }

    // Log admin action
    await supabase.rpc('log_admin_action', {
        p_action_type: 'approve_content',
        p_entity_type: 'content_submission',
        p_entity_id: submissionId,
        p_details: { admin_id: adminId }
    })

    return true
}

// Reject content submission
export async function rejectContentSubmission(submissionId: string, feedback: string): Promise<boolean> {
    const { supabase, userId: adminId } = await verifyAdminAccess()

    const { error } = await supabase
        .from('content_submissions')
        .update({
            status: 'rejected',
            feedback
        })
        .eq('id', submissionId)

    if (error) {
        console.error('Error rejecting content:', error)
        return false
    }

    // Log admin action
    await supabase.rpc('log_admin_action', {
        p_action_type: 'reject_content',
        p_entity_type: 'content_submission',
        p_entity_id: submissionId,
        p_details: { feedback, admin_id: adminId }
    })

    return true
}
