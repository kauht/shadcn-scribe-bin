import { Paste, User } from "./types";

// This simulates server-side delay
const FAKE_DELAY_MS = 300;

// This mimics server API calls but actually uses localStorage
// In a real application, these would be fetch/axios calls to a backend
class PasteAPI {
  private static instance: PasteAPI;
  private baseUrl: string = "https://api.pasteshare.com"; // Example base URL for a real API

  private constructor() {}

  public static getInstance(): PasteAPI {
    if (!PasteAPI.instance) {
      PasteAPI.instance = new PasteAPI();
    }
    return PasteAPI.instance;
  }
  
  // Simulate network delay
  private async delay(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, FAKE_DELAY_MS));
  }

  // Local storage helpers (these would be replaced with real API calls)
  private getItem<T>(key: string): T | null {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error("Error reading from storage:", e);
      return null;
    }
  }

  private setItem(key: string, value: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error("Error writing to storage:", e);
    }
  }

  // API Methods
  async createPaste(pasteData: Omit<Paste, 'id' | 'createdAt' | 'viewCount'>): Promise<Paste> {
    await this.delay(); // Simulate network delay
    
    // Validate the data
    if (!pasteData.content || pasteData.content.trim() === '') {
      throw new Error('Paste content is required');
    }
    
    // Generate a unique ID (would be done by the server in a real implementation)
    const generateId = (length = 8) => {
      const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    // Create the new paste object
    const newPaste: Paste = {
      id: generateId(8),
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
    
    // Save to "database" (localStorage)
    const pastes = this.getItem<Paste[]>('pastes') || [];
    pastes.push(newPaste);
    this.setItem('pastes', pastes);
    
    console.log(`[API] Created paste with ID: ${newPaste.id}`);
    return newPaste;
  }

  async getPasteById(id: string): Promise<Paste | null> {
    await this.delay(); // Simulate network delay
    
    const pastes = this.getItem<Paste[]>('pastes') || [];
    const paste = pastes.find(p => p.id === id);
    
    if (!paste) {
      console.log(`[API] Paste not found: ${id}`);
      return null;
    }
    
    // Convert date strings to Date objects
    const result = {
      ...paste,
      createdAt: new Date(paste.createdAt),
      expireAt: paste.expireAt ? new Date(paste.expireAt) : null
    };
    
    // Check if paste has expired
    if (result.expireAt && result.expireAt < new Date()) {
      await this.deletePaste(id);
      return null;
    }
    
    console.log(`[API] Retrieved paste: ${id}`);
    return result;
  }

  async incrementViewCount(id: string): Promise<void> {
    await this.delay(); // Simulate network delay
    
    const pastes = this.getItem<Paste[]>('pastes') || [];
    const pasteIndex = pastes.findIndex(p => p.id === id);
    
    if (pasteIndex === -1) return;
    
    pastes[pasteIndex].viewCount += 1;
    this.setItem('pastes', pastes);
    
    // Handle burn after read
    if (pastes[pasteIndex].burnAfterRead && pastes[pasteIndex].viewCount > 1) {
      await this.deletePaste(id);
    }
    
    console.log(`[API] Incremented view count for paste: ${id}`);
  }

  async deletePaste(id: string): Promise<boolean> {
    await this.delay(); // Simulate network delay
    
    const pastes = this.getItem<Paste[]>('pastes') || [];
    const newPastes = pastes.filter(p => p.id !== id);
    
    if (pastes.length === newPastes.length) {
      return false;
    }
    
    this.setItem('pastes', newPastes);
    console.log(`[API] Deleted paste: ${id}`);
    return true;
  }

  async checkPassword(id: string, password: string): Promise<boolean> {
    await this.delay(); // Simulate network delay
    
    const paste = await this.getPasteById(id);
    if (!paste || !paste.isPasswordProtected) return false;
    
    const isValid = paste.password === password;
    console.log(`[API] Password check for paste ${id}: ${isValid ? 'valid' : 'invalid'}`);
    return isValid;
  }

  async getAllPublicPastes(): Promise<Paste[]> {
    await this.delay(); // Simulate network delay
    
    const pastes = this.getItem<Paste[]>('pastes') || [];
    const publicPastes = pastes
      .filter(p => !p.isPrivate && !p.burnAfterRead)
      .map(p => ({
        ...p,
        createdAt: new Date(p.createdAt),
        expireAt: p.expireAt ? new Date(p.expireAt) : null
      }));
    
    console.log(`[API] Retrieved ${publicPastes.length} public pastes`);
    return publicPastes;
  }

  async getUserPastes(userId: string): Promise<Paste[]> {
    await this.delay(); // Simulate network delay
    
    const pastes = this.getItem<Paste[]>('pastes') || [];
    const userPastes = pastes
      .filter(p => p.userId === userId && !p.burnAfterRead)
      .map(p => ({
        ...p,
        createdAt: new Date(p.createdAt),
        expireAt: p.expireAt ? new Date(p.expireAt) : null
      }));
    
    console.log(`[API] Retrieved ${userPastes.length} pastes for user: ${userId}`);
    return userPastes;
  }
}

// Export a singleton instance
export const api = PasteAPI.getInstance();
