import { apiClient } from './http'
import type {
  ApplicationDetails, Booking, BookingDrive, BookingLink, BookingPhoto, BookingRequest, ContactInfo, PricingPolicyRequest, RefundPolicyRequest,
  CreatePlanRequest, DashboardSummary, Friendship, FriendshipStatus, HotelApplication, HotelBooking, HotelDetails, HostHotel, PlanStatus, UpdatePlanRequest,
  HotelInfo, HotelSearchResult, HotelSummary, HostApplication, HostProfile, Invitation, ItineraryItem,
  PageResponse, PaymentOrder, PaymentVerification, PlanMember, PlanMessage,
  Room, StayOption, TravelPlan, UpdateProfileRequestDto, UserProfile, UserSummary, VerificationDocument,
} from '../types/api'

export interface HotelSearchParams { hotelRequestInfo: { city?: string; startDate?: string; endDate?: string; roomCount: number; pageNo: number; pageSize: number } }
export const profileApi = {
  get: async () => (await apiClient.get<UserProfile>('/api/me')).data,
  update: async (payload: UpdateProfileRequestDto) => (await apiClient.patch<UserProfile>('/api/me', payload)).data,
  uploadImage: async (file: File, onUploadProgress?: (percent: number) => void) => {
    const form = new FormData(); form.append('file', file)
    return (await apiClient.put<UserProfile>('/api/me/profile-image', form, { onUploadProgress: (event) => { if (event.total) onUploadProgress?.(Math.round(event.loaded * 100 / event.total)) } })).data
  },
  addPhone: async (phone: string) => (await apiClient.put<UserProfile>('/api/me/phones', null, { params: { phone } })).data,
  removePhone: async (phone: string) => (await apiClient.delete<UserProfile>('/api/me/phones', { params: { phone } })).data,
}
export const discoveryApi = {
  users: async (page = 0, size = 20) => (await apiClient.get<PageResponse<UserSummary>>('/api/users', { params: { page, size } })).data,
  friendships: async () => (await apiClient.get<Friendship[]>('/api/friendships')).data,
  status: async (targetUserId: number) => (await apiClient.get<FriendshipStatus>(`/api/friendships/${targetUserId}/status`)).data,
  sendRequest: async (targetUserId: number) => (await apiClient.post<Friendship>(`/api/friendships/requests/${targetUserId}`)).data,
  remove: async (targetUserId: number) => apiClient.delete(`/api/friendships/${targetUserId}`),
}
export const hotelSearchApi = {
  search: async ({ hotelRequestInfo }: HotelSearchParams) => (await apiClient.get<PageResponse<HotelSearchResult>>('/api/hotels/search', { params: hotelRequestInfo })).data,
  detail: async (hotelId: number) => (await apiClient.get<HotelInfo>(`/api/hotels/search/${hotelId}/info`)).data,
  hotelPhotos: async (hotelId: number) => (await apiClient.get<string[]>('/api/hotels/search/photos', { params: { hotelId } })).data,
  roomPhotos: async (roomId: number) => (await apiClient.get<string[]>(`/api/hotels/search/photos/${roomId}`)).data,
}
export const bookingApi = {
  list: async () => (await apiClient.get<Booking[]>('/api/bookings')).data,
  create: async (payload: BookingRequest) => (await apiClient.post<Booking>('/api/bookings/init', payload)).data,
  guests: async (bookingId: number, userIds: number[]) => (await apiClient.patch<Booking>(`/api/bookings/${bookingId}/guests`, userIds)).data,
  cancel: async (bookingId: number) => apiClient.post(`/api/bookings/${bookingId}/cancel`),
  initiatePayment: async (bookingId: number) => (await apiClient.post<PaymentOrder>(`/api/bookings/${bookingId}/payments`)).data,
  verifyPayment: async (payload: PaymentVerification) => (await apiClient.post<Booking>('/api/payments/verify', payload)).data,
}
export const driveApi = {
  forBooking: async (bookingId: number) => (await apiClient.get<BookingDrive>(`/api/bookings/${bookingId}/drive`)).data,
  photos: async (driveId: number, page = 0, size = 20) => (await apiClient.get<PageResponse<BookingPhoto>>(`/api/drives/${driveId}/photos`, { params: { page, size } })).data,
  upload: async (driveId: number, file: File, onUploadProgress?: (percent: number) => void) => {
    const form = new FormData(); form.append('file', file)
    return (await apiClient.post<BookingPhoto>(`/api/drives/${driveId}/photos`, form, { onUploadProgress: (event) => { if (event.total) onUploadProgress?.(Math.round(event.loaded * 100 / event.total)) } })).data
  },
  remove: async (driveId: number, photoId: number) => apiClient.delete(`/api/drives/${driveId}/photos/${photoId}`),
}
export const plansApi = {
  list: async (page = 0, size = 20) => (await apiClient.get<PageResponse<TravelPlan>>('/api/travel-plans', { params: { page, size } })).data,
  get: async (id: number) => (await apiClient.get<TravelPlan>(`/api/travel-plans/${id}`)).data,
  update: async (id: number, payload: UpdatePlanRequest) => (await apiClient.patch<TravelPlan>(`/api/travel-plans/${id}`, payload)).data,
  cancel: async (id: number) => apiClient.delete(`/api/travel-plans/${id}`),
  updateStatus: async (id: number, status: PlanStatus) => (await apiClient.patch<TravelPlan>(`/api/travel-plans/${id}/status`, { status })).data,
  create: async (payload: CreatePlanRequest) => (await apiClient.post<TravelPlan>('/api/travel-plans', payload)).data,
  members: async (id: number) => (await apiClient.get<PlanMember[]>(`/api/travel-plans/${id}/members`)).data,
  invitations: async (page = 0, size = 20) => (await apiClient.get<PageResponse<Invitation>>('/api/travel-plans/invitations', { params: { page, size } })).data,
  invite: async (id: number, userId: number) => (await apiClient.post<PlanMember>(`/api/travel-plans/${id}/invitations`, { userId })).data,
  respond: async (id: number, status: 'ACCEPTED' | 'DECLINED') => (await apiClient.post<PlanMember>(`/api/travel-plans/${id}/invitations/respond`, { status })).data,
  removeMember: async (id: number, userId: number) => apiClient.delete(`/api/travel-plans/${id}/members/${userId}`),
  stayOptions: async (id: number) => (await apiClient.get<StayOption[]>(`/api/travel-plans/${id}/stay-options`)).data,
  addStayOption: async (id: number, payload: { hotelId: number; notes?: string; estimatedPrice?: number; selected?: boolean }) => (await apiClient.post<StayOption>(`/api/travel-plans/${id}/stay-options`, payload)).data,
  updateStayOption: async (id: number, optionId: number, payload: { notes?: string; estimatedPrice?: number; selected?: boolean }) => (await apiClient.patch<StayOption>(`/api/travel-plans/${id}/stay-options/${optionId}`, payload)).data,
  deleteStayOption: async (id: number, optionId: number) => apiClient.delete(`/api/travel-plans/${id}/stay-options/${optionId}`),
  itinerary: async (id: number) => (await apiClient.get<ItineraryItem[]>(`/api/travel-plans/${id}/itinerary`)).data,
  addItinerary: async (id: number, payload: Omit<ItineraryItem, 'id' | 'travelPlanId' | 'createdBy'>) => (await apiClient.post<ItineraryItem>(`/api/travel-plans/${id}/itinerary`, payload)).data,
  updateItinerary: async (id: number, itemId: number, payload: Partial<ItineraryItem>) => (await apiClient.patch<ItineraryItem>(`/api/travel-plans/${id}/itinerary/${itemId}`, payload)).data,
  deleteItinerary: async (id: number, itemId: number) => apiClient.delete(`/api/travel-plans/${id}/itinerary/${itemId}`),
  reorderItinerary: async (id: number, itemIds: number[]) => (await apiClient.patch<ItineraryItem[]>(`/api/travel-plans/${id}/itinerary/reorder`, { itemIds })).data,
  messages: async (id: number, page = 0, size = 20) => (await apiClient.get<PageResponse<PlanMessage>>(`/api/travel-plans/${id}/messages`, { params: { page, size } })).data,
  sendMessage: async (id: number, content: string) => (await apiClient.post<PlanMessage>(`/api/travel-plans/${id}/messages`, { content })).data,
  bookings: async (id: number) => (await apiClient.get<BookingLink[]>(`/api/travel-plans/${id}/bookings`)).data,
  linkBooking: async (id: number, bookingId: number) => (await apiClient.post<BookingLink>(`/api/travel-plans/${id}/bookings`, { bookingId })).data,
  unlinkBooking: async (id: number, linkId: number) => apiClient.delete(`/api/travel-plans/${id}/bookings/${linkId}`),
}
export const hostApi = {
  applicationStatus: async () => (await apiClient.get<HostApplication>('/api/host/application/status')).data,
  application: async (id: number) => (await apiClient.get<HostApplication>(`/api/host/application/${id}`)).data,
  allApplications: async (pageNo = 0, pageSize = 10) => (await apiClient.get<PageResponse<HostApplication>>('/api/host/application/all', { params: { pageNo, pageSize } })).data,
  submitApplication: async (businessName: string, files: { pan: File; aadhaar: File; photo: File }) => {
    const form = new FormData(); form.append('application', new Blob([JSON.stringify({ businessName })], { type: 'application/json' }))
    form.append('pan', files.pan); form.append('aadhaar', files.aadhaar); form.append('photo', files.photo)
    return (await apiClient.post<HostApplication>('/api/host/application/apply', form)).data
  },
  documentPhotos: async () => (await apiClient.get<string[]>('/api/host/application/photos')).data,
  create: async (payload: { hostName: string; officePhoneNumbers?: string[]; officeEmails?: string[]; description?: string; active?: boolean }) => (await apiClient.post<HostProfile>('/host/create', payload)).data,
  getProfile: async (id: number) => (await apiClient.get<HostProfile>(`/host/${id}`)).data,
  update: async (payload: { hostName: string; active: boolean; description?: string }) => (await apiClient.patch<HostProfile>('/host/update', payload)).data,
  deactivate: async (hostId: number) => apiClient.patch(`/host/deactivate/${hostId}`),
  requestPhoneOtp: async (phoneNumber: string) => apiClient.post('/host/phone/verify', { phoneNumber }),
  verifyPhoneOtp: async (phoneNumber: string, otpCode: string) => apiClient.patch('/host/phone/otp', { phoneNumber, otpCode }),
  requestEmailOtp: async (email: string) => apiClient.post('/host/email/verify', { email }),
  verifyEmailOtp: async (email: string, otp: string) => apiClient.patch('/host/email/otp', { email, otp }),
}
export const hostPropertyApi = {
  hotelApplicationStatus: async () => (await apiClient.get<HotelApplication>('/api/hotel/application/status')).data,
  hotelApplications: async (pageNo = 0, pageSize = 10) => (await apiClient.get<PageResponse<HotelApplication>>('/api/hotel/applications', { params: { pageNo, pageSize } })).data,
  hotelApplication: async (id: number) => (await apiClient.get<HotelApplication>(`/api/hotel/application/${id}`)).data,
  refundOptions: async () => (await apiClient.get<string>('/api/hotel/refund-policies/options')).data,
  submitHotelApplication: async (input: {
    application: { hotelName: string; city: string; contactInfo: ContactInfo; description?: string }
    files: Record<'id' | 'address_proof' | 'hotel_license' | 'ownership_proof' | 'business_registration' | 'gst_certificate', File>
    refundPolicy: RefundPolicyRequest
    pricingPolicy: PricingPolicyRequest
  }) => {
    const form = new FormData()
    form.append('application', new Blob([JSON.stringify(input.application)], { type: 'application/json' }))
    for (const [key, file] of Object.entries(input.files)) form.append(key, file)
    form.append('refund_policy', new Blob([JSON.stringify(input.refundPolicy)], { type: 'application/json' }))
    form.append('pricing_policy', new Blob([JSON.stringify(input.pricingPolicy)], { type: 'application/json' }))
    return (await apiClient.post<HotelApplication>('/api/hotel/apply', form)).data
  },
  createHotel: async (payload: { amenities?: string[]; active?: boolean }) => (await apiClient.post<HostHotel>('/api/hotel/create', payload)).data,
  getHotel: async (id: number) => (await apiClient.get<HostHotel>(`/api/hotel/${id}`)).data,
  updateHotel: async (id: number, payload: { amenities?: string[]; active?: boolean }) => (await apiClient.patch<HostHotel>('/api/hotel/update', payload, { params: { hotelId: id } })).data,
  addHotelPhoto: async (id: number, file: File) => { const form = new FormData(); form.append('file', file); return apiClient.post(`/api/hotel/add/photo/${id}`, form) },
  hotelPhotos: async (id: number) => (await apiClient.get<string[]>('/api/hotel/photos', { params: { hotelId: id } })).data,
  removeHotelPhoto: async (id: number, filePath: string) => apiClient.delete(`/api/hotel/delete/photo/${id}`, { params: { filePath } }),
  rooms: async (id: number) => (await apiClient.get<Room[]>(`/api/room/hotel/${id}`)).data,
  roomPhotos: async (id: number) => (await apiClient.get<string[]>(`/api/room/photos/${id}`)).data,
  createRoom: async (application: Record<string, unknown>, photos: File[]) => {
    const form = new FormData(); form.append('application', new Blob([JSON.stringify(application)], { type: 'application/json' })); photos.forEach((file) => form.append('photos', file))
    return (await apiClient.post<Room>('/api/room/create', form)).data
  },
  deactivateRoom: async (id: number) => apiClient.patch(`/api/room/deactive/${id}`),
  hotelBookings: async (id: number) => (await apiClient.get<HotelBooking[]>(`/api/hotel/bookings/${id}`)).data,
}
export const adminApi = {
  summary: async () => (await apiClient.get<DashboardSummary>('/api/admin/dashboard/summary')).data,
  hotels: async (params: { page: number; size: number; city?: string; active?: boolean }) => (await apiClient.get<PageResponse<HotelSummary>>('/api/admin/hotels', { params })).data,
  hotel: async (id: number) => (await apiClient.get<HotelDetails>(`/api/admin/hotels/${id}`)).data,
  hotelApplications: async (params: { page: number; size: number; status?: string }) => (await apiClient.get<PageResponse<ApplicationDetails>>('/api/admin/hotel-applications', { params })).data,
  hotelApplication: async (id: number) => (await apiClient.get<ApplicationDetails>(`/api/admin/hotel-applications/${id}`)).data,
  hotelDocuments: async (id: number) => (await apiClient.get<VerificationDocument[]>(`/api/admin/hotel-applications/${id}/documents`)).data,
  approveHotel: async (id: number) => (await apiClient.patch<ApplicationDetails>(`/api/admin/hotel-applications/${id}/approve`)).data,
  rejectHotel: async (id: number, reason: string) => (await apiClient.patch<ApplicationDetails>(`/api/admin/hotel-applications/${id}/reject`, { reason })).data,
  hostApplications: async (params: { page: number; size: number; status?: string }) => (await apiClient.get<PageResponse<ApplicationDetails>>('/api/admin/host-applications', { params })).data,
  hostApplication: async (id: number) => (await apiClient.get<ApplicationDetails>(`/api/admin/host-applications/${id}`)).data,
  hostDocuments: async (id: number) => (await apiClient.get<VerificationDocument[]>(`/api/admin/host-applications/${id}/documents`)).data,
  approveHost: async (id: number) => (await apiClient.patch<ApplicationDetails>(`/api/admin/host-applications/${id}/approve`)).data,
  rejectHost: async (id: number, reason: string) => (await apiClient.patch<ApplicationDetails>(`/api/admin/host-applications/${id}/reject`, { reason })).data,
}
