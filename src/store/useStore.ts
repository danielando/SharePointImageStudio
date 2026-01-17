import { create } from 'zustand'
import { Element, Generation, ImageReference, GenerationType, GENERATION_TYPES } from '../types'

interface AppState {
  // User & Auth
  userId: string | null
  isAuthenticated: boolean
  setUserId: (id: string | null) => void

  // Generation
  selectedType: GenerationType
  setSelectedType: (type: GenerationType) => void
  prompt: string
  setPrompt: (prompt: string) => void
  variationsCount: number
  setVariationsCount: (count: number) => void
  selectedStyle: string
  setSelectedStyle: (style: string) => void
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
  isAuthenticated: false,
  setUserId: (id) => set({ userId: id, isAuthenticated: !!id }),

  // Generation
  selectedType: GENERATION_TYPES[0],
  setSelectedType: (type) => set({ selectedType: type }),
  prompt: '',
  setPrompt: (prompt) => set({ prompt }),
  variationsCount: 1,
  setVariationsCount: (count) => set({ variationsCount: count }),
  selectedStyle: 'none',
  setSelectedStyle: (style) => set({ selectedStyle: style }),
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
