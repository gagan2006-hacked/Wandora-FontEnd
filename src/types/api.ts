export type UserRole = 'USER' | 'HOST' | 'ADMIN' | (string & {})
export type Gender = 'MALE' | 'FEMALE' | 'OTHERS' | 'NOT_DEFINED'
export type BookingStatus = 'RESERVED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'FAILED' | 'EXPIRED'
export type PlanStatus = 'PLANNING' | 'READY_TO_BOOK' | 'BOOKED' | 'COMPLETED' | 'CANCELLED'
export type HostApplicationStatus = 'CREATED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED'
export type HotelApplicationStatus = 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED'

export interface AuthResponse {
  userId?: number
  roles?: UserRole[]
}
export interface RegisterRequest { name: string; username: string; email: string; password: string; gender?: Gender }
export interface UpdateProfileRequestDto { name: string; bio?: string; gender?: Gender }
export interface LoginRequest { identifier: string; password: string }
export interface OtpVerificationRequest { email: string; otp: string }
export interface UserProfile {
  id: number; name: string; username: string; email: string; profileImg?: string; bio?: string; gender?: Gender
  status?: string; creationType?: string; authProvider?: string; emailVerified?: boolean; phones?: string[]; createdAt?: string
}
export interface UserSummary { id: number; name: string; username: string; profileImg?: string; bio?: string }
export interface PageResponse<T> {
  content: T[]; totalPages: number; totalElements: number; size: number; number: number; numberOfElements: number
  first: boolean; last: boolean; empty: boolean
}
export interface ContactInfo {
  state?: string; building?: string; street?: string; pinCode?: string; locationUrl?: string; landmark?: string
  longitude?: string; latitude?: string; phoneNumber?: string; email?: string
}
export interface HostPublic { hostName?: string; officePhoneNumbers?: string[]; officeEmails?: string[]; businessName?: string; description?: string; averageRating?: number }
export interface PublicHotel {
  hotelName?: string; city?: string; contactInfo?: ContactInfo; photoUrls?: string[]; amenities?: string[]; active?: boolean; host?: HostPublic
}
export interface HotelSearchResult { hotel?: PublicHotel & { id?: number }; price?: number }
export interface PublicRoom { id: number; type?: string; description?: string; basePrice?: number; amenities?: string[]; totalCount?: number; roomCapacity?: number }
export interface HotelInfo { hotel?: PublicHotel; rooms?: PublicRoom[] }
export interface BookingRequest { hotelId: number; roomId: number; roomsCount: number; checkInDate: string; checkOutDate: string }
export interface Guest { name?: string; username?: string }
export interface Booking {
  bookingId?: number; hotelId?: number; roomId?: number; roomsCount?: number; checkInDate?: string; checkOutDate?: string
  bookingStatus?: BookingStatus; guests?: Guest[]; amount?: number
}
export interface PaymentOrder { key?: string; orderId?: string; currency?: string; amount?: number }
export interface PaymentVerification { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }
export interface Friendship { friendshipId?: number; userId?: number; status?: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' }
export interface FriendshipStatus { userId?: number; isFriend?: boolean; requestPending?: boolean }
export interface BookingDrive { id?: number; bookingId?: number }
export interface BookingPhoto { id?: number; originalFileName?: string; contentType?: string; fileSize?: number; downloadUrl?: string }
export interface TravelPlan {
  id: number; title: string; description?: string; destination: string; startDate: string; endDate: string; budget?: number
  currency?: string; createdBy?: number; createdByName?: string; status?: PlanStatus; createdAt?: string; updatedAt?: string
}
export interface CreatePlanRequest { title: string; description?: string; destination: string; startDate: string; endDate: string; budget?: number; currency?: string }
export type UpdatePlanRequest = Partial<Omit<CreatePlanRequest, 'title' | 'destination' | 'startDate' | 'endDate'>> & Partial<Pick<CreatePlanRequest, 'title' | 'destination' | 'startDate' | 'endDate'>>
export interface PlanMember {
  id?: number; userId?: number; name?: string; username?: string; role?: 'OWNER' | 'ADMIN' | 'MEMBER'
  status?: 'INVITED' | 'ACCEPTED' | 'DECLINED' | 'REMOVED'; invitedBy?: number; joinedAt?: string
}
export interface Invitation { id?: number; travelPlanId?: number; title?: string; destination?: string; startDate?: string; endDate?: string; invitedBy?: number; invitedByName?: string; createdAt?: string }
export interface StayOption {
  id?: number; travelPlanId?: number; hotelId?: number; hotelName?: string; city?: string; addedBy?: number
  notes?: string; estimatedPrice?: number; selected?: boolean
}
export interface PlanMessage {
  id?: number; travelPlanId?: number; senderId?: number; senderName?: string; content?: string; messageType?: string; createdAt?: string
}
export interface ItineraryItem {
  id?: number; travelPlanId?: number; title?: string; description?: string; activityDate?: string; startTime?: string
  endTime?: string; locationName?: string; latitude?: number; longitude?: number; sortOrder?: number; createdBy?: number
}
export interface BookingLink {
  id?: number; travelPlanId?: number; bookingId?: number; linkedBy?: number; linkedAt?: string; hotelId?: number
  hotelName?: string; checkInDate?: string; checkOutDate?: string; bookingStatus?: string
}
export interface HostApplication {
  id?: number; status?: HostApplicationStatus; businessName?: string; rejectionReason?: string; reviewedAt?: string
  documents?: string[]; auditInfo?: { createdAt?: string; updatedAt?: string }
}
export interface HostProfile {
  id?: number; hostName?: string; officePhoneNumbers?: string[]; officeEmails?: string[]; businessName?: string
  description?: string; status?: string; averageRating?: number; active?: boolean
  auditInfo?: { createdAt?: string; updatedAt?: string }
}
export interface HostHotel {
  id?: number; hotelName?: string; city?: string; contactInfo?: ContactInfo; photos?: string[]; amenities?: string[]; active?: boolean
}
export interface HotelApplication {
  id?: number; status?: HotelApplicationStatus; hotelName?: string; city?: string; rejectionReason?: string
  reviewedAt?: string; description?: string
}
export interface RefundPolicyRule { hoursBeforeCheckIn: number; refundPercentage: number }
export interface RefundPolicyRequest { policyType: 'FLEXIBLE' | 'MODERATE' | 'STRICT' | 'CUSTOM'; rules: RefundPolicyRule[] }
export interface PricingPolicyRequest { basePricePerNight: number; weekendPricePerNight: number; minimumStayNights: number; maximumStayNights: number; cleaningFee: number; extraGuestFee: number }
export interface HostHotel { id?: number; hotelName?: string; city?: string; contactInfo?: ContactInfo; photos?: string[]; amenities?: string[]; active?: boolean }
export interface HostHotel {
  id?: number; hotelName?: string; city?: string; contactInfo?: ContactInfo; photos?: string[]; amenities?: string[]; active?: boolean
}
export interface Room {
  id?: number; type?: string; description?: string; basePrice?: number; photos?: string[]; amenities?: string[]
  totalCount?: number; roomCapacity?: number
}
export interface HotelBooking {
  hotel?: HostHotel; room?: Room; roomsCount?: number; checkInDate?: string; checkOutDate?: string
  bookingStatus?: BookingStatus; amount?: number
}
export interface HotelSummary {
  id?: number; hotelName?: string; city?: string; active?: boolean; hostId?: number; hostName?: string; hostBusinessName?: string
  hostStatus?: string; applicationId?: number; applicationStatus?: HotelApplicationStatus; createdAt?: string
}
export interface HotelDetails extends HotelSummary { contactInfo?: ContactInfo }
export interface VerificationDocument {
  documentType?: string; originalFilename?: string; contentType?: string; downloadUrl?: string
}
export interface ApplicationDetails {
  id?: number; status?: string; hostId?: number; hostName?: string; hostEmail?: string; hostStatus?: string
  applicantId?: number; applicantName?: string; applicantEmail?: string; businessName?: string; hotelName?: string
  city?: string; contactInfo?: ContactInfo; description?: string; rejectionReason?: string; appliedAt?: string; reviewedAt?: string
  reviewerId?: number; verificationDocuments?: Omit<VerificationDocument, 'downloadUrl'>[]
}
export interface DashboardSummary {
  totalBookings?: number; reservedBookings?: number; confirmedBookings?: number; completedBookings?: number
  cancelledBookings?: number; pendingApplications?: number; approvedApplications?: number; rejectedApplications?: number
}
