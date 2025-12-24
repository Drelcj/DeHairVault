'use server'

/**
 * Shipping Service - DHL Integration
 * 
 * This module handles shipping rate calculations and tracking via DHL API.
 * 
 * DHL API Documentation:
 * - DHL Express API: https://developer.dhl.com/api-reference/dhl-express-mydhl-api
 * - Rate Request: POST /rates
 * - Shipment Creation: POST /shipments
 * - Tracking: GET /tracking
 * 
 * Required Environment Variables:
 * - DHL_API_KEY: Your DHL API key
 * - DHL_API_SECRET: Your DHL API secret
 * - DHL_ACCOUNT_NUMBER: Your DHL account number
 * - DHL_API_BASE_URL: API base URL (sandbox or production)
 */

// ============================================================================
// Types
// ============================================================================

export interface ShippingAddress {
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  country: string
  postalCode?: string
}

export interface PackageDetails {
  weight: number // in kg
  length: number // in cm
  width: number  // in cm
  height: number // in cm
}

export interface ShippingOption {
  id: string
  carrier: string
  serviceName: string
  serviceCode: string
  estimatedDays: number
  estimatedDeliveryDate: string
  priceNgn: number
  priceUsd: number
}

export interface ShippingRateResult {
  success: boolean
  options?: ShippingOption[]
  error?: string
}

export interface TrackingResult {
  success: boolean
  status?: string
  statusDescription?: string
  estimatedDeliveryDate?: string
  events?: TrackingEvent[]
  error?: string
}

export interface TrackingEvent {
  timestamp: string
  location: string
  status: string
  description: string
}

export interface ShipmentResult {
  success: boolean
  trackingNumber?: string
  labelUrl?: string
  error?: string
}

// ============================================================================
// DHL API Configuration (Commented out - pending integration)
// ============================================================================

// const DHL_CONFIG = {
//   apiKey: process.env.DHL_API_KEY || '',
//   apiSecret: process.env.DHL_API_SECRET || '',
//   accountNumber: process.env.DHL_ACCOUNT_NUMBER || '',
//   baseUrl: process.env.DHL_API_BASE_URL || 'https://express.api.dhl.com/mydhlapi/test',
// }

// const DHL_HEADERS = {
//   'Authorization': `Basic ${Buffer.from(`${DHL_CONFIG.apiKey}:${DHL_CONFIG.apiSecret}`).toString('base64')}`,
//   'Content-Type': 'application/json',
// }

// ============================================================================
// DHL Rate Request (Commented out - pending integration)
// ============================================================================

// /**
//  * Get shipping rates from DHL Express API
//  * 
//  * @param origin - Sender/warehouse address
//  * @param destination - Recipient address
//  * @param packages - Package dimensions and weight
//  * @returns Available shipping options with rates
//  */
// export async function getDHLRates(
//   origin: ShippingAddress,
//   destination: ShippingAddress,
//   packages: PackageDetails[]
// ): Promise<ShippingRateResult> {
//   try {
//     const requestBody = {
//       customerDetails: {
//         shipperDetails: {
//           postalCode: origin.postalCode || '',
//           cityName: origin.city,
//           countryCode: getCountryCode(origin.country),
//         },
//         receiverDetails: {
//           postalCode: destination.postalCode || '',
//           cityName: destination.city,
//           countryCode: getCountryCode(destination.country),
//         },
//       },
//       accounts: [{
//         typeCode: 'shipper',
//         number: DHL_CONFIG.accountNumber,
//       }],
//       plannedShippingDateAndTime: new Date().toISOString(),
//       unitOfMeasurement: 'metric',
//       isCustomsDeclarable: destination.country !== origin.country,
//       packages: packages.map((pkg, index) => ({
//         weight: pkg.weight,
//         dimensions: {
//           length: pkg.length,
//           width: pkg.width,
//           height: pkg.height,
//         },
//       })),
//     }
//
//     const response = await fetch(`${DHL_CONFIG.baseUrl}/rates`, {
//       method: 'POST',
//       headers: DHL_HEADERS,
//       body: JSON.stringify(requestBody),
//     })
//
//     if (!response.ok) {
//       const errorData = await response.json()
//       console.error('DHL API Error:', errorData)
//       return { success: false, error: 'Failed to get shipping rates' }
//     }
//
//     const data = await response.json()
//     
//     const options: ShippingOption[] = data.products?.map((product: any) => ({
//       id: product.productCode,
//       carrier: 'DHL',
//       serviceName: product.productName,
//       serviceCode: product.productCode,
//       estimatedDays: product.deliveryCapabilities?.estimatedDeliveryDateAndTime 
//         ? calculateDaysFromDate(product.deliveryCapabilities.estimatedDeliveryDateAndTime)
//         : 5,
//       estimatedDeliveryDate: product.deliveryCapabilities?.estimatedDeliveryDateAndTime || '',
//       priceNgn: convertToNgn(product.totalPrice?.price || 0, product.totalPrice?.priceCurrency || 'USD'),
//       priceUsd: product.totalPrice?.priceCurrency === 'USD' 
//         ? product.totalPrice?.price 
//         : convertToUsd(product.totalPrice?.price || 0, product.totalPrice?.priceCurrency || 'NGN'),
//     })) || []
//
//     return { success: true, options }
//   } catch (error) {
//     console.error('DHL Rate Request Error:', error)
//     return { success: false, error: 'Failed to connect to shipping service' }
//   }
// }

// ============================================================================
// DHL Shipment Creation (Commented out - pending integration)
// ============================================================================

// /**
//  * Create a shipment with DHL and get tracking number + label
//  * 
//  * @param orderId - Internal order ID
//  * @param origin - Sender address
//  * @param destination - Recipient address  
//  * @param packages - Package details
//  * @param serviceCode - Selected DHL service code
//  * @returns Tracking number and label URL
//  */
// export async function createDHLShipment(
//   orderId: string,
//   origin: ShippingAddress,
//   destination: ShippingAddress,
//   packages: PackageDetails[],
//   serviceCode: string
// ): Promise<ShipmentResult> {
//   try {
//     const requestBody = {
//       plannedShippingDateAndTime: new Date().toISOString(),
//       pickup: { isRequested: false },
//       productCode: serviceCode,
//       accounts: [{
//         typeCode: 'shipper',
//         number: DHL_CONFIG.accountNumber,
//       }],
//       customerDetails: {
//         shipperDetails: {
//           postalAddress: {
//             postalCode: origin.postalCode || '',
//             cityName: origin.city,
//             countryCode: getCountryCode(origin.country),
//             addressLine1: origin.addressLine1,
//             addressLine2: origin.addressLine2 || '',
//             provinceCode: origin.state,
//           },
//           contactInformation: {
//             companyName: 'DeHairVault',
//             phone: process.env.BUSINESS_PHONE || '',
//             email: process.env.BUSINESS_EMAIL || '',
//           },
//         },
//         receiverDetails: {
//           postalAddress: {
//             postalCode: destination.postalCode || '',
//             cityName: destination.city,
//             countryCode: getCountryCode(destination.country),
//             addressLine1: destination.addressLine1,
//             addressLine2: destination.addressLine2 || '',
//             provinceCode: destination.state,
//           },
//         },
//       },
//       content: {
//         packages: packages.map((pkg, index) => ({
//           weight: pkg.weight,
//           dimensions: {
//             length: pkg.length,
//             width: pkg.width,
//             height: pkg.height,
//           },
//         })),
//         isCustomsDeclarable: destination.country !== origin.country,
//         description: `Order ${orderId}`,
//         incoterm: 'DAP',
//         unitOfMeasurement: 'metric',
//       },
//       outputImageProperties: {
//         imageOptions: [{
//           typeCode: 'label',
//           templateName: 'ECOM26_84_001',
//         }],
//       },
//     }
//
//     const response = await fetch(`${DHL_CONFIG.baseUrl}/shipments`, {
//       method: 'POST',
//       headers: DHL_HEADERS,
//       body: JSON.stringify(requestBody),
//     })
//
//     if (!response.ok) {
//       const errorData = await response.json()
//       console.error('DHL Shipment Error:', errorData)
//       return { success: false, error: 'Failed to create shipment' }
//     }
//
//     const data = await response.json()
//     
//     return {
//       success: true,
//       trackingNumber: data.shipmentTrackingNumber,
//       labelUrl: data.documents?.[0]?.url || null,
//     }
//   } catch (error) {
//     console.error('DHL Shipment Creation Error:', error)
//     return { success: false, error: 'Failed to create shipment' }
//   }
// }

// ============================================================================
// DHL Tracking (Commented out - pending integration)
// ============================================================================

// /**
//  * Track a shipment via DHL API
//  * 
//  * @param trackingNumber - DHL tracking number
//  * @returns Current status and tracking events
//  */
// export async function trackDHLShipment(
//   trackingNumber: string
// ): Promise<TrackingResult> {
//   try {
//     const response = await fetch(
//       `${DHL_CONFIG.baseUrl}/tracking?trackingNumber=${trackingNumber}`,
//       {
//         method: 'GET',
//         headers: DHL_HEADERS,
//       }
//     )
//
//     if (!response.ok) {
//       return { success: false, error: 'Failed to get tracking info' }
//     }
//
//     const data = await response.json()
//     const shipment = data.shipments?.[0]
//     
//     if (!shipment) {
//       return { success: false, error: 'Shipment not found' }
//     }
//
//     return {
//       success: true,
//       status: shipment.status?.status || 'Unknown',
//       statusDescription: shipment.status?.description || '',
//       estimatedDeliveryDate: shipment.estimatedDeliveryDate || null,
//       events: shipment.events?.map((event: any) => ({
//         timestamp: event.timestamp,
//         location: `${event.location?.address?.addressLocality || ''}, ${event.location?.address?.countryCode || ''}`,
//         status: event.statusCode,
//         description: event.description,
//       })) || [],
//     }
//   } catch (error) {
//     console.error('DHL Tracking Error:', error)
//     return { success: false, error: 'Failed to connect to tracking service' }
//   }
// }

// ============================================================================
// Helper Functions (Commented out - pending integration)
// ============================================================================

// /**
//  * Convert country name to ISO 3166-1 alpha-2 code
//  */
// function getCountryCode(countryName: string): string {
//   const countryCodes: Record<string, string> = {
//     'Nigeria': 'NG',
//     'United States': 'US',
//     'United Kingdom': 'GB',
//     'Canada': 'CA',
//     'Ghana': 'GH',
//     'South Africa': 'ZA',
//     'Kenya': 'KE',
//     'Germany': 'DE',
//     'France': 'FR',
//     // Add more as needed
//   }
//   return countryCodes[countryName] || countryName.substring(0, 2).toUpperCase()
// }

// /**
//  * Calculate days from now until estimated delivery date
//  */
// function calculateDaysFromDate(dateString: string): number {
//   const deliveryDate = new Date(dateString)
//   const now = new Date()
//   const diffTime = Math.abs(deliveryDate.getTime() - now.getTime())
//   return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
// }

// /**
//  * Currency conversion helpers (use real rates in production)
//  */
// const EXCHANGE_RATES = {
//   USD_TO_NGN: 1550,
//   NGN_TO_USD: 1 / 1550,
// }

// function convertToNgn(amount: number, currency: string): number {
//   if (currency === 'NGN') return amount
//   if (currency === 'USD') return amount * EXCHANGE_RATES.USD_TO_NGN
//   return amount * EXCHANGE_RATES.USD_TO_NGN // Default assume USD
// }

// function convertToUsd(amount: number, currency: string): number {
//   if (currency === 'USD') return amount
//   if (currency === 'NGN') return amount * EXCHANGE_RATES.NGN_TO_USD
//   return amount // Default
// }

// ============================================================================
// Temporary Fallback - Flat Rate Shipping
// ============================================================================

/**
 * Temporary flat rate shipping calculation
 * Replace with DHL integration when ready
 * 
 * @param destinationCountry - Destination country name
 * @returns Shipping cost in NGN
 */
export async function calculateShippingCost(
  destinationCountry: string
): Promise<number> {
  // TODO: Replace with DHL API integration
  // return getDHLRates(warehouseAddress, destination, packages)
  
  // Temporary flat rates
  if (destinationCountry === 'Nigeria') {
    return 5000 // NGN 5,000 for domestic
  } else {
    return 15000 // NGN 15,000 for international
  }
}

/**
 * Get available shipping options for checkout
 * Currently returns flat rate options, will be replaced with DHL rates
 * 
 * @param destination - Destination address
 * @returns Available shipping options
 */
export async function getShippingOptions(
  destination: ShippingAddress
): Promise<ShippingRateResult> {
  // TODO: Replace with DHL API integration
  // const warehouseAddress: ShippingAddress = {
  //   addressLine1: process.env.WAREHOUSE_ADDRESS_LINE1 || '',
  //   city: process.env.WAREHOUSE_CITY || 'Lagos',
  //   state: process.env.WAREHOUSE_STATE || 'Lagos',
  //   country: 'Nigeria',
  //   postalCode: process.env.WAREHOUSE_POSTAL_CODE || '',
  // }
  // 
  // const defaultPackage: PackageDetails = {
  //   weight: 0.5, // Average hair product weight
  //   length: 30,
  //   width: 20,
  //   height: 10,
  // }
  //
  // return getDHLRates(warehouseAddress, destination, [defaultPackage])
  
  const isDomestic = destination.country === 'Nigeria'
  
  return {
    success: true,
    options: [
      {
        id: 'standard',
        carrier: 'Standard Shipping',
        serviceName: isDomestic ? 'Standard Delivery' : 'International Standard',
        serviceCode: 'STANDARD',
        estimatedDays: isDomestic ? 3 : 7,
        estimatedDeliveryDate: getEstimatedDate(isDomestic ? 3 : 7),
        priceNgn: isDomestic ? 5000 : 15000,
        priceUsd: isDomestic ? 3.23 : 9.68,
      },
      // Uncomment when DHL integration is ready
      // {
      //   id: 'express',
      //   carrier: 'DHL Express',
      //   serviceName: 'DHL Express Worldwide',
      //   serviceCode: 'EXPRESS_WORLDWIDE',
      //   estimatedDays: isDomestic ? 1 : 3,
      //   estimatedDeliveryDate: getEstimatedDate(isDomestic ? 1 : 3),
      //   priceNgn: isDomestic ? 10000 : 35000,
      //   priceUsd: isDomestic ? 6.45 : 22.58,
      // },
    ],
  }
}

/**
 * Calculate estimated delivery date
 */
function getEstimatedDate(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().split('T')[0]
}

/**
 * Placeholder for tracking - returns mock data
 * Replace with DHL tracking when integrated
 */
export async function trackShipment(
  trackingNumber: string
): Promise<TrackingResult> {
  // TODO: Replace with DHL tracking
  // return trackDHLShipment(trackingNumber)
  
  return {
    success: false,
    error: 'Tracking not yet available. DHL integration pending.',
  }
}

/**
 * Placeholder for shipment creation - returns mock data  
 * Replace with DHL shipment creation when integrated
 */
export async function createShipment(
  orderId: string,
  destination: ShippingAddress,
  _packages?: PackageDetails[]
): Promise<ShipmentResult> {
  // TODO: Replace with DHL shipment creation
  // const warehouseAddress: ShippingAddress = { ... }
  // return createDHLShipment(orderId, warehouseAddress, destination, packages, 'EXPRESS_WORLDWIDE')
  
  return {
    success: false,
    error: 'Shipment creation not yet available. DHL integration pending.',
  }
}
