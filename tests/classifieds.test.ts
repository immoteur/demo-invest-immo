import { Property as PropertySchema } from '@immoteur/openapi-zod';
import { describe, expect, it } from 'vitest';
import { pickImageUrl } from '../src/lib/classifieds';

const sampleProperty = PropertySchema.parse({
  id: '3a8f1d72-3d0b-4ee6-9a83-a7a9a73ae6c2',
  description: 'Bright apartment with balcony and open views.',
  classifieds: [
    {
      id: '7f6e3b4d-9c22-46a0-8f20-0d1a2b3c4d5e',
      description: 'Classified description fallback.',
      publisher: { isProfessional: true },
      source: { domain: 'example.com', url: 'https://example.com/listing/1' },
      status: { current: 'available' },
      transaction: {
        current: 320000,
        initial: 350000,
        history: [],
      },
    },
    {
      id: '2c7fd0a1-4b8e-4c6a-a2d8-92a3d96d0d72',
      description: 'Secondary source listing.',
      publisher: { isProfessional: false },
      source: { domain: 'example.net', url: 'https://example.net/listing/2' },
      status: { current: 'available' },
      transaction: {
        current: 320000,
        initial: 350000,
        history: [],
      },
    },
  ],
  energy: {
    dpe: { date: '2024-01-10', label: 'g', value: 420 },
    ges: { date: '2024-01-10', label: 'f', value: 78 },
  },
  location: {
    city: { inseeCode: '75056', name: 'Paris' },
    country: 'france',
    department: '75',
    postcode: '75001',
  },
  media: {
    images: [
      {
        id: '90f10d54-6d61-4b2a-a19c-12d962d9b0af',
        position: 2,
        url: 'https://images.immoteur.com/sample/second.jpg',
      },
      {
        id: '2c1d5c25-9b3e-4f9e-a3db-5b8dd89f8cb3',
        position: 1,
        url: 'https://images.immoteur.com/sample/first.jpg',
      },
    ],
  },
  meta: {
    firstSeenAt: '2025-05-10T08:00:00Z',
    lastSeenAt: '2025-06-20T11:00:00Z',
  },
  property: {
    type: 'apartment',
    roomCount: 3,
    bedroomCount: 2,
  },
  status: { current: 'available' },
  transaction: {
    type: 'sale',
    price: {
      current: 320000,
      initial: 350000,
      history: [],
    },
  },
});

describe('pickImageUrl', () => {
  it('selects the lowest position image', () => {
    const url = pickImageUrl(sampleProperty);
    expect(url).toBe('https://images.immoteur.com/sample/first.jpg');
  });
});
