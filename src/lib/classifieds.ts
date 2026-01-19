import type {
  EnergyDpeLabel,
  EnergyGesLabel,
  Property,
  PropertyClassified,
  PropertyType,
} from '@immoteur/openapi-zod';

export type ClassifiedSourceLink = Pick<PropertyClassified, 'id' | 'source'>;

export type PropertyCard = {
  id: string;
  imageUrl: string | null;
  price: number | null;
  pricePerSquareUnit: number | null;
  roomCount: number | null;
  bedroomCount: number | null;
  area: number | null;
  propertyType: PropertyType | null;
  dpeLabel: EnergyDpeLabel | null;
  gesLabel: EnergyGesLabel | null;
  postcode: string;
  city: string;
  department: string;
  description: string;
  isProfessional: boolean;
  sources: ClassifiedSourceLink[];
  firstSeenAt: string;
};

type PropertyWithOptionalDescription = Omit<Property, 'description'> & {
  description?: string | null;
};

export function toPropertyCards(
  properties: PropertyWithOptionalDescription[],
  limit = 15,
): PropertyCard[] {
  const cards: PropertyCard[] = [];

  for (const property of properties) {
    const sources = collectSourceLinks(property.classifieds);
    const isProfessional = property.classifieds.reduce((hasProfessional, classified) => {
      if (hasProfessional) return true;
      return classified.status.current === 'available' && classified.publisher.isProfessional;
    }, false);

    cards.push({
      id: property.id,
      imageUrl: pickImageUrl(property),
      price: property.transaction.price.current ?? null,
      pricePerSquareUnit: property.transaction.price.perSquareUnit ?? null,
      roomCount: property.property.roomCount ?? null,
      bedroomCount: property.property.bedroomCount ?? null,
      area: property.property.area ?? null,
      propertyType: property.property.type ?? null,
      dpeLabel: property.energy?.dpe?.label ?? null,
      gesLabel: property.energy?.ges?.label ?? null,
      postcode: property.location.postcode,
      city: property.location.city.name,
      department: property.location.department,
      description: property.description ?? '',
      isProfessional,
      sources,
      firstSeenAt: property.meta.firstSeenAt,
    });

    if (cards.length >= limit) break;
  }

  return cards;
}

export function collectSourceLinks(classifieds: PropertyClassified[]): ClassifiedSourceLink[] {
  const seen = new Set<string>();
  const sources: ClassifiedSourceLink[] = [];

  for (const classified of classifieds) {
    const url = classified.source?.url;
    if (!url || seen.has(url)) continue;
    seen.add(url);
    sources.push({ id: classified.id, source: classified.source });
  }

  return sources;
}

export function pickImageUrl(property: PropertyWithOptionalDescription): string | null {
  const images = property.media?.images ?? [];
  if (images.length === 0) return null;
  const [first] = [...images].sort((a, b) => a.position - b.position);
  return first?.url ?? null;
}
