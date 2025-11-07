import axios from "axios";

import { API_URL } from "./api";

const adminClient = axios.create({
  baseURL: "/api/strapi",
});

// Add request interceptor for logging
adminClient.interceptors.request.use((config) => {
  console.log("[Admin API] Request:", config.method?.toUpperCase(), config.url);
  console.log("[Admin API] Base URL:", config.baseURL);
  console.log("[Admin API] Params:", config.params);
  return config;
});

// Add response interceptor for logging
adminClient.interceptors.response.use(
  (response) => {
    console.log("[Admin API] Success:", response.config.url, "- Status:", response.status);
    console.log("[Admin API] Data count:", Array.isArray(response.data?.data) ? response.data.data.length : "N/A");
    return response;
  },
  (error) => {
    console.error("[Admin API] Error:", error.config?.url);
    console.error("[Admin API] Error details:", error.response?.status, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

const authHeaders = (includeContentType = false) => {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (includeContentType) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
};

interface StrapiEntity<T> {
  id: number;
  attributes?: T | null;
}

interface StrapiPaginationMeta {
  page?: number;
  pageSize?: number;
  pageCount?: number;
  total?: number;
}

interface StrapiListResponse<T> {
  data: Array<StrapiEntity<T>>;
  meta?: {
    pagination?: StrapiPaginationMeta;
  };
}

interface StrapiSingleResponse<T> {
  data: StrapiEntity<T>;
}

interface StrapiRelation<T> {
  data?: StrapiEntity<T> | null;
}

type MaybeRelation<T> = StrapiRelation<T> | StrapiEntity<T> | null;

const unwrapRelation = <T>(
  relation: MaybeRelation<T> | undefined,
): StrapiEntity<T> | null => {
  if (!relation || typeof relation !== "object") {
    return null;
  }

  if ("data" in relation) {
    const relationData = relation.data;
    return relationData ? (relationData as StrapiEntity<T>) : null;
  }

  if ("id" in relation) {
    return relation as StrapiEntity<T>;
  }

  return null;
};

interface BrandAttributes {
  name?: string | null;
}

export interface AdminBrand {
  id: number;
  documentId?: string;
  name: string;
}

const mapBrand = (entity: StrapiEntity<BrandAttributes>): AdminBrand => {
  // In Strapi v5, attributes are at root level
  const attributes = entity.attributes ?? (entity as unknown as Record<string, unknown>);
  const rawEntity = entity as unknown as Record<string, unknown>;

  return {
    id: entity.id,
    documentId: (rawEntity.documentId as string | undefined),
    name: (attributes.name as string | null | undefined)?.trim() ?? "",
  };
};

interface CollectionAttributes {
  name?: string | null;
  brand?: MaybeRelation<BrandAttributes>;
}

export interface AdminCollection {
  id: number;
  documentId?: string;
  name: string;
  brand?: AdminBrand | null;
}

const mapCollection = (
  entity: StrapiEntity<CollectionAttributes>,
): AdminCollection => {
  // In Strapi v5, attributes are at root level
  const attributes = (entity.attributes ?? (entity as unknown)) as
    CollectionAttributes & Record<string, unknown>;
  const rawEntity = entity as unknown as Record<string, unknown>;
  const brandEntity = unwrapRelation<BrandAttributes>(attributes.brand);

  return {
    id: entity.id,
    documentId: (rawEntity.documentId as string | undefined),
    name: (attributes.name as string | null | undefined)?.trim() ?? "",
    brand: brandEntity ? mapBrand(brandEntity) : null,
  };
};

interface PerfumeNotesAttributes {
  top?: string[] | null;
  middle?: string[] | null;
  base?: string[] | null;
}

export interface PerfumeNotes {
  top: string[];
  middle: string[];
  base: string[];
}

interface PerfumeAttributes {
  name_fa?: string | null;
  name_en?: string | null;
  gender?: string | null;
  season?: string | null;
  family?: string | null;
  character?: string | null;
  notes?: PerfumeNotesAttributes | null;
  brand?: MaybeRelation<BrandAttributes>;
  collection?: MaybeRelation<CollectionAttributes>;
}

export interface AdminPerfume {
  id: number;
  documentId?: string;
  name_fa: string;
  name_en: string;
  gender?: string;
  season?: string;
  family?: string;
  character?: string;
  notes: PerfumeNotes;
  brand?: AdminBrand | null;
  collection?: AdminCollection | null;
  image?: string;
}

const normaliseNotes = (
  notes: PerfumeNotesAttributes | null | undefined,
): PerfumeNotes => {
  const toArray = (value?: string[] | null) =>
    Array.isArray(value) ? [...value] : [];

  return {
    top: toArray(notes?.top),
    middle: toArray(notes?.middle),
    base: toArray(notes?.base),
  };
};

const extractImageUrl = (cover: unknown): string | undefined => {
  if (!cover) return undefined;

  // Handle different possible structures for cover data
  const coverData = (cover as { data?: unknown }).data || cover;
  if (coverData && typeof coverData === 'object' && 'url' in coverData) {
    let url = coverData.url as string;
    // Make relative URLs absolute
    if (url.startsWith('/')) {
      url = `${API_URL}${url}`;
    }
    return url;
  }

  return undefined;
};

const mapPerfume = (entity: StrapiEntity<PerfumeAttributes>): AdminPerfume => {
  // In Strapi v5, attributes are at root level
  const attributes = entity.attributes ?? (entity as unknown as Record<string, unknown>);
  const attrs = attributes as PerfumeAttributes;
  const rawEntity = entity as unknown as Record<string, unknown>;
  const brandEntity = unwrapRelation<BrandAttributes>(attrs.brand);
  const collectionEntity = unwrapRelation<CollectionAttributes>(attrs.collection);

  return {
    id: entity.id,
    documentId: (rawEntity.documentId as string | undefined),
    name_fa: attrs.name_fa?.trim() ?? "",
    name_en: attrs.name_en?.trim() ?? "",
    gender: attrs.gender?.trim() || undefined,
    season: attrs.season?.trim() || undefined,
    family: attrs.family?.trim() || undefined,
    character: attrs.character?.trim() || undefined,
    notes: normaliseNotes(attrs.notes),
    brand: brandEntity ? mapBrand(brandEntity) : null,
    collection: collectionEntity ? mapCollection(collectionEntity) : null,
    image: extractImageUrl((attrs as unknown as Record<string, unknown>).cover),
  };
};

export interface CreateBrandPayload {
  name: string;
}

export interface CreateCollectionPayload {
  name: string;
  brand?: number;
  brandId?: number;
}

export interface CreatePerfumePayload {
  name_fa: string;
  name_en: string;
  gender?: string;
  season?: string;
  family?: string;
  character?: string;
  notes: PerfumeNotes;
  brand?: number;
  collection?: number;
  cover?: number;
}

const fetchPaginatedEntities = async <T, R>(
  path: string,
  mapEntity: (entity: StrapiEntity<T>) => R,
  baseParams: Record<string, unknown>,
): Promise<R[]> => {
  const collected: R[] = [];
  let page = 1;
  let pageCount = 1;

  do {
    const response = await adminClient.get<StrapiListResponse<T>>(path, {
      headers: authHeaders(),
      params: {
        ...baseParams,
        "pagination[page]": page,
      },
    });

    if (Array.isArray(response.data.data)) {
      collected.push(...response.data.data.map(mapEntity));
    }

    pageCount = response.data.meta?.pagination?.pageCount ?? 1;
    page += 1;
  } while (page <= pageCount);

  return collected;
};

export const fetchBrandsAdmin = async (): Promise<AdminBrand[]> => {
  return fetchPaginatedEntities<BrandAttributes, AdminBrand>(
    "/api/brands",
    mapBrand,
    {
      "pagination[pageSize]": 100,
      sort: "name:asc",
      publicationState: "preview",
    },
  );
};

export const fetchCollectionsAdmin = async (): Promise<AdminCollection[]> => {
  return fetchPaginatedEntities<CollectionAttributes, AdminCollection>(
    "/api/collections",
    mapCollection,
    {
      "pagination[pageSize]": 100,
      sort: "name:asc",
      "populate[brand][fields][0]": "name",
      "populate[brand][fields][1]": "documentId",
      publicationState: "preview",
    },
  );
};

export const fetchPerfumesAdmin = async (): Promise<AdminPerfume[]> => {
  return fetchPaginatedEntities<PerfumeAttributes, AdminPerfume>(
    "/api/perfumes",
    mapPerfume,
    {
      "pagination[pageSize]": 100,
      "populate[brand][fields][0]": "name",
      "populate[collection][fields][0]": "name",
      "populate[notes]": "*",
      "populate[cover][fields][0]": "url",
      "populate[cover][fields][1]": "alternativeText",
      sort: "updatedAt:desc",
      publicationState: "preview",
    },
  );
};

export const createBrand = async (
  payload: CreateBrandPayload,
): Promise<AdminBrand> => {
  const response = await adminClient.post<StrapiSingleResponse<BrandAttributes>>(
    "/api/brands",
    { data: payload },
    { headers: authHeaders(true) },
  );

  return mapBrand(response.data.data);
};

export const updateBrand = async (
  documentId: string,
  payload: CreateBrandPayload,
): Promise<AdminBrand> => {
  const response = await adminClient.put<StrapiSingleResponse<BrandAttributes>>(
    `/api/brands/${documentId}`,
    { data: payload },
    { headers: authHeaders(true) },
  );

  return mapBrand(response.data.data);
};

export const deleteBrand = async (documentId: string): Promise<void> => {
  await adminClient.delete(`/api/brands/${documentId}`, {
    headers: authHeaders(),
  });
};

export const createCollection = async (
  payload: CreateCollectionPayload,
): Promise<AdminCollection> => {
  const { brandId, brand, ...rest } = payload;
  const relationId = brandId ?? brand;

  const data = {
    ...rest,
    ...(relationId ? { brand: relationId } : {}),
  };

  const response = await adminClient.post<
    StrapiSingleResponse<CollectionAttributes>
  >("/api/collections", { data }, {
    headers: authHeaders(true),
  });

  return mapCollection(response.data.data);
};

export const uploadFile = async (file: File): Promise<{ id: number; url: string }> => {
  const formData = new FormData();
  formData.append('files', file);

  const response = await adminClient.post("/api/upload", formData, {
    headers: {
      ...authHeaders(),
      // Don't set Content-Type for FormData - let the browser set it
    },
  });

  if (response.data && response.data[0]) {
    return {
      id: response.data[0].id,
      url: response.data[0].url,
    };
  }

  throw new Error('File upload failed');
};

export const createPerfume = async (
  payload: CreatePerfumePayload,
): Promise<AdminPerfume> => {
  const response = await adminClient.post<
    StrapiSingleResponse<PerfumeAttributes>
  >("/api/perfumes", { data: payload }, {
    headers: authHeaders(true),
    params: {
      "populate[brand][fields][0]": "name",
      "populate[collection][fields][0]": "name",
      "populate[cover][fields][0]": "url",
    },
  });

  return mapPerfume(response.data.data);
};

export type UpdatePerfumePayload = CreatePerfumePayload;

export const updatePerfume = async (
  documentId: string,
  payload: UpdatePerfumePayload,
): Promise<AdminPerfume> => {
  const response = await adminClient.put<
    StrapiSingleResponse<PerfumeAttributes>
  >(`/api/perfumes/${documentId}`, { data: payload }, {
    headers: authHeaders(true),
    params: {
      "populate[brand][fields][0]": "name",
      "populate[collection][fields][0]": "name",
      "populate[cover][fields][0]": "url",
    },
  });

  return mapPerfume(response.data.data);
};

export const deletePerfume = async (documentId: string): Promise<void> => {
  await adminClient.delete(`/api/perfumes/${documentId}`, {
    headers: authHeaders(),
  });
};
