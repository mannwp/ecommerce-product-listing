// tests/mocks/firebase.ts
import { vi } from 'vitest'

// Mock Firebase Authentication
const mockAuth = {
  onAuthStateChanged: vi.fn((callback) => {
    callback(null) // Default: unauthenticated user
    return () => {} // Mock unsubscribe function
  }),
}

// Mock Firestore
const mockDb = {
  collection: vi.fn(() => ({
    // Mock for collection-level methods (e.g., getDocs)
    getDocs: vi.fn(),
    // Mock for nested doc() calls
    doc: vi.fn(() => ({
      getDoc: vi.fn(),
      collection: vi.fn(() => ({
        addDoc: vi.fn(),
        orderBy: vi.fn(() => ({
          onSnapshot: vi.fn(),
        })),
      })),
    })),
  })),
  doc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  addDoc: vi.fn(),
  onSnapshot: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
  Timestamp: {
    fromDate: (date: Date) => ({ toDate: () => date }),
  },
}

// Mock Firebase imports
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => mockAuth),
  onAuthStateChanged: mockAuth.onAuthStateChanged,
}))

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => mockDb),
  collection: mockDb.collection,
  doc: mockDb.doc,
  getDoc: mockDb.getDoc,
  getDocs: mockDb.getDocs,
  addDoc: mockDb.addDoc,
  onSnapshot: mockDb.onSnapshot,
  query: mockDb.query,
  orderBy: mockDb.orderBy,
  Timestamp: mockDb.Timestamp,
}))

export { mockAuth as auth, mockDb as db }
