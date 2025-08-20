export interface User {
  id: string;
  email: string;
  name?: string | null;
  role: 'ADMIN' | 'ORGANIZER' | 'VIEWER';
  createdAt: Date;
  updatedAt: Date;
}

export interface Event {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  ticketUrl?: string | null;
  locationName?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  startAt: Date;
  endAt?: Date | null;
  timezone: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  heroImageId?: string | null;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  heroImage?: Image | null;
  images?: Image[];
  owner?: User;
}

export interface Image {
  id: string;
  eventId?: string | null;
  uploaderId: string;
  originalKey: string;
  format: string;
  width: number;
  height: number;
  variants: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  event?: Event | null;
  uploader?: User;
}

export interface ImageVariant {
  width: number;
  height: number;
  webpKey: string;
  jpgKey: string;
  webpUrl: string;
  jpgUrl: string;
}

export interface Session {
  user?: {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  expires: string;
  role?: string;
  userId?: string;
}
