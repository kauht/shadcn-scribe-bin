import { Paste, User } from "./types";
import { generateId } from "./utils";

// Mock database with localStorage persistence
const storageKeys = {
  users: "kaught_users",
  pastes: "kaught_pastes",
  currentUser: "kaught_current_user"
};

// Initialize storage
const initializeStorage = () => {
  if (typeof window === 'undefined') return; // Skip if not in browser context
  
  if (!localStorage.getItem(storageKeys.users)) {
    localStorage.setItem(storageKeys.users, JSON.stringify([]));
  }
  
  if (!localStorage.getItem(storageKeys.pastes)) {
    localStorage.setItem(storageKeys.pastes, JSON.stringify([]));
  }
};

// Load data from localStorage
const loadUsers = (): User[] => {
  if (typeof window === 'undefined') return []; // Skip if not in browser context
  
  try {
    const data = localStorage.getItem(storageKeys.users);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load users:", error);
    return [];
  }
};

const loadPastes = (): Paste[] => {
  if (typeof window === 'undefined') return []; // Skip if not in browser context
  
  try {
    const data = localStorage.getItem(storageKeys.pastes);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load pastes:", error);
    return [];
  }
};

const loadCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null; // Skip if not in browser context
  
  try {
    const data = localStorage.getItem(storageKeys.currentUser);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Failed to load current user:", error);
    return null;
  }
};

// Save data to localStorage
const saveUsers = (users: User[]) => {
  if (typeof window === 'undefined') return; // Skip if not in browser context
  localStorage.setItem(storageKeys.users, JSON.stringify(users));
};

const savePastes = (pastes: Paste[]) => {
  if (typeof window === 'undefined') return; // Skip if not in browser context
  localStorage.setItem(storageKeys.pastes, JSON.stringify(pastes));
};

const saveCurrentUser = (user: User | null) => {
  if (typeof window === 'undefined') return; // Skip if not in browser context
  localStorage.setItem(storageKeys.currentUser, user ? JSON.stringify(user) : "null");
};

// Initialize storage
initializeStorage();

// Load initial data
let users = loadUsers();
let pastes = loadPastes();
let currentUser = loadCurrentUser();

// User functions
export function createUser(email: string, password: string, name: string): User {
  const user = {
    id: generateId(),
    email,
    name,
    createdAt: new Date(),
  };
  users.push(user);
  saveUsers(users);
  return user;
}

export function login(email: string, password: string): User | null {
  const user = users.find(u => u.email === email);
  if (user) {
    currentUser = user;
    saveCurrentUser(user);
    return user;
  }
  return null;
}

export function logout(): void {
  currentUser = null;
  saveCurrentUser(null);
}

export function getCurrentUser(): User | null {
  return currentUser;
}

export function getUserPastes(userId: string): Paste[] {
  return pastes.filter(p => p.userId === userId && !p.burnAfterRead);
}

// Paste functions
export function createPaste(pasteData: Omit<Paste, 'id' | 'createdAt' | 'viewCount'>): Paste {
  try {
    if (!pasteData.content?.trim()) {
      throw new Error("Paste content is required");
    }
    if (!pasteData.title?.trim()) {
      throw new Error("Paste title is required");
    }

    const newPaste: Paste = {
      ...pasteData,
      id: generateId(8),
      createdAt: new Date(),
      viewCount: 0,
    };
    
    pastes.push(newPaste);
    savePastes(pastes);
    return newPaste;
  } catch (error) {
    console.error("Failed to create paste:", error);
    throw error; // Re-throw the error to be handled by the form
  }
}

export function getPasteById(id: string): Paste | null {
  // Reload pastes from storage to ensure we have the latest data
  pastes = loadPastes();
  
  const paste = pastes.find(p => p.id === id);
  
  if (!paste) {
    return null;
  }
  
  // Check if paste has expired
  if (paste.expireAt && new Date(paste.expireAt) < new Date()) {
    // Remove expired paste
    pastes = pastes.filter(p => p.id !== id);
    savePastes(pastes);
    return null;
  }
  
  return paste;
}

export function incrementViewCount(id: string): void {
  const paste = pastes.find(p => p.id === id);
  if (paste) {
    paste.viewCount += 1;
    savePastes(pastes);
    
    // Handle burn after read
    if (paste.burnAfterRead && paste.viewCount > 1) {
      // Remove from storage
      pastes = pastes.filter(p => p.id !== id);
      savePastes(pastes);
    }
  }
}

export function checkPassword(pasteId: string, password: string): boolean {
  const paste = pastes.find(p => p.id === pasteId);
  if (!paste || !paste.isPasswordProtected) {
    return false;
  }
  return paste.password === password;
}

export function deletePaste(id: string): boolean {
  const initialLength = pastes.length;
  pastes = pastes.filter(p => p.id !== id);
  savePastes(pastes);
  return pastes.length !== initialLength;
}

// Initialize with some demo data
export function initializeDemo(): void {
  // Only initialize if no pastes exist
  if (pastes.length === 0) {
    const demoUser = createUser("demo@example.com", "password", "Demo User");
    
    createPaste({
      title: "Hello World in JavaScript",
      content: "console.log('Hello World!');",
      language: "javascript",
      expireAt: null,
      userId: demoUser.id,
      isPrivate: false,
      isPasswordProtected: false,
      burnAfterRead: false,
    });
    
    createPaste({
      title: "Python Example",
      content: "def hello():\n    print('Hello, World!')\n\nhello()",
      language: "python",
      expireAt: null,
      userId: demoUser.id,
      isPrivate: false,
      isPasswordProtected: false,
      burnAfterRead: false,
    });
    
    createPaste({
      title: "Private Note",
      content: "This is a private note with a password",
      language: "plaintext",
      expireAt: null,
      userId: demoUser.id,
      isPrivate: true,
      isPasswordProtected: true,
      password: "secret",
      burnAfterRead: false,
    });
    
    createPaste({
      title: "Burn After Reading",
      content: "This paste will be deleted after it's viewed once!",
      language: "plaintext",
      expireAt: null,
      userId: demoUser.id,
      isPrivate: true,
      isPasswordProtected: false,
      burnAfterRead: true,
    });
  }
}

// Initialize the demo data
initializeDemo();
