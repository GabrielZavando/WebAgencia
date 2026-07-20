import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getSystemConfig } from './config'
import { companyConfig } from '../config/company.config'

describe('Config Utils (Landing)', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  it('debe retornar configuración estática directamente (sin llamada a API)', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const result = await getSystemConfig()

    expect(fetchMock).not.toHaveBeenCalled()

    expect(result.name).toBe(companyConfig.name)
    expect(result.email).toBe(companyConfig.email)
    expect(result.description).toBe(companyConfig.description)
    expect(result.social).toEqual(companyConfig.social)
  })

  it('debe retornar todos los campos requeridos de SystemConfig', async () => {
    const result = await getSystemConfig()

    expect(result).toHaveProperty('name')
    expect(result).toHaveProperty('description')
    expect(result).toHaveProperty('websiteUrl')
    expect(result).toHaveProperty('logoUrl')
    expect(result).toHaveProperty('faviconUrl')
    expect(result).toHaveProperty('address')
    expect(result).toHaveProperty('phone')
    expect(result).toHaveProperty('email')
    expect(result).toHaveProperty('servicesUrl')
    expect(result).toHaveProperty('social')
    expect(result.social).toHaveProperty('linkedinUrl')
    expect(result.social).toHaveProperty('instagramUrl')
  })
})
