
import { Paste, User } from "./types";
import { generateId } from "./utils";

// Mock database
let users: User[] = [];
let pastes: Paste[] = [];
let currentUser: User | null = null;

// User functions
export function createUser(email: string, password: string, name: string): User {
  const user = {
    id: generateId(),
    email,
    name,
    createdAt: new Date(),
  };
  users.push(user);
  return user;
}

export function login(email: string, password: string): User | null {
  const user = users.find(u => u.email === email);
  if (user) {
    currentUser = user;
    return user;
  }
  return null;
}

export function logout(): void {
  currentUser = null;
}

export function getCurrentUser(): User | null {
  return currentUser;
}

export function getUserPastes(userId: string): Paste[] {
  return pastes.filter(p => p.userId === userId && !p.burnAfterRead);
}

// Paste functions
export function createPaste(pasteData: Omit<Paste, 'id' | 'createdAt' | 'viewCount'>): Paste {
  const newPaste: Paste = {
    ...pasteData,
    id: generateId(8),
    createdAt: new Date(),
    viewCount: 0,
  };
  
  pastes.push(newPaste);
  return newPaste;
}

export function getPasteById(id: string): Paste | null {
  const paste = pastes.find(p => p.id === id);
  
  if (!paste) {
    return null;
  }
  
  // Check if paste has expired
  if (paste.expireAt && paste.expireAt < new Date()) {
    // Remove expired paste
    pastes = pastes.filter(p => p.id !== id);
    return null;
  }
  
  return paste;
}

export function incrementViewCount(id: string): void {
  const paste = pastes.find(p => p.id === id);
  if (paste) {
    paste.viewCount += 1;
    
    // Handle burn after read
    if (paste.burnAfterRead && paste.viewCount > 1) {
      // Remove from storage
      pastes = pastes.filter(p => p.id !== id);
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
  return pastes.length !== initialLength;
}

// Initialize with some demo data
export function initializeDemo(): void {
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

// Initialize the demo data
initializeDemo();
