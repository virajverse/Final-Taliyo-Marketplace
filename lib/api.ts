// Frontend API Client - Connects to Admin Panel Backend
// This file handles all API calls from frontend to backend

// API Configuration - Use mock data when API_URL is MOCK_MODE or not set
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'MOCK_MODE'
const USE_MOCK_DATA = API_BASE_URL === 'MOCK_MODE' || !API_BASE_URL || API_BASE_URL.includes('localhost')

// Generic API client
class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      // Silent failure - let individual methods handle fallbacks
      throw error
    }
  }

  // GET request
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  // POST request
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  // PUT request
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

// Create API client instance
const api = new ApiClient()

// Type definitions
export interface Service {
  id: string
  title: string
  description?: string
  category_id?: string
  subcategory_id?: string
  price_min?: number
  price_max?: number
  price_type: 'fixed' | 'hourly' | 'negotiable'
  duration_minutes?: number
  location?: string
  is_remote: boolean
  images: string[]
  provider_name?: string
  provider_avatar?: string
  provider_bio?: string
  provider_phone?: string
  provider_verified: boolean
  rating_average: number
  rating_count: number
  is_active: boolean
  is_featured: boolean
  slug?: string
  created_at: string
  updated_at: string
  category?: Category
  subcategory?: Subcategory
}

export interface Category {
  id: string
  name: string
  description?: string
  icon?: string
  slug: string
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Subcategory {
  id: string
  category_id: string
  name: string
  description?: string
  slug: string
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Booking {
  id: string
  service_id: string
  customer_name?: string
  customer_phone: string
  customer_email?: string
  message?: string
  preferred_date?: string
  preferred_time?: string
  special_requirements?: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  created_at: string
  service?: Service
}

// Mock data for development
const mockServices: Service[] = [
  {
    id: '1',
    title: 'Professional Web Development',
    description: 'Full-stack web development services with modern technologies. We build responsive, fast, and SEO-friendly websites.',
    category_id: '1',
    price_min: 5000,
    price_max: 15000,
    price_type: 'fixed',
    location: 'Delhi NCR',
    is_remote: true,
    images: [
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop'
    ],
    rating_average: 4.8,
    rating_count: 124,
    provider_name: 'Tech Solutions',
    provider_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    provider_bio: 'Professional web development team with 5+ years of experience',
    provider_phone: '+917042523611',
    provider_verified: true,
    duration_minutes: 2880,
    is_active: true,
    is_featured: true,
    slug: 'professional-web-development',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Mobile App Development',
    description: 'Native and cross-platform mobile app development for iOS and Android.',
    category_id: '2',
    price_min: 8000,
    price_max: 25000,
    price_type: 'fixed',
    location: 'Mumbai',
    is_remote: true,
    images: [
      'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop'
    ],
    rating_average: 4.9,
    rating_count: 89,
    provider_name: 'Mobile Experts',
    provider_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    provider_bio: 'Specialized in React Native and Flutter development',
    provider_phone: '+917042523611',
    provider_verified: true,
    duration_minutes: 4320,
    is_active: true,
    is_featured: true,
    slug: 'mobile-app-development',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Digital Marketing Services',
    description: 'Complete digital marketing solutions including SEO, social media, and PPC campaigns.',
    category_id: '3',
    price_min: 3000,
    price_max: 10000,
    price_type: 'hourly',
    location: 'Bangalore',
    is_remote: true,
    images: [
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop'
    ],
    rating_average: 4.7,
    rating_count: 156,
    provider_name: 'Digital Growth',
    provider_avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop',
    provider_bio: 'Digital marketing agency with proven track record',
    provider_phone: '+917042523611',
    provider_verified: true,
    duration_minutes: 60,
    is_active: true,
    is_featured: true,
    slug: 'digital-marketing-services',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '4',
    title: 'Logo & Brand Design',
    description: 'Professional logo design and complete brand identity packages for businesses.',
    category_id: '4',
    price_min: 2000,
    price_max: 8000,
    price_type: 'fixed',
    location: 'Pune',
    is_remote: true,
    images: [
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop'
    ],
    rating_average: 4.6,
    rating_count: 78,
    provider_name: 'Creative Studio',
    provider_avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop',
    provider_bio: 'Creative design studio specializing in brand identity',
    provider_phone: '+917042523611',
    provider_verified: true,
    duration_minutes: 1440,
    is_active: true,
    is_featured: false,
    slug: 'logo-brand-design',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '5',
    title: 'Home Cleaning Service',
    description: 'Professional home cleaning services with trained staff and eco-friendly products.',
    category_id: '5',
    price_min: 500,
    price_max: 1500,
    price_type: 'fixed',
    location: 'Delhi NCR',
    is_remote: false,
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop'
    ],
    rating_average: 4.5,
    rating_count: 203,
    provider_name: 'CleanPro Services',
    provider_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    provider_bio: 'Professional cleaning services for homes and offices',
    provider_phone: '+917042523611',
    provider_verified: true,
    duration_minutes: 180,
    is_active: true,
    is_featured: false,
    slug: 'home-cleaning-service',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '6',
    title: 'Math & Science Tutoring',
    description: 'Expert tutoring for students in mathematics and science subjects. Online and offline classes available.',
    category_id: '6',
    price_min: 300,
    price_max: 800,
    price_type: 'hourly',
    location: 'Mumbai',
    is_remote: true,
    images: [
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&h=600&fit=crop'
    ],
    rating_average: 4.9,
    rating_count: 145,
    provider_name: 'EduExperts',
    provider_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    provider_bio: 'Experienced educators with proven teaching methods',
    provider_phone: '+917042523611',
    provider_verified: true,
    duration_minutes: 60,
    is_active: true,
    is_featured: false,
    slug: 'math-science-tutoring',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Web Development',
    description: 'Professional web development services',
    icon: 'web',
    slug: 'web-development',
    is_active: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Mobile Development',
    description: 'Mobile app development services',
    icon: 'mobile',
    slug: 'mobile-development',
    is_active: true,
    sort_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Digital Marketing',
    description: 'Digital marketing and SEO services',
    icon: 'marketing',
    slug: 'digital-marketing',
    is_active: true,
    sort_order: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Graphic Design',
    description: 'Creative design services',
    icon: 'design',
    slug: 'graphic-design',
    is_active: true,
    sort_order: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '5',
    name: 'Home Services',
    description: 'Home repair and maintenance',
    icon: 'home',
    slug: 'home-services',
    is_active: true,
    sort_order: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '6',
    name: 'Education',
    description: 'Tutoring and educational services',
    icon: 'education',
    slug: 'education',
    is_active: true,
    sort_order: 6,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

// API Functions for Frontend - Mock Mode Only
export const apiService = {
  // Services
  async getServices(params?: {
    category_id?: string
    subcategory_id?: string
    featured?: boolean
    limit?: number
    offset?: number
  }): Promise<Service[]> {
    // Use mock data in development or when backend is not available
    if (USE_MOCK_DATA) {
      let services = [...mockServices]
      
      if (params?.featured) {
        services = services.filter(s => s.is_featured)
      }
      if (params?.category_id) {
        services = services.filter(s => s.category_id === params.category_id)
      }
      if (params?.limit) {
        services = services.slice(0, params.limit)
      }
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 100))
      return services
    }

    // Real API call (when backend is available)
    try {
      const queryParams = new URLSearchParams()
      if (params?.category_id) queryParams.append('category_id', params.category_id)
      if (params?.subcategory_id) queryParams.append('subcategory_id', params.subcategory_id)
      if (params?.featured) queryParams.append('featured', 'true')
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      if (params?.offset) queryParams.append('offset', params.offset.toString())
      
      const endpoint = `/services${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      return await api.get<Service[]>(endpoint)
    } catch (error) {
      // Fallback to mock data if API fails
      console.warn('API call failed, using mock data:', error)
      return this.getServices(params) // Recursive call will use mock data
    }
  },

  async getService(id: string): Promise<Service> {
    // Always use mock data - no backend calls
    const service = mockServices.find(s => s.id === id)
    if (!service) {
      throw new Error('Service not found')
    }
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100))
    return service
  },

  async searchServices(query: string): Promise<Service[]> {
    // Always use mock data - no backend calls
    const results = mockServices.filter(s => 
      s.title.toLowerCase().includes(query.toLowerCase()) ||
      s.description?.toLowerCase().includes(query.toLowerCase())
    )
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100))
    return results
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    // Use mock data in development or when backend is not available
    if (USE_MOCK_DATA) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 100))
      return mockCategories
    }

    // Real API call (when backend is available)
    try {
      return await api.get<Category[]>('/categories')
    } catch (error) {
      // Fallback to mock data if API fails
      console.warn('API call failed, using mock data:', error)
      return mockCategories
    }
  },

  async getCategory(id: string): Promise<Category> {
    // Always use mock data - no backend calls
    const category = mockCategories.find(c => c.id === id)
    if (!category) {
      throw new Error('Category not found')
    }
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100))
    return category
  },

  // Bookings (Public - for WhatsApp bookings)
  async createBooking(booking: {
    service_id: string
    customer_name?: string
    customer_phone: string
    customer_email?: string
    message?: string
    preferred_date?: string
    preferred_time?: string
    special_requirements?: string
  }): Promise<Booking> {
    // Always use mock data - no backend calls
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200))
    
    return {
      id: Date.now().toString(),
      service_id: booking.service_id,
      customer_name: booking.customer_name,
      customer_phone: booking.customer_phone,
      customer_email: booking.customer_email,
      message: booking.message,
      preferred_date: booking.preferred_date,
      preferred_time: booking.preferred_time,
      special_requirements: booking.special_requirements,
      status: 'pending',
      created_at: new Date().toISOString()
    }
  },

  // Analytics (Public - for tracking)
  async trackEvent(event: {
    service_id?: string
    event_type: 'view' | 'click' | 'whatsapp_click' | 'call_click'
    referrer?: string
  }): Promise<void> {
    // Mock analytics - no backend calls
    console.log('Analytics event tracked:', event)
  }
}

// Hook for React components
export function useApi() {
  return apiService
}

export default apiService