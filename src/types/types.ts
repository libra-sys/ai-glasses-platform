export type UserRole = 'user' | 'admin';
export type ComponentStatus = 'pending' | 'approved' | 'rejected';

export interface Profile {
  id: string;
  username: string;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  bio: string | null;
  created_at: string;
}

export interface Component {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  version: string | null;
  author_id: string;
  file_url: string | null;
  image_url: string | null;
  download_count: number;
  status: ComponentStatus;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  component_id: string;
  user_id: string;
  content: string;
  rating: number | null;
  created_at: string;
}

export interface Favorite {
  id: string;
  component_id: string;
  user_id: string;
  created_at: string;
}

export interface ComponentWithAuthor extends Component {
  author?: Profile;
}

export interface CommentWithUser extends Comment {
  user?: Profile;
}

export interface ComponentStats {
  total_downloads: number;
  average_rating: number;
  comment_count: number;
  favorite_count: number;
}

export type AnnouncementPriority = 'high' | 'normal' | 'low';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: AnnouncementPriority;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AnnouncementWithAuthor extends Announcement {
  author?: Profile;
}
