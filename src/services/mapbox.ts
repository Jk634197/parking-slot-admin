interface MapboxFeature {
  id: string;
  text: string;
  address?: string;
  context?: {
    id: string;
    text: string;
  }[];
}

interface MapboxResponse {
  features: MapboxFeature[];
}

interface PlaceDetails {
  name?: string;
  address?: {
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    country?: string;
    zip?: string;
  };
}

export async function getPlaceDetails(lng: number, lat: number): Promise<PlaceDetails> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) return {};

  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}&types=address,poi,place,neighborhood,locality,postcode,district,region,country`
    );
    const data = (await response.json()) as MapboxResponse;

    if (!data.features?.length) return {};

    const feature = data.features[0];
    const context = feature.context || [];

    const country = context.find((c) => c.id.startsWith('country'))?.text;
    const state = context.find((c) => c.id.startsWith('region'))?.text;
    const city = context.find((c) => c.id.startsWith('place'))?.text;
    const postcode = context.find((c) => c.id.startsWith('postcode'))?.text;

    // Split the address into address1 and address2 if it contains a comma
    const [address1, address2] = (feature.address || feature.text).split(',').map((s) => s.trim());

    return {
      name: feature.text,
      address: {
        address1: address1 || '',
        address2: address2 || '',
        city: city || '',
        state: state || '',
        country: country || '',
        zip: postcode || '',
      },
    };
  } catch (error) {
    return {};
  }
}
