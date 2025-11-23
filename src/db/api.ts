import { supabase } from './supabase';
import type { Profile, Component, Comment, Favorite, ComponentWithAuthor, CommentWithUser, Announcement, AnnouncementWithAuthor } from '@/types/types';

export const profilesApi = {
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async getProfileByUsername(username: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .maybeSingle();
    
    if (error) throw error;
    if (!data) throw new Error('更新失败');
    return data;
  },

  async getAllProfiles(): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  }
};

export const componentsApi = {
  async getComponents(filters?: {
    status?: string;
    category?: string;
    authorId?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }): Promise<ComponentWithAuthor[]> {
    let query = supabase
      .from('components')
      .select(`
        *,
        author:profiles(*)
      `);

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.category && filters.category !== 'all') {
      query = query.eq('category', filters.category);
    }
    if (filters?.authorId) {
      query = query.eq('author_id', filters.authorId);
    }
    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 12;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    query = query
      .order('created_at', { ascending: false })
      .range(from, to);

    const { data, error } = await query;
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getComponent(id: string): Promise<ComponentWithAuthor | null> {
    const { data, error } = await supabase
      .from('components')
      .select(`
        *,
        author:profiles(*)
      `)
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async createComponent(component: Omit<Component, 'id' | 'created_at' | 'updated_at' | 'download_count'>): Promise<Component> {
    const { data, error } = await supabase
      .from('components')
      .insert(component)
      .select()
      .maybeSingle();
    
    if (error) throw error;
    if (!data) throw new Error('创建失败');
    return data;
  },

  async updateComponent(id: string, updates: Partial<Component>): Promise<Component> {
    const { data, error } = await supabase
      .from('components')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();
    
    if (error) throw error;
    if (!data) throw new Error('更新失败');
    return data;
  },

  async deleteComponent(id: string): Promise<void> {
    const { error } = await supabase
      .from('components')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async incrementDownloadCount(componentId: string): Promise<void> {
    const { error } = await supabase.rpc('increment_download_count', {
      component_id: componentId
    });
    
    if (error) throw error;
  },

  async getCategories(): Promise<string[]> {
    const { data, error } = await supabase
      .from('components')
      .select('category')
      .not('category', 'is', null);
    
    if (error) throw error;
    
    const categories = Array.isArray(data) 
      ? [...new Set(data.map(item => item.category).filter(Boolean))]
      : [];
    
    return categories;
  }
};

export const commentsApi = {
  async getComments(componentId: string): Promise<CommentWithUser[]> {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        user:profiles(*)
      `)
      .eq('component_id', componentId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async createComment(comment: Omit<Comment, 'id' | 'created_at'>): Promise<Comment> {
    const { data, error } = await supabase
      .from('comments')
      .insert(comment)
      .select()
      .maybeSingle();
    
    if (error) throw error;
    if (!data) throw new Error('创建失败');
    return data;
  },

  async updateComment(id: string, updates: Partial<Comment>): Promise<Comment> {
    const { data, error } = await supabase
      .from('comments')
      .select()
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    if (!data) throw new Error('评论不存在');
    
    const { data: updated, error: updateError } = await supabase
      .from('comments')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();
    
    if (updateError) throw updateError;
    if (!updated) throw new Error('更新失败');
    return updated;
  },

  async deleteComment(id: string): Promise<void> {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async getAverageRating(componentId: string): Promise<number> {
    const { data, error } = await supabase
      .from('comments')
      .select('rating')
      .eq('component_id', componentId)
      .not('rating', 'is', null);
    
    if (error) throw error;
    
    if (!Array.isArray(data) || data.length === 0) return 0;
    
    const sum = data.reduce((acc, item) => acc + (item.rating || 0), 0);
    return sum / data.length;
  }
};

export const favoritesApi = {
  async getFavorites(userId: string): Promise<ComponentWithAuthor[]> {
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        component_id,
        components (
          *,
          author:profiles(*)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    if (!Array.isArray(data)) return [];
    
    const components = data
      .map((item: any) => item.components)
      .filter((comp): comp is ComponentWithAuthor => comp !== null);
    
    return components;
  },

  async isFavorite(userId: string, componentId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('component_id', componentId)
      .maybeSingle();
    
    if (error) throw error;
    return !!data;
  },

  async addFavorite(userId: string, componentId: string): Promise<Favorite> {
    const { data, error } = await supabase
      .from('favorites')
      .insert({ user_id: userId, component_id: componentId })
      .select()
      .maybeSingle();
    
    if (error) throw error;
    if (!data) throw new Error('收藏失败');
    return data;
  },

  async removeFavorite(userId: string, componentId: string): Promise<void> {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('component_id', componentId);
    
    if (error) throw error;
  },

  async getFavoriteCount(componentId: string): Promise<number> {
    const { data, error } = await supabase
      .from('favorites')
      .select('id', { count: 'exact', head: true })
      .eq('component_id', componentId);
    
    if (error) throw error;
    return data ? (data as any).count || 0 : 0;
  }
};

export const announcementsApi = {
  async getAnnouncements(activeOnly: boolean = true): Promise<AnnouncementWithAuthor[]> {
    let query = supabase
      .from('announcements')
      .select(`
        *,
        author:profiles(*)
      `)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });
    
    if (activeOnly) {
      query = query.eq('is_active', true);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getAnnouncement(id: string): Promise<AnnouncementWithAuthor | null> {
    const { data, error } = await supabase
      .from('announcements')
      .select(`
        *,
        author:profiles(*)
      `)
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async createAnnouncement(announcement: Omit<Announcement, 'id' | 'created_at' | 'updated_at'>): Promise<Announcement> {
    const { data, error } = await supabase
      .from('announcements')
      .insert(announcement)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateAnnouncement(id: string, updates: Partial<Announcement>): Promise<void> {
    const { error } = await supabase
      .from('announcements')
      .update(updates)
      .eq('id', id);
    
    if (error) throw error;
  },

  async deleteAnnouncement(id: string): Promise<void> {
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

export const storageApi = {
  async uploadComponentFile(userId: string, file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('app-7pdiv8w9evi9_component_files')
      .upload(fileName, file);
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('app-7pdiv8w9evi9_component_files')
      .getPublicUrl(data.path);
    
    return publicUrl;
  },

  async uploadComponentImage(userId: string, file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('app-7pdiv8w9evi9_component_images')
      .upload(fileName, file);
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('app-7pdiv8w9evi9_component_images')
      .getPublicUrl(data.path);
    
    return publicUrl;
  },

  async deleteFile(bucketName: string, filePath: string): Promise<void> {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);
    
    if (error) throw error;
  }
};
