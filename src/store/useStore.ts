import { create } from 'zustand'
import { Element, Generation, ImageReference, GenerationType, GENERATION_TYPES } from '../types'

// Resolution options with credit costs
export type Resolution = '1K' | '2K' | '4K'
export const RESOLUTION_OPTIONS: { id: Resolution; label: string; creditCost: number }[] = [
  { id: '1K', label: '1K', creditCost: 0.5 },
  { id: '2K', label: '2K', creditCost: 1 },
  { id: '4K', label: '4K', creditCost: 2 },
]

interface User {
  id: string // Azure AD homeAccountId
  email: string
  name: string | null
  subscription_tier: 'free' | 'basic' | 'pro'
  images_generated: number // Total lifetime images generated
  image_balance: number // Current available balance (accumulates monthly)
  monthly_allocation: number // Images added per month based on tier
  bonus_images: number // Total bonus images purchased
  stripe_customer_id: string | null
  created_at: string
  updated_at: string
}

interface AppState {
  // User & Auth
  userId: string | null
  user: User | null
  isAuthenticated: boolean
  setUserId: (id: string | null) => void
  setUser: (user: User | null) => void
  setAuthenticated: (isAuthenticated: boolean) => void

  // Generation
  selectedType: GenerationType
  setSelectedType: (type: GenerationType) => void
  prompt: string
  setPrompt: (prompt: string) => void
  variationsCount: number
  setVariationsCount: (count: number) => void
  selectedStyle: string
  setSelectedStyle: (style: string) => void
  selectedResolution: Resolution
  setSelectedResolution: (resolution: Resolution) => void
  imageReferences: ImageReference[]
  addImageReference: (ref: ImageReference) => void
  removeImageReference: (id: string) => void
  clearImageReferences: () => void

  // Elements
  elements: Element[]
  setElements: (elements: Element[]) => void
  addElement: (element: Element) => void
  updateElement: (id: string, element: Partial<Element>) => void
  deleteElement: (id: string) => void

  // Generations
  generations: Generation[]
  setGenerations: (generations: Generation[]) => void
  addGeneration: (generation: Generation) => void
  updateGeneration: (id: string, generation: Partial<Generation>) => void
  deleteGeneration: (id: string) => void

  // UI State
  showElementsModal: boolean
  setShowElementsModal: (show: boolean) => void
  editingElement: Element | null
  setEditingElement: (element: Element | null) => void
  selectedGeneration: Generation | null
  setSelectedGeneration: (generation: Generation | null) => void
}

export const useStore = create<AppState>((set) => ({
  // User & Auth
  userId: null,
  user: null,
  isAuthenticated: false,
  setUserId: (id) => set({ userId: id }),
  setUser: (user) => set({ user, userId: user?.id || null }),
  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),

  // Generation
  selectedType: GENERATION_TYPES[0],
  setSelectedType: (type) => set({ selectedType: type }),
  prompt: '',
  setPrompt: (prompt) => set({ prompt }),
  variationsCount: 1,
  setVariationsCount: (count) => set({ variationsCount: count }),
  selectedStyle: 'none',
  setSelectedStyle: (style) => set({ selectedStyle: style }),
  selectedResolution: '2K',
  setSelectedResolution: (resolution) => set({ selectedResolution: resolution }),
  imageReferences: [],
  addImageReference: (ref) => set((state) => ({
    imageReferences: [...state.imageReferences, ref]
  })),
  removeImageReference: (id) => set((state) => ({
    imageReferences: state.imageReferences.filter(r => r.id !== id)
  })),
  clearImageReferences: () => set({ imageReferences: [] }),

  // Elements
  elements: [],
  setElements: (elements) => set({ elements }),
  addElement: (element) => set((state) => ({
    elements: [...state.elements, element]
  })),
  updateElement: (id, element) => set((state) => ({
    elements: state.elements.map(e => e.id === id ? { ...e, ...element } : e)
  })),
  deleteElement: (id) => set((state) => ({
    elements: state.elements.filter(e => e.id !== id)
  })),

  // Generations
  generations: [],
  setGenerations: (generations) => set({ generations }),
  addGeneration: (generation) => set((state) => ({
    generations: [generation, ...state.generations]
  })),
  updateGeneration: (id, generation) => set((state) => ({
    generations: state.generations.map(g => g.id === id ? { ...g, ...generation } : g)
  })),
  deleteGeneration: (id) => set((state) => ({
    generations: state.generations.filter(g => g.id !== id)
  })),

  // UI State
  showElementsModal: false,
  setShowElementsModal: (show) => set({ showElementsModal: show }),
  editingElement: null,
  setEditingElement: (element) => set({ editingElement: element }),
  selectedGeneration: null,
  setSelectedGeneration: (generation) => set({ selectedGeneration: generation }),
}))
