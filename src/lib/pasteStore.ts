import { Paste, User } from "./types";
import { supabase } from './supabase';

// User functions using Supabase Auth
export async function createUser(email: string, password: string, name: string): Promise<User | null> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } }
  });
  if (error) throw error;
  return data.user ? { id: data.user.id, email: data.user.email!, name, createdAt: new Date() } : null;
}

export async function login(email: string, password: string): Promise<User | null> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  const user = data.user;
  return user ? { id: user.id, email: user.email!, name: user.user_metadata.name, createdAt: new Date(user.created_at) } : null;
}

export async function logout(): Promise<void> {
  await supabase.auth.signOut();
}

export async function getCurrentUser(): Promise<User | null> {
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  return user ? { id: user.id, email: user.email!, name: user.user_metadata.name, createdAt: new Date(user.created_at) } : null;
}

// Paste functions
export async function createPaste(pasteData: Omit<Paste, 'id' | 'createdAt' | 'viewCount'>): Promise<Paste | null> {
  const { data, error } = await supabase
    .from('pastes')
    .insert({
      ...pasteData,
      created_at: new Date().toISOString(),
      view_count: 0,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create paste:', error);
    return null;
  }

  return data;
}

export async function getPasteById(id: string): Promise<Paste | null> {
  const { data, error } = await supabase
    .from('pastes')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Failed to fetch paste:', error);
    return null;
  }

  // Check if paste has expired
  if (data.expire_at && new Date(data.expire_at) < new Date()) {
    await deletePaste(id);
    return null;
  }

  return data;
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
