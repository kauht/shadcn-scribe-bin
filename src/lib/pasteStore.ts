import { Paste, User } from "./types";
import { supabase } from './supabase';

// User functions using Supabase Auth
export async function createUser(email: string, password: string, name: string): Promise<User | null> {
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name }
    }
  });
  
  if (signUpError) throw signUpError;
  return authData.user ? {
    id: authData.user.id,
    email: authData.user.email!,
    name: authData.user.user_metadata.name,
    createdAt: new Date(authData.user.created_at)
  } : null;
}

export async function login(email: string, password: string): Promise<User | null> {
  const { data: { session }, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) throw error;
  return session?.user ? {
    id: session.user.id,
    email: session.user.email!,
    name: session.user.user_metadata.name,
    createdAt: new Date(session.user.created_at)
  } : null;
}

export async function logout(): Promise<void> {
  await supabase.auth.signOut();
}

export async function getCurrentUser(): Promise<User | null> {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session?.user) return null;
  
  return {
    id: session.user.id,
    email: session.user.email!,
    name: session.user.user_metadata.name,
    createdAt: new Date(session.user.created_at)
  };
}

// Paste functions
export async function createPaste(pasteData: Omit<Paste, 'id' | 'createdAt' | 'viewCount'>): Promise<Paste | null> {
  const { data, error } = await supabase
    .from('pastes')
    .insert([{
      title: pasteData.title,
      content: pasteData.content,
      language: pasteData.language,
      expire_at: pasteData.expireAt?.toISOString(),
      user_id: pasteData.userId,
      is_private: pasteData.isPrivate,
      is_password_protected: pasteData.isPasswordProtected,
      password: pasteData.password,
      burn_after_read: pasteData.burnAfterRead,
      view_count: 0
    }])
    .select()
    .single();

  if (error) {
    console.error('Failed to create paste:', error);
    throw error;
  }

  return {
    id: data.id,
    title: data.title,
    content: data.content,
    language: data.language,
    createdAt: new Date(data.created_at),
    expireAt: data.expire_at ? new Date(data.expire_at) : null,
    userId: data.user_id,
    isPrivate: data.is_private,
    isPasswordProtected: data.is_password_protected,
    burnAfterRead: data.burn_after_read,
    viewCount: data.view_count
  };
}

export async function getPasteById(id: string): Promise<Paste | null> {
  const { data, error } = await supabase
    .from('pastes')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Paste not found
    }
    throw error;
  }

  if (!data) return null;

  if (data.expire_at && new Date(data.expire_at) < new Date()) {
    await deletePaste(id);
    return null;
  }

  return {
    id: data.id,
    title: data.title,
    content: data.content,
    language: data.language,
    createdAt: new Date(data.created_at),
    expireAt: data.expire_at ? new Date(data.expire_at) : null,
    userId: data.user_id,
    isPrivate: data.is_private,
    isPasswordProtected: data.is_password_protected,
    burnAfterRead: data.burn_after_read,
    viewCount: data.view_count
  };
}

export async function deletePaste(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('pastes')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Failed to delete paste:', error);
    return false;
  }

  return true;
}

export async function incrementViewCount(id: string): Promise<void> {
  const { error } = await supabase
    .rpc('increment_view_count', { paste_id: id });

  if (error) {
    console.error('Failed to increment view count:', error);
  }
}

export async function checkPassword(pasteId: string, password: string): Promise<boolean> {
  const { data, error } = await supabase
    .rpc('check_paste_password', {
      paste_id: pasteId,
      password_attempt: password,
    });

  if (error) {
    console.error('Failed to check password:', error);
    return false;
  }

  return data;
}

export async function getUserPastes(userId: string): Promise<Paste[]> {
  const { data, error } = await supabase
    .from('pastes')
    .select('*')
    .eq('userId', userId)
    .order('createdAt', { ascending: false });

  if (error) {
    console.error('Failed to fetch user pastes:', error);
    return [];
  }
  return data as Paste[];
}

// Helper function to transform database response to Paste type
function transformPasteFromDB(data: any): Paste {
  return {
    id: data.id,
    title: data.title,
    content: data.content,
    language: data.language,
    createdAt: new Date(data.created_at),
    expireAt: data.expire_at ? new Date(data.expire_at) : null,
    userId: data.user_id,
    isPrivate: data.is_private,
    isPasswordProtected: data.is_password_protected,
    burnAfterRead: data.burn_after_read,
    viewCount: data.view_count
  };
}
