
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      pastes: {
        Row: {
          id: string
          title: string
          content: string
          language: string
          created_at: string
          expire_at: string | null
          user_id: string | null
          is_private: boolean
          is_password_protected: boolean
          password: string | null
          burn_after_read: boolean
          view_count: number
        }
        Insert: {
          id?: string
          title: string
          content: string
          language: string
          created_at?: string
          expire_at?: string | null
          user_id?: string | null
          is_private?: boolean
          is_password_protected?: boolean
          password?: string | null
          burn_after_read?: boolean
          view_count?: number
        }
        Update: {
          id?: string
          title?: string
          content?: string
          language?: string
          created_at?: string
          expire_at?: string | null
          user_id?: string | null
          is_private?: boolean
          is_password_protected?: boolean
          password?: string | null
          burn_after_read?: boolean
          view_count?: number
        }
      }
    }
  }
}
