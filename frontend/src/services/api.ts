import type { CelebrationItem } from "@/components/CelebrationItems";

const API_BASE = "/api";

// Re-export CelebrationItem for consistency across the app
export type { CelebrationItem } from "@/components/CelebrationItems";

export interface CreateWishPayload {
  title?: string;
  message: string;
  theme: string;
  expires_at?: string;
  max_views?: number;
  celebration_items?: CelebrationItem[];
}

export interface WishResponse {
  slug: string;
  public_url: string;
}

export interface Wish {
  slug: string;
  title?: string;
  message: string;
  theme: string;
  images: string[];
  remaining_views?: number;
  created_at: string;
  celebration_items?: CelebrationItem[];
}

export interface UploadImageResponse {
  url: string;
  filename: string;
}

export async function createWish(payload: CreateWishPayload): Promise<WishResponse> {
  const response = await fetch(`${API_BASE}/wishes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  
  if (!response.ok) {
    throw new Error("Failed to create wish");
  }
  
  return response.json();
}

export async function uploadImage(slug: string, file: File): Promise<UploadImageResponse> {
  const form = new FormData();
  form.append("file", file);

  const response = await fetch(`${API_BASE}/wishes/${slug}/images`, {
    method: "POST",
    body: form,
  });
  
  if (!response.ok) {
    throw new Error("Failed to upload image");
  }
  
  return response.json();
}

export async function getWish(slug: string): Promise<{ status: number; data?: Wish }> {
  const response = await fetch(`${API_BASE}/wishes/${slug}`);
  
  if (response.status === 404) {
    return { status: 404 };
  }
  
  if (response.status === 410) {
    return { status: 410 };
  }
  
  if (!response.ok) {
    throw new Error("Failed to fetch wish");
  }
  
  const data = await response.json();
  return { status: 200, data };
}
