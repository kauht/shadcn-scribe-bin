
import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = 'https://dhsyekkzecczlossimob.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoc3lla2t6ZWNjemxvc3NpbW9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzMDY0NjUsImV4cCI6MjA2MDg4MjQ2NX0.ZtjnyZW6dPUZSRROtVP2cm1SPuQnzg64mj_MB0ZIVn4'

export const supabase = createClient<Database>(supabaseUrl, supabaseKey)
