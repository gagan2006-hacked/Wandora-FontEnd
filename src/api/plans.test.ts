import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from './http'
import { plansApi, hotelSearchApi } from './features'

vi.mock('./http', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

describe('contract-driven travel plan and stay APIs', () => {
  beforeEach(() => vi.clearAllMocks())

  it('sends the HotelRequestInfo properties as query parameters', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: { content: [] } } as never)
    const hotelRequestInfo = { city: 'Goa', roomCount: 2, pageNo: 0, pageSize: 10 }
    await hotelSearchApi.search({ hotelRequestInfo })
    expect(apiClient.get).toHaveBeenCalledWith('/api/hotels/search', { params: hotelRequestInfo })
  })

  it('uses the documented public hotel-detail route', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: {} } as never)
    await hotelSearchApi.detail(17)
    expect(apiClient.get).toHaveBeenCalledWith('/api/hotels/search/17/info')
  })

  it('uses documented status, member, and booking-link endpoints', async () => {
    vi.mocked(apiClient.patch).mockResolvedValue({ data: {} } as never)
    vi.mocked(apiClient.delete).mockResolvedValue({} as never)
    await plansApi.updateStatus(7, 'READY_TO_BOOK')
    await plansApi.removeMember(7, 42)
    await plansApi.unlinkBooking(7, 9)
    expect(apiClient.patch).toHaveBeenCalledWith('/api/travel-plans/7/status', { status: 'READY_TO_BOOK' })
    expect(apiClient.delete).toHaveBeenNthCalledWith(1, '/api/travel-plans/7/members/42')
    expect(apiClient.delete).toHaveBeenNthCalledWith(2, '/api/travel-plans/7/bookings/9')
  })

  it('sends itinerary reorder as the documented itemIds property', async () => {
    vi.mocked(apiClient.patch).mockResolvedValue({ data: [] } as never)
    await plansApi.reorderItinerary(11, [3, 4, 5])
    expect(apiClient.patch).toHaveBeenCalledWith('/api/travel-plans/11/itinerary/reorder', { itemIds: [3, 4, 5] })
  })
})
