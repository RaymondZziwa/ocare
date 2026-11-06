/**
 * Delivery rules for app and website orders.
 *  - We only deliver in and around Kampala.
 *  - Delivery is a flat fee (UGX 5,000 by default).
 *  - Orders placed from 11pm are delivered the next morning.
 * All of these can be tuned with environment variables without a code change.
 */

const num = (v: unknown, fallback: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
};

export const DELIVERY_FEE = () => num(process.env.DELIVERY_FEE, 5000);
export const DELIVERY_RADIUS_KM = () => num(process.env.DELIVERY_RADIUS_KM, 15);
/** Hour (Kampala time, 24h) from which new orders go to the next morning */
export const LATE_CUTOFF_HOUR = () => num(process.env.DELIVERY_LATE_CUTOFF_HOUR, 23);
/** Hour (Kampala time) the first deliveries go out in the morning */
export const MORNING_START_HOUR = () => num(process.env.DELIVERY_MORNING_START_HOUR, 8);

/** Kampala city centre (Constitutional Square) */
export const KAMPALA_CENTRE = { lat: 0.3136, lng: 32.5811 };

/** Neighbourhoods we deliver to. Used when the customer picks an area instead of sharing GPS. */
export const KAMPALA_AREAS = [
  'Banda', 'Bugolobi', 'Bukoto', 'Bulenga', 'Bunamwaya', 'Bunga', 'Busega', 'Butabika', 'Bwaise',
  'Bweyogerere', 'Central Business District', 'Ggaba', 'Kabalagala', 'Kajjansi', 'Kalerwe', 'Kamwokya',
  'Kansanga', 'Kanyanya', 'Kasubi', 'Kawaala', 'Kawempe', 'Kibuli', 'Kibuye', 'Kira', 'Kireka',
  'Kisaasi', 'Kisenyi', 'Kitintale', 'Kiwatule', 'Kololo', 'Komamboga', 'Kulambiro', 'Kyaliwajjala',
  'Kyambogo', 'Kyanja', 'Kyebando', 'Lubaga', 'Lubowa', 'Lukuli', 'Lungujja', 'Luzira', 'Makerere',
  'Makindye', 'Mbuya', 'Mengo', 'Mulago', 'Munyonyo', 'Mutundwe', 'Mutungo', 'Muyenga', 'Naalya',
  'Naguru', 'Najjanankumbi', 'Najjera', 'Nakasero', 'Nakawa', 'Namugongo', 'Namungoona', 'Nansana',
  'Nateete', 'Ndeeba', 'Nsambya', 'Ntinda', 'Old Kampala', 'Rubaga', 'Salaama', 'Seguku', 'Wakaliga',
  'Wandegeya', 'Zana',
] as const;

const normalise = (s?: string | null) => (s || '').toLowerCase().replace(/[^a-z]/g, '');
const AREA_KEYS = new Set<string>([...KAMPALA_AREAS.map(normalise), 'kampala', 'kcca', 'cbd', 'town']);

export const distanceKm = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const R = 6371;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

export interface ZoneInput {
  town?: string | null;
  village?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface ZoneResult {
  inZone: boolean;
  distanceKm: number | null;
  reason?: string;
}

/**
 * GPS wins when we have it. Without GPS, the area name must be one we deliver to
 * (or say "Kampala").
 */
export function checkDeliveryZone(input: ZoneInput): ZoneResult {
  const lat = Number(input.latitude);
  const lng = Number(input.longitude);
  if (input.latitude != null && input.longitude != null && Number.isFinite(lat) && Number.isFinite(lng)) {
    const d = distanceKm(KAMPALA_CENTRE, { lat, lng });
    const inZone = d <= DELIVERY_RADIUS_KM();
    return {
      inZone,
      distanceKm: Math.round(d * 10) / 10,
      reason: inZone ? undefined : `That location is about ${Math.round(d)} km from Kampala. We only deliver in and around Kampala.`,
    };
  }
  const inZone = AREA_KEYS.has(normalise(input.village)) || AREA_KEYS.has(normalise(input.town));
  return {
    inZone,
    distanceKm: null,
    reason: inZone ? undefined : 'We only deliver in and around Kampala. Choose a Kampala area or share your location.',
  };
}

/** Current hour/minute and date parts in Kampala (UTC+3, no daylight saving). */
const kampalaParts = (now: Date) => {
  const k = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  return { y: k.getUTCFullYear(), m: k.getUTCMonth(), d: k.getUTCDate(), hour: k.getUTCHours() };
};

/** A Kampala wall-clock time as a real Date */
const kampalaTime = (y: number, m: number, d: number, hour: number) => new Date(Date.UTC(y, m, d, hour - 3, 0, 0));

export interface DeliverySchedule {
  lateNight: boolean;
  /** When the first delivery can go out for an order placed now (null = straight away) */
  scheduledFor: Date | null;
  /** "tomorrow" (23:00–23:59) or "this morning" (00:00 until the morning start) */
  when: 'now' | 'tomorrow' | 'this morning';
  message: string | null;
}

export function deliverySchedule(now = new Date()): DeliverySchedule {
  const { y, m, d, hour } = kampalaParts(now);
  const cutoff = LATE_CUTOFF_HOUR();
  const start = MORNING_START_HOUR();
  const startLabel = `${start > 12 ? start - 12 : start}:00 ${start >= 12 ? 'PM' : 'AM'}`;

  if (hour >= cutoff) {
    return {
      lateNight: true,
      scheduledFor: kampalaTime(y, m, d + 1, start),
      when: 'tomorrow',
      message: `It's past ${cutoff > 12 ? cutoff - 12 : cutoff}pm, so we'll deliver your order tomorrow morning from ${startLabel}.`,
    };
  }
  if (hour < start) {
    return {
      lateNight: true,
      scheduledFor: kampalaTime(y, m, d, start),
      when: 'this morning',
      message: `Our riders start at ${startLabel}. We'll deliver your order this morning from ${startLabel}.`,
    };
  }
  return { lateNight: false, scheduledFor: null, when: 'now', message: null };
}
