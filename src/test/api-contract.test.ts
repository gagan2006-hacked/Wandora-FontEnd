import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

describe('supplied API contract', () => {
  it('cross-checks every OpenAPI method/path against the saved Swagger UI', () => {
    const root = process.cwd()
    const spec = JSON.parse(fs.readFileSync(path.join(root, 'wandora-apis.json'), 'utf8')) as {
      paths: Record<string, Record<string, unknown>>
    }
    const swagger = fs.readFileSync(path.join(root, 'Wandora.html'), 'utf8')
    const operations = Object.entries(spec.paths).flatMap(([route, methods]) =>
      Object.keys(methods).map((method) => `${method.toUpperCase()} ${route}`),
    )
    const rendered = [...swagger.matchAll(/class="opblock opblock-([a-z]+)"[^>]*id="operations-[^"]+[\s\S]*?data-path="([^"]+)"/g)]
      .map((match) => `${match[1]!.toUpperCase()} ${match[2]}`)

    expect(operations).toHaveLength(105)
    expect(rendered).toHaveLength(105)
    expect(new Set(rendered)).toEqual(new Set(operations))
  })

  it('inventories the requested category headings and all operation entries', () => {
    const inventory = fs.readFileSync(path.join(process.cwd(), 'docs', 'api-inventory.md'), 'utf8')
    for (const category of ['Authentication & OTP', 'Profile', 'User discovery', 'Friendships', 'Hotel search', 'Host profile and verification', 'Host applications', 'Hotels', 'Rooms', 'Bookings', 'Payments', 'Booking drive', 'Collaborative travel plans', 'Admin']) {
      expect(inventory).toContain(`## ${category} (`)
    }
    expect((inventory.match(/^### /gm) ?? [])).toHaveLength(105)
  })
})
