import { motion } from 'framer-motion'
import { useStore } from '../store/useStore'
import { GENERATION_TYPES } from '../types'

export default function GenerationTypeSelector() {
  const { selectedType, setSelectedType } = useStore()

  const getAspectRatioPreview = (aspectRatio: string) => {
    // Return a visual representation of the aspect ratio
    const ratios: Record<string, string> = {
      '1:1': 'w-8 h-8',
      '4:3': 'w-10 h-8',
      '16:9': 'w-16 h-9',
      '2:1': 'w-12 h-6',
      '4:1': 'w-16 h-4',
      '21:9': 'w-20 h-8',
      'custom': 'w-10 h-10 border-2 border-dashed',
    }
    return ratios[aspectRatio] || 'w-10 h-10'
  }

  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-2">
        {GENERATION_TYPES.map((type) => {
          const isSelected = selectedType.id === type.id
          return (
            <motion.button
              key={type.id}
              onClick={() => setSelectedType(type)}
              className={`
                relative px-4 py-2.5 rounded-lg font-medium text-sm
                transition-all duration-200
                ${isSelected
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                  : 'bg-charcoal-800 text-charcoal-300 hover:bg-charcoal-700 hover:text-white'
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`
                    ${getAspectRatioPreview(type.aspectRatio)}
                    ${isSelected ? 'bg-white/20' : 'bg-charcoal-600'}
                    rounded
                  `}
                />
                <span>{type.name}</span>
              </div>
              {isSelected && type.id !== 'custom' && (
                <div className="absolute -bottom-6 left-0 right-0 text-xs text-charcoal-400 text-center">
                  {type.aspectRatio}
                </div>
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
