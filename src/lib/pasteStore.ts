import { Paste, User } from "./types";

// Storage keys
const STORAGE_KEYS = {
  USERS: "paste_app_users",
  PASTES: "paste_app_pastes",
  CURRENT_USER: "paste_app_current_user"
};

// Simple ID generation
function generateSimpleId(length = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Database class to handle all storage operations
class PasteDB {
  private users: User[] = [];
  private pastes: Paste[] = [];
  private currentUser: User | null = null;
  
  constructor() {
    this.loadFromStorage();
    this.initDemoDataIfEmpty();
  }
  
  // Load all data from localStorage
  private loadFromStorage(): void {
    try {
      const usersData = localStorage.getItem(STORAGE_KEYS.USERS);
      const pastesData = localStorage.getItem(STORAGE_KEYS.PASTES);
      const currentUserData = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      
      this.users = usersData ? JSON.parse(usersData) : [];
      this.pastes = pastesData ? JSON.parse(pastesData) : [];
      this.currentUser = currentUserData ? JSON.parse(currentUserData) : null;
      
      // Convert string dates back to Date objects
      this.pastes = this.pastes.map(paste => ({
        ...paste,
        createdAt: new Date(paste.createdAt),
        expireAt: paste.expireAt ? new Date(paste.expireAt) : null
      }));
    } catch (error) {
      console.error('Error loading data from storage:', error);
      this.users = [];
      this.pastes = [];
      this.currentUser = null;
    }
  }
  
  // Save all data to localStorage
  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
      localStorage.setItem(STORAGE_KEYS.PASTES, JSON.stringify(this.pastes));
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, 
        this.currentUser ? JSON.stringify(this.currentUser) : 'null');
    } catch (error) {
      console.error('Error saving data to storage:', error);
    }
  }
  
  // Initialize demo data if no pastes exist
  private initDemoDataIfEmpty(): void {
    if (this.pastes.length === 0) {
      // Create demo user
      const demoUser = this.createUser('demo@example.com', 'password', 'Demo User');
      
      // Create sample pastes
      this.createPaste({
        title: "Hello World in JavaScript",
        content: "console.log('Hello World!');",
        language: "javascript",
        expireAt: null,
        userId: demoUser.id,
        isPrivate: false,
        isPasswordProtected: false,
        burnAfterRead: false,
      });
      
      this.createPaste({
        title: "Python Example",
        content: "def hello():\n    print('Hello, World!')\n\nhello()",
        language: "python",
        expireAt: null,
        userId: demoUser.id,
        isPrivate: false,
        isPasswordProtected: false,
        burnAfterRead: false,
      });
    }
  }
  
  // User operations
  public createUser(email: string, password: string, name: string): User {
    const user: User = {
      id: generateSimpleId(10),
      email,
      name,
      createdAt: new Date()
    };
    
    this.users.push(user);
    this.saveToStorage();
    return user;
  }
  
  public login(email: string, password: string): User | null {
    const user = this.users.find(u => u.email === email);
    if (user) {
      this.currentUser = user;
      this.saveToStorage();
      return user;
    }
    return null;
  }
  
  public logout(): void {
    this.currentUser = null;
    this.saveToStorage();
  }
  
  public getCurrentUser(): User | null {
    return this.currentUser;
  }
  
  // Paste operations
  public createPaste(pasteData: Omit<Paste, 'id' | 'createdAt' | 'viewCount'>): Paste {
    if (!pasteData.content || pasteData.content.trim() === '') {
      throw new Error('Paste content is required');
    }
    
    // Create new paste with default values for missing fields
    const newPaste: Paste = {
      id: generateSimpleId(8),
      title: pasteData.title?.trim() || 'Untitled',
      content: pasteData.content,
      language: pasteData.language || 'plaintext',
      createdAt: new Date(),
      expireAt: pasteData.expireAt || null,
      userId: pasteData.userId || 'anonymous',
      isPrivate: pasteData.isPrivate || false,
      isPasswordProtected: pasteData.isPasswordProtected || false,
      password: pasteData.password || undefined,
      burnAfterRead: pasteData.burnAfterRead || false,
      viewCount: 0
    };
    
    console.log('Created paste:', newPaste);
    
    this.pastes.push(newPaste);
    this.saveToStorage();
    return newPaste;
  }
  
  public getPasteById(id: string): Paste | null {
    // First refresh from storage to ensure we have latest data
    this.loadFromStorage();
    
    const paste = this.pastes.find(p => p.id === id);
    
    if (!paste) {
      return null;
    }
    
    // Check if expired
    if (paste.expireAt && new Date(paste.expireAt) < new Date()) {
      this.deletePaste(id);
      return null;
    }
    
    return paste;
  }
  
  public incrementViewCount(id: string): void {
    const paste = this.pastes.find(p => p.id === id);
    if (paste) {
      paste.viewCount += 1;
      
      // Handle burn after read
      if (paste.burnAfterRead && paste.viewCount > 1) {
        this.deletePaste(id);
      } else {
        this.saveToStorage();
      }
    }
  }
  
  public getUserPastes(userId: string): Paste[] {
    return this.pastes.filter(p => p.userId === userId && !p.burnAfterRead);
  }
  
  public checkPassword(pasteId: string, password: string): boolean {
    const paste = this.pastes.find(p => p.id === pasteId);
    if (!paste || !paste.isPasswordProtected) {
      return false;
    }
    return paste.password === password;
  }
  
  public deletePaste(id: string): boolean {
    const initialLength = this.pastes.length;
    this.pastes = this.pastes.filter(p => p.id !== id);
    this.saveToStorage();
    return this.pastes.length !== initialLength;
  }
}

// Create a singleton instance
const db = new PasteDB();

// Export functions that use the database instance
export const createUser = (email: string, password: string, name: string) => 
  db.createUser(email, password, name);

export const login = (email: string, password: string) => 
  db.login(email, password);

export const logout = () => 
  db.logout();

export const getCurrentUser = () => 
  db.getCurrentUser();

export const createPaste = (pasteData: Omit<Paste, 'id' | 'createdAt' | 'viewCount'>) => 
  db.createPaste(pasteData);

export const getPasteById = (id: string) => 
  db.getPasteById(id);

export const incrementViewCount = (id: string) => 
  db.incrementViewCount(id);

export const getUserPastes = (userId: string) => 
  db.getUserPastes(userId);

export const checkPassword = (pasteId: string, password: string) => 
  db.checkPassword(pasteId, password);

export const deletePaste = (id: string) => 
  db.deletePaste(id);
