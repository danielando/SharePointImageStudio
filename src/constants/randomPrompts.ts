export const RANDOM_PROMPTS = [
  // SharePoint/Business themed
  "Modern office workspace with natural lighting and collaboration areas",
  "Team meeting in a bright conference room with digital displays",
  "Professional business handshake in modern office setting",
  "Diverse team collaborating around a laptop",
  "Sleek corporate presentation with charts and graphs",
  "Modern workspace with plants and minimalist design",
  "Professional woman leading a team meeting",
  "Digital transformation concept with technology elements",
  "Clean desk setup with laptop and coffee",
  "Business people walking in modern office corridor",

  // Technology
  "Abstract digital network connections and data visualization",
  "Cloud computing infrastructure concept",
  "Cybersecurity shield protecting digital data",
  "AI and machine learning visualization",
  "Innovation and technology light bulb moment",

  // Nature/Abstract
  "Vibrant sunset over mountain landscape",
  "Peaceful zen garden with flowing water",
  "Abstract geometric patterns in blue and purple",
  "Tropical beach with crystal clear water",
  "Northern lights aurora borealis",

  // Creative/Artistic
  "Watercolor painting of a city skyline",
  "Minimalist geometric abstract art",
  "Vibrant street art mural",
  "Modern architecture with glass and steel",
  "Colorful gradient waves and patterns",

  // Professional/Corporate
  "Success and growth concept with upward arrow",
  "Global business network connections",
  "Innovation lightbulb on dark background",
  "Professional portfolio showcase",
  "Modern corporate building exterior",

  // Seasonal/Holiday
  "Cozy autumn coffee shop interior",
  "Winter wonderland snowy landscape",
  "Spring flowers blooming in garden",
  "Summer beach vacation vibes",

  // Inspirational
  "Journey to success concept",
  "Teamwork and collaboration illustration",
  "Breaking through barriers concept",
  "Reaching goals and achievement",
  "Creative brainstorming session"
]

export function getRandomPrompt(): string {
  return RANDOM_PROMPTS[Math.floor(Math.random() * RANDOM_PROMPTS.length)]
}
