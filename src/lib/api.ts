export const API_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL || "https://kioskapi.gandom-perfume.ir";

export const STRAPI_TOKEN = process.env.NEXT_PUBLIC_STRAPI_TOKEN?.trim() || undefined;

const SERVER_STRAPI_TOKEN = process.env.STRAPI_TOKEN?.trim() || undefined;

type PerfumeAttributeKey = "family" | "season" | "character" | "gender";

interface StrapiPagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

interface StrapiCollectionResponse<T = unknown> {
  data: T[];
  meta: {
    pagination: StrapiPagination;
  };
}

interface StrapiNotes {
  top?: string[] | null;
  middle?: string[] | null;
  base?: string[] | null;
}

interface StrapiPerfumeAttributes {
  name_en?: string | null;
  name_fa?: string | null;
  gender?: string | null;
  season?: string | null;
  family?: string | null;
  character?: string | null;
  notes?: unknown;
  brand?: unknown;
  collection?: unknown;
  cover?: unknown;
}

export interface PerfumeNotes {
  top: string[];
  middle: string[];
  base: string[];
}

export interface Perfume {
  id: number;
  nameEn: string;
  nameFa: string;
  brand?: string;
  collection?: string;
  gender?: string;
  season?: string;
  family?: string;
  character?: string;
  notes: PerfumeNotes;
  allNotes: string[];
  image?: string;
}

const unwrapStrapiValue = <T>(value: unknown): T | undefined => {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value as unknown as T;
  }

  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;

    if ("data" in obj) {
      return unwrapStrapiValue<T>(obj.data);
    }

    if ("attributes" in obj && obj.attributes) {
      return unwrapStrapiValue<T>(obj.attributes);
    }
  }

  return value as T;
};

const extractNameField = (value: unknown): string | undefined => {
  const resolved = unwrapStrapiValue<Record<string, unknown>>(value);
  if (!resolved) {
    return undefined;
  }

  const name = resolved.name;
  return typeof name === "string" && name.trim().length > 0
    ? name.trim()
    : undefined;
};

const extractImageUrl = (value: unknown): string | undefined => {
  const resolved = unwrapStrapiValue<Record<string, unknown>>(value);
  if (!resolved) {
    return undefined;
  }

  const url = resolved.url;
  if (typeof url === "string" && url.trim().length > 0) {
    let trimmedUrl = url.trim();

    // If it's a relative URL, make it absolute
    if (trimmedUrl.startsWith("/")) {
      trimmedUrl = `${API_URL}${trimmedUrl}`;
    }

    // Fix api.localhost hostname resolution issue
    if (trimmedUrl.includes("api.localhost")) {
      trimmedUrl = trimmedUrl.replace("api.localhost", "localhost");
    }

    return trimmedUrl;
  }

  return undefined;
};

const normaliseNotes = (value: unknown): PerfumeNotes => {
  const resolved = unwrapStrapiValue<StrapiNotes>(value) ?? {};
  const { top, middle, base } = resolved;

  return {
    top: Array.isArray(top) ? [...top] : [],
    middle: Array.isArray(middle) ? [...middle] : [],
    base: Array.isArray(base) ? [...base] : [],
  };
};

const dedupeNotes = (notes: PerfumeNotes): string[] => {
  const unique = new Set<string>([
    ...notes.top,
    ...notes.middle,
    ...notes.base,
  ]);
  return Array.from(unique).sort((a, b) => a.localeCompare(b, "en"));
};

const asPerfumeAttributes = (item: unknown): StrapiPerfumeAttributes => {
  if (!item || typeof item !== "object") {
    return {};
  }

  const entity = item as Record<string, unknown>;
  const attributes =
    unwrapStrapiValue<Record<string, unknown>>(entity.attributes) ?? entity;

  return attributes as unknown as StrapiPerfumeAttributes;
};

const extractId = (item: unknown): number => {
  if (!item || typeof item !== "object") {
    return 0;
  }

  const raw = item as Record<string, unknown>;
  const id = raw.id;
  return typeof id === "number" ? id : 0;
};

const buildPerfumeListPath = (page = 1) => {
  const params = new URLSearchParams();
  params.set("populate[brand][fields][0]", "name");
  params.set("populate[collection][fields][0]", "name");
  params.set("populate[notes]", "*");
  params.set("populate[cover][fields][0]", "url");
  params.set("populate[cover][fields][1]", "alternativeText");
  params.set("pagination[page]", page.toString());
  params.set("pagination[pageSize]", "100");
  return `/api/perfumes?${params.toString()}`;
};

async function fetchJson<T>(endpoint: string): Promise<T> {
  const isServer = typeof window === "undefined";
  const baseUrl = isServer ? API_URL : "/api/strapi";
  const url = `${baseUrl}${endpoint}`;
  const headers = new Headers();

  if (isServer) {
    const token = SERVER_STRAPI_TOKEN || STRAPI_TOKEN;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  console.log("[API] Fetching:", url);
  console.log("[API] Using server token:", isServer && !!(SERVER_STRAPI_TOKEN || STRAPI_TOKEN));

  try {
    if (isServer) {
      const response = await fetch(url, {
        headers,
        next: { revalidate: 300 }, // Cache for 5 minutes
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      console.log("[API] Response status:", response.status);

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`[API] Strapi request failed (${response.status}):`, errorBody);
        throw new Error(`HTTP ${response.status} for ${url}`);
      }

      const data = (await response.json()) as T;
      console.log("[API] Success, got data");
      return data;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(url, {
        headers,
        signal: controller.signal,
      });

      console.log("[API] Response status:", response.status);

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`[API] Proxy request failed (${response.status}):`, errorBody);
        throw new Error(`HTTP ${response.status} for ${url}`);
      }

      const data = (await response.json()) as T;
      console.log("[API] Success, got data");
      return data;
    } finally {
      window.clearTimeout(timeoutId);
    }
  } catch (error) {
    console.error("[API] Fetch error:", error);
    throw error;
  }
}

const toPerfume = (item: unknown): Perfume | null => {
  const id = extractId(item);
  if (id === 0) {
    return null;
  }

  const attrs = asPerfumeAttributes(item);
  const notes = normaliseNotes(attrs.notes);

  return {
    id,
    nameEn: typeof attrs.name_en === "string" ? attrs.name_en : "",
    nameFa: typeof attrs.name_fa === "string" ? attrs.name_fa : "",
    brand: extractNameField(attrs.brand),
    collection: extractNameField(attrs.collection),
    gender: typeof attrs.gender === "string" ? attrs.gender : undefined,
    season: typeof attrs.season === "string" ? attrs.season : undefined,
    family: typeof attrs.family === "string" ? attrs.family : undefined,
    character:
      typeof attrs.character === "string" ? attrs.character : undefined,
    notes,
    allNotes: dedupeNotes(notes),
    image: extractImageUrl(attrs.cover),
  };
};

const PERFUME_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

let perfumeListCache: Perfume[] | null = null;
let perfumeListCacheTime = 0;
let perfumeListPromise: Promise<Perfume[]> | null = null;

export async function getPerfumes(): Promise<Perfume[]> {
  const now = Date.now();

  if (perfumeListCache && now - perfumeListCacheTime < PERFUME_CACHE_TTL_MS) {
    return perfumeListCache;
  }

  if (perfumeListPromise) {
    return perfumeListPromise;
  }

  perfumeListPromise = (async () => {
    try {
      const collected: Perfume[] = [];
      let page = 1;
      let pageCount = 1;

      do {
        const endpoint = buildPerfumeListPath(page);
        const json = await fetchJson<StrapiCollectionResponse>(endpoint);

        if (Array.isArray(json.data)) {
          json.data.map(toPerfume).forEach((perfume) => {
            if (perfume) {
              collected.push(perfume);
            }
          });
        }

        pageCount = json.meta?.pagination?.pageCount ?? 1;
        page += 1;
      } while (page <= pageCount);

      perfumeListCache = collected;
      perfumeListCacheTime = Date.now();
      return collected;
    } catch (error) {
      perfumeListCache = null;
      perfumeListCacheTime = 0;
      console.error("Error fetching perfumes:", error);
      throw error instanceof Error
        ? error
        : new Error("Unknown error fetching perfumes");
    } finally {
      perfumeListPromise = null;
    }
  })();

  return perfumeListPromise;
}

const buildFieldQuery = (field: PerfumeAttributeKey, page: number) => {
  const params = new URLSearchParams();
  params.set("fields[0]", field);
  params.set("pagination[page]", page.toString());
  params.set("pagination[pageSize]", "100");
  return `/api/perfumes?${params.toString()}`;
};

async function getPerfumeFieldValues(
  field: PerfumeAttributeKey
): Promise<string[]> {
  const values = new Set<string>();
  let page = 1;
  let pageCount = 1;

  try {
    do {
      const endpoint = buildFieldQuery(field, page);
      const json = await fetchJson<StrapiCollectionResponse>(endpoint);

      if (Array.isArray(json.data)) {
        for (const item of json.data) {
          const attrs = asPerfumeAttributes(item);
          const value = attrs[field];
          if (typeof value === "string" && value.trim().length > 0) {
            values.add(value.trim());
          }
        }
      }

      pageCount = json.meta?.pagination?.pageCount ?? 1;
      page += 1;
    } while (page <= pageCount);
  } catch (error) {
    console.error(`Error fetching perfume field "${field}":`, error);
    return [];
  }

  return Array.from(values).sort((a, b) => a.localeCompare(b, "fa"));
}

export async function getScentFamilies(): Promise<string[]> {
  return getPerfumeFieldValues("family");
}

export async function getOccasions(): Promise<string[]> {
  return getPerfumeFieldValues("season");
}

export async function getIntensities(): Promise<string[]> {
  return getPerfumeFieldValues("character");
}

export async function getGenders(): Promise<string[]> {
  return getPerfumeFieldValues("gender");
}

export async function getBrands(): Promise<string[]> {
  const values = new Set<string>();
  let page = 1;
  let pageCount = 1;

  try {
    do {
      const params = new URLSearchParams();
      params.set("populate[brand][fields][0]", "name");
      params.set("pagination[page]", page.toString());
      params.set("pagination[pageSize]", "100");

      const endpoint = `/api/perfumes?${params.toString()}`;
      const json = await fetchJson<StrapiCollectionResponse>(endpoint);

      if (Array.isArray(json.data)) {
        for (const item of json.data) {
          const attrs = asPerfumeAttributes(item);
          const name = extractNameField(attrs.brand);
          if (name) {
            values.add(name);
          }
        }
      }

      pageCount = json.meta?.pagination?.pageCount ?? 1;
      page += 1;
    } while (page <= pageCount);
  } catch (error) {
    console.error("Error fetching brand names:", error);
    return [];
  }

  return Array.from(values).sort((a, b) => a.localeCompare(b, "fa"));
}

export async function getNoteOptions(): Promise<string[]> {
  const values = new Set<string>();
  let page = 1;
  let pageCount = 1;

  try {
    do {
      const params = new URLSearchParams();
      params.set("fields[0]", "id");
      params.set("populate[notes]", "*");
      params.set("pagination[page]", page.toString());
      params.set("pagination[pageSize]", "100");

      const endpoint = `/api/perfumes?${params.toString()}`;
      const json = await fetchJson<StrapiCollectionResponse>(endpoint);

      if (Array.isArray(json.data)) {
        for (const item of json.data) {
          const attrs = asPerfumeAttributes(item);
          const notes = normaliseNotes(attrs.notes);
          notes.top.concat(notes.middle, notes.base).forEach((note) => {
            if (typeof note === "string" && note.trim().length > 0) {
              values.add(note.trim());
            }
          });
        }
      }

      pageCount = json.meta?.pagination?.pageCount ?? 1;
      page += 1;
    } while (page <= pageCount);
  } catch (error) {
    console.error("Error fetching note options:", error);
    return [];
  }

  return Array.from(values).sort((a, b) => a.localeCompare(b, "fa"));
}

export const toPersianNumbers = (value: string): string => {
  const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
  return value.replace(/[0-9]/g, (digit) => persianDigits[parseInt(digit, 10)]);
};
