import { supabase } from "./client";
import { Quiz, Question, CreateQuizInput } from "@/types/quiz";

// Resilient default seed data in case Supabase table hasn't been migrated yet
export const DEFAULT_PUBLIC_QUIZZES: Quiz[] = [
  // 1. Geography
  {
    id: "11111111-1111-1111-1111-111111111111",
    title: "World Geography & Epic Wonders",
    description: "Challenge your geographical IQ across famous continents, ocean depths, and historic capitals.",
    category: "Geography",
    creator_email: "Quizemia Official",
    is_public: true,
    cover_image: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&q=80",
    play_count: 342,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    questions: [
      {
        question_text: "Which is the largest ocean on Planet Earth?",
        time_limit: 20,
        points: 1000,
        order_index: 0,
        media_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
        options: [
          { id: "a", text: "Pacific Ocean", is_correct: true, color: "red", shape: "triangle" },
          { id: "b", text: "Atlantic Ocean", is_correct: false, color: "blue", shape: "diamond" },
          { id: "c", text: "Indian Ocean", is_correct: false, color: "yellow", shape: "circle" },
          { id: "d", text: "Arctic Ocean", is_correct: false, color: "green", shape: "square" },
        ],
      },
      {
        question_text: "What is the official capital city of Australia?",
        time_limit: 15,
        points: 1000,
        order_index: 1,
        options: [
          { id: "a", text: "Sydney", is_correct: false, color: "red", shape: "triangle" },
          { id: "b", text: "Melbourne", is_correct: false, color: "blue", shape: "diamond" },
          { id: "c", text: "Canberra", is_correct: true, color: "yellow", shape: "circle" },
          { id: "d", text: "Perth", is_correct: false, color: "green", shape: "square" },
        ],
      },
      {
        question_text: "Mount Kilimanjaro is situated on which continent?",
        time_limit: 20,
        points: 1000,
        order_index: 2,
        options: [
          { id: "a", text: "South America", is_correct: false, color: "red", shape: "triangle" },
          { id: "b", text: "Asia", is_correct: false, color: "blue", shape: "diamond" },
          { id: "c", text: "Europe", is_correct: false, color: "yellow", shape: "circle" },
          { id: "d", text: "Africa", is_correct: true, color: "green", shape: "square" },
        ],
      },
      {
        question_text: "What is recognized as the longest river in the world?",
        time_limit: 20,
        points: 1000,
        order_index: 3,
        options: [
          { id: "a", text: "Amazon River", is_correct: false, color: "red", shape: "triangle" },
          { id: "b", text: "Nile River", is_correct: true, color: "blue", shape: "diamond" },
          { id: "c", text: "Yangtze River", is_correct: false, color: "yellow", shape: "circle" },
          { id: "d", text: "Mississippi River", is_correct: false, color: "green", shape: "square" },
        ],
      },
      {
        question_text: "Which country has the highest total number of natural lakes in the world?",
        time_limit: 20,
        points: 1000,
        order_index: 4,
        options: [
          { id: "a", text: "Canada", is_correct: true, color: "red", shape: "triangle" },
          { id: "b", text: "Russia", is_correct: false, color: "blue", shape: "diamond" },
          { id: "c", text: "United States", is_correct: false, color: "yellow", shape: "circle" },
          { id: "d", text: "Finland", is_correct: false, color: "green", shape: "square" },
        ],
      },
      {
        question_text: "The ancient rock-carved city of Petra is located in which modern nation?",
        time_limit: 20,
        points: 1000,
        order_index: 5,
        options: [
          { id: "a", text: "Egypt", is_correct: false, color: "red", shape: "triangle" },
          { id: "b", text: "Greece", is_correct: false, color: "blue", shape: "diamond" },
          { id: "c", text: "Jordan", is_correct: true, color: "yellow", shape: "circle" },
          { id: "d", text: "Turkey", is_correct: false, color: "green", shape: "square" },
        ],
      },
    ],
  },

  // 2. Science: Space & Astrophysics
  {
    id: "22222222-2222-2222-2222-222222222222",
    title: "Cosmic Odyssey & Astrophysics",
    description: "Explore planetary orbits, black holes, neutron stars, and modern space exploration.",
    category: "Science",
    creator_email: "Quizemia Official",
    is_public: true,
    cover_image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
    play_count: 279,
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    questions: [
      {
        question_text: "Which planet is affectionately nicknamed the 'Red Planet'?",
        time_limit: 15,
        points: 1000,
        order_index: 0,
        media_url: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=800&q=80",
        options: [
          { id: "a", text: "Mars", is_correct: true, color: "red", shape: "triangle" },
          { id: "b", text: "Jupiter", is_correct: false, color: "blue", shape: "diamond" },
          { id: "c", text: "Venus", is_correct: false, color: "yellow", shape: "circle" },
          { id: "d", text: "Mercury", is_correct: false, color: "green", shape: "square" },
        ],
      },
      {
        question_text: "What celestial object has gravitational pull so strong that even light cannot escape?",
        time_limit: 20,
        points: 1000,
        order_index: 1,
        options: [
          { id: "a", text: "Supernova", is_correct: false, color: "red", shape: "triangle" },
          { id: "b", text: "Black Hole", is_correct: true, color: "blue", shape: "diamond" },
          { id: "c", text: "White Dwarf", is_correct: false, color: "yellow", shape: "circle" },
          { id: "d", text: "Pulsar", is_correct: false, color: "green", shape: "square" },
        ],
      },
      {
        question_text: "Approximately how long does sunlight take to reach Planet Earth?",
        time_limit: 15,
        points: 1000,
        order_index: 2,
        options: [
          { id: "a", text: "Instantaneous", is_correct: false, color: "red", shape: "triangle" },
          { id: "b", text: "30 seconds", is_correct: false, color: "blue", shape: "diamond" },
          { id: "c", text: "8 minutes and 20 seconds", is_correct: true, color: "yellow", shape: "circle" },
          { id: "d", text: "1 hour", is_correct: false, color: "green", shape: "square" },
        ],
      },
      {
        question_text: "What is the closest known star system to our Solar System?",
        time_limit: 20,
        points: 1000,
        order_index: 3,
        options: [
          { id: "a", text: "Sirius", is_correct: false, color: "red", shape: "triangle" },
          { id: "b", text: "Alpha Centauri", is_correct: true, color: "blue", shape: "diamond" },
          { id: "c", text: "Betelgeuse", is_correct: false, color: "yellow", shape: "circle" },
          { id: "d", text: "Polaris", is_correct: false, color: "green", shape: "square" },
        ],
      },
      {
        question_text: "Which moon in our solar system is famous for having over 400 active volcanoes?",
        time_limit: 20,
        points: 1000,
        order_index: 4,
        options: [
          { id: "a", text: "Io (Jupiter)", is_correct: true, color: "red", shape: "triangle" },
          { id: "b", text: "Titan (Saturn)", is_correct: false, color: "blue", shape: "diamond" },
          { id: "c", text: "Europa (Jupiter)", is_correct: false, color: "yellow", shape: "circle" },
          { id: "d", text: "Our Moon", is_correct: false, color: "green", shape: "square" },
        ],
      },
      {
        question_text: "What astronomical event marks the explosive death of a supermassive star?",
        time_limit: 15,
        points: 1000,
        order_index: 5,
        options: [
          { id: "a", text: "Solar Flare", is_correct: false, color: "red", shape: "triangle" },
          { id: "b", text: "Cosmic Ray", is_correct: false, color: "blue", shape: "diamond" },
          { id: "c", text: "Supernova", is_correct: true, color: "yellow", shape: "circle" },
          { id: "d", text: "Nebula Pulse", is_correct: false, color: "green", shape: "square" },
        ],
      },
    ],
  },

  // 3. Technology: AI & Computing
  {
    id: "33333333-3333-3333-3333-333333333333",
    title: "AI Revolution & Next-Gen Computing",
    description: "From Turing tests and Neural Networks to Transformer models and autonomous agents.",
    category: "Technology",
    creator_email: "Quizemia Official",
    is_public: true,
    cover_image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    play_count: 418,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    questions: [
      {
        question_text: "What does the 'T' stand for in the popular LLM architecture 'GPT'?",
        time_limit: 20,
        points: 1000,
        order_index: 0,
        options: [
          { id: "a", text: "Translation", is_correct: false, color: "red", shape: "triangle" },
          { id: "b", text: "Tokenizer", is_correct: false, color: "blue", shape: "diamond" },
          { id: "c", text: "Transformer", is_correct: true, color: "yellow", shape: "circle" },
          { id: "d", text: "Tensor", is_correct: false, color: "green", shape: "square" },
        ],
      },
      {
        question_text: "Which pioneer formulated the standard 'Imitation Game' to evaluate machine intelligence?",
        time_limit: 20,
        points: 1000,
        order_index: 1,
        options: [
          { id: "a", text: "Alan Turing", is_correct: true, color: "red", shape: "triangle" },
          { id: "b", text: "John von Neumann", is_correct: false, color: "blue", shape: "diamond" },
          { id: "c", text: "Claude Shannon", is_correct: false, color: "yellow", shape: "circle" },
          { id: "d", text: "Ada Lovelace", is_correct: false, color: "green", shape: "square" },
        ],
      },
      {
        question_text: "In deep neural networks, what technique calculates parameter weight gradients backwards?",
        time_limit: 20,
        points: 1000,
        order_index: 2,
        options: [
          { id: "a", text: "Forward Propagation", is_correct: false, color: "red", shape: "triangle" },
          { id: "b", text: "Backpropagation", is_correct: true, color: "blue", shape: "diamond" },
          { id: "c", text: "Dropout Pruning", is_correct: false, color: "yellow", shape: "circle" },
          { id: "d", text: "Stochastic Sampling", is_correct: false, color: "green", shape: "square" },
        ],
      },
      {
        question_text: "What paradigm trains autonomous agents using positive rewards and negative penalties?",
        time_limit: 20,
        points: 1000,
        order_index: 3,
        options: [
          { id: "a", text: "Unsupervised Clustering", is_correct: false, color: "red", shape: "triangle" },
          { id: "b", text: "Supervised Classification", is_correct: false, color: "blue", shape: "diamond" },
          { id: "c", text: "Reinforcement Learning", is_correct: true, color: "yellow", shape: "circle" },
          { id: "d", text: "Linear Regression", is_correct: false, color: "green", shape: "square" },
        ],
      },
      {
        question_text: "Which IBM supercomputer famously defeated world chess champion Garry Kasparov in 1997?",
        time_limit: 15,
        points: 1000,
        order_index: 4,
        options: [
          { id: "a", text: "Deep Blue", is_correct: true, color: "red", shape: "triangle" },
          { id: "b", text: "Watson", is_correct: false, color: "blue", shape: "diamond" },
          { id: "c", text: "AlphaGo", is_correct: false, color: "yellow", shape: "circle" },
          { id: "d", text: "ENIAC", is_correct: false, color: "green", shape: "square" },
        ],
      },
      {
        question_text: "In artificial neurons, what mathematical function introduces non-linearity to output values?",
        time_limit: 20,
        points: 1000,
        order_index: 5,
        options: [
          { id: "a", text: "Loss Gradient", is_correct: false, color: "red", shape: "triangle" },
          { id: "b", text: "Activation Function", is_correct: true, color: "blue", shape: "diamond" },
          { id: "c", text: "Vector Embedding", is_correct: false, color: "yellow", shape: "circle" },
          { id: "d", text: "Epoch Counter", is_correct: false, color: "green", shape: "square" },
        ],
      },
    ],
  },

  // 4. History: Ancient Civilizations
  {
    id: "44444444-4444-4444-4444-444444444444",
    title: "Ancient Civilizations & World Empires",
    description: "Journey through the Pharaohs, Spartan warriors, Roman emperors, and ancient wonders.",
    category: "History",
    creator_email: "Quizemia Official",
    is_public: true,
    cover_image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80",
    play_count: 215,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    questions: [
      {
        question_text: "Which civilization engineered the colossal Great Pyramids of Giza along the Nile?",
        time_limit: 15,
        points: 1000,
        order_index: 0,
        options: [
          { id: "a", text: "Ancient Egyptians", is_correct: true, color: "red", shape: "triangle" },
          { id: "b", text: "Mesopotamians", is_correct: false, color: "blue", shape: "diamond" },
          { id: "c", text: "Phoenicians", is_correct: false, color: "yellow", shape: "circle" },
          { id: "d", text: "Persians", is_correct: false, color: "green", shape: "square" },
        ],
      },
      {
        question_text: "Which Macedonian king conquered Persia and built a vast empire spanning three continents before age 30?",
        time_limit: 20,
        points: 1000,
        order_index: 1,
        options: [
          { id: "a", text: "Julius Caesar", is_correct: false, color: "red", shape: "triangle" },
          { id: "b", text: "Alexander the Great", is_correct: true, color: "blue", shape: "diamond" },
          { id: "c", text: "Cyrus the Great", is_correct: false, color: "yellow", shape: "circle" },
          { id: "d", text: "Pericles", is_correct: false, color: "green", shape: "square" },
        ],
      },
      {
        question_text: "What famous ancient trade route connected the Han Dynasty in China with the Mediterranean world?",
        time_limit: 15,
        points: 1000,
        order_index: 2,
        options: [
          { id: "a", text: "The Spice Trail", is_correct: false, color: "red", shape: "triangle" },
          { id: "b", text: "The Royal Road", is_correct: false, color: "blue", shape: "diamond" },
          { id: "c", text: "The Silk Road", is_correct: true, color: "yellow", shape: "circle" },
          { id: "d", text: "The Amber Route", is_correct: false, color: "green", shape: "square" },
        ],
      },
      {
        question_text: "Which ancient Babylonian legal code is celebrated for the principle 'an eye for an eye'?",
        time_limit: 20,
        points: 1000,
        order_index: 3,
        options: [
          { id: "a", text: "Code of Hammurabi", is_correct: true, color: "red", shape: "triangle" },
          { id: "b", text: "Justinian Code", is_correct: false, color: "blue", shape: "diamond" },
          { id: "c", text: "Twelve Tables", is_correct: false, color: "yellow", shape: "circle" },
          { id: "d", text: "Draconian Constitution", is_correct: false, color: "green", shape: "square" },
        ],
      },
      {
        question_text: "In which Greek city-state was direct citizen democracy first established and practiced?",
        time_limit: 15,
        points: 1000,
        order_index: 4,
        options: [
          { id: "a", text: "Sparta", is_correct: false, color: "red", shape: "triangle" },
          { id: "b", text: "Athens", is_correct: true, color: "blue", shape: "diamond" },
          { id: "c", text: "Corinth", is_correct: false, color: "yellow", shape: "circle" },
          { id: "d", text: "Thebes", is_correct: false, color: "green", shape: "square" },
        ],
      },
      {
        question_text: "In what year was the historic Magna Carta signed in England, limiting royal authority?",
        time_limit: 20,
        points: 1000,
        order_index: 5,
        options: [
          { id: "a", text: "1066", is_correct: false, color: "red", shape: "triangle" },
          { id: "b", text: "1492", is_correct: false, color: "blue", shape: "diamond" },
          { id: "c", text: "1215", is_correct: true, color: "yellow", shape: "circle" },
          { id: "d", text: "1776", is_correct: false, color: "green", shape: "square" },
        ],
      },
    ],
  },

  // 5. Pop Culture & Movies
  {
    id: "55555555-5555-5555-5555-555555555555",
    title: "Pop Culture & Blockbuster Cinema",
    description: "Test your movie buffs and music lore across epic franchises, Oscar winners, and iconic chart-toppers.",
    category: "Pop Culture",
    creator_email: "Quizemia Official",
    is_public: true,
    cover_image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80",
    play_count: 367,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    questions: [
      {
        question_text: "In the Star Wars saga, what is the name of Han Solo and Chewbacca's legendary freighter?",
        time_limit: 15,
        points: 1000,
        order_index: 0,
        options: [
          { id: "a", text: "Millennium Falcon", is_correct: true, color: "red", shape: "triangle" },
          { id: "b", text: "Star Destroyer", is_correct: false, color: "blue", shape: "diamond" },
          { id: "c", text: "X-Wing Starfighter", is_correct: false, color: "yellow", shape: "circle" },
          { id: "d", text: "Razor Crest", is_correct: false, color: "green", shape: "square" },
        ],
      },
      {
        question_text: "Which actor kicked off the Marvel Cinematic Universe in 2008 portraying Tony Stark / Iron Man?",
        time_limit: 15,
        points: 1000,
        order_index: 1,
        options: [
          { id: "a", text: "Chris Evans", is_correct: false, color: "red", shape: "triangle" },
          { id: "b", text: "Robert Downey Jr.", is_correct: true, color: "blue", shape: "diamond" },
          { id: "c", text: "Mark Ruffalo", is_correct: false, color: "yellow", shape: "circle" },
          { id: "d", text: "Chris Hemsworth", is_correct: false, color: "green", shape: "square" },
        ],
      },
      {
        question_text: "Which South Korean masterpiece became the first non-English language film to win Best Picture at the Oscars?",
        time_limit: 20,
        points: 1000,
        order_index: 2,
        options: [
          { id: "a", text: "Train to Busan", is_correct: false, color: "red", shape: "triangle" },
          { id: "b", text: "The Handmaiden", is_correct: false, color: "blue", shape: "diamond" },
          { id: "c", text: "Parasite", is_correct: true, color: "yellow", shape: "circle" },
          { id: "d", text: "Oldboy", is_correct: false, color: "green", shape: "square" },
        ],
      },
      {
        question_text: "In 'The Lord of the Rings', into which volcanic mountain must the One Ring be cast to be unmade?",
        time_limit: 15,
        points: 1000,
        order_index: 3,
        options: [
          { id: "a", text: "Mount Doom (Orodruin)", is_correct: true, color: "red", shape: "triangle" },
          { id: "b", text: "Misty Mountains", is_correct: false, color: "blue", shape: "diamond" },
          { id: "c", text: "Erebor", is_correct: false, color: "yellow", shape: "circle" },
          { id: "d", text: "Weathertop", is_correct: false, color: "green", shape: "square" },
        ],
      },
      {
        question_text: "Who produced and released 'Thriller', the certified best-selling album in worldwide music history?",
        time_limit: 15,
        points: 1000,
        order_index: 4,
        options: [
          { id: "a", text: "Prince", is_correct: false, color: "red", shape: "triangle" },
          { id: "b", text: "Michael Jackson", is_correct: true, color: "blue", shape: "diamond" },
          { id: "c", text: "Stevie Wonder", is_correct: false, color: "yellow", shape: "circle" },
          { id: "d", text: "David Bowie", is_correct: false, color: "green", shape: "square" },
        ],
      },
      {
        question_text: "What majestic creature serves as the symbol and house crest of Gryffindor in Harry Potter?",
        time_limit: 15,
        points: 1000,
        order_index: 5,
        options: [
          { id: "a", text: "Eagle", is_correct: false, color: "red", shape: "triangle" },
          { id: "b", text: "Badger", is_correct: false, color: "blue", shape: "diamond" },
          { id: "c", text: "Lion", is_correct: true, color: "yellow", shape: "circle" },
          { id: "d", text: "Serpent", is_correct: false, color: "green", shape: "square" },
        ],
      },
    ],
  },

  // 6. Science: Human Body & Anatomy
  {
    id: "66666666-6666-6666-6666-666666666666",
    title: "Human Body & Biological Wonders",
    description: "Discover organs, genetic codes, neural pathways, and physiological wonders of the human organism.",
    category: "Science",
    creator_email: "Quizemia Official",
    is_public: true,
    cover_image: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=800&q=80",
    play_count: 295,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    questions: [
      {
        question_text: "What cellular organelle is universally referred to as the powerhouse of eukaryotic cells?",
        time_limit: 15,
        points: 1000,
        order_index: 0,
        options: [
          { id: "a", text: "Mitochondria", is_correct: true, color: "red", shape: "triangle" },
          { id: "b", text: "Ribosome", is_correct: false, color: "blue", shape: "diamond" },
          { id: "c", text: "Golgi Apparatus", is_correct: false, color: "yellow", shape: "circle" },
          { id: "d", text: "Endoplasmic Reticulum", is_correct: false, color: "green", shape: "square" },
        ],
      },
      {
        question_text: "What is the largest internal solid organ in the human body?",
        time_limit: 15,
        points: 1000,
        order_index: 1,
        options: [
          { id: "a", text: "Lungs", is_correct: false, color: "red", shape: "triangle" },
          { id: "b", text: "Liver", is_correct: true, color: "blue", shape: "diamond" },
          { id: "c", text: "Brain", is_correct: false, color: "yellow", shape: "circle" },
          { id: "d", text: "Heart", is_correct: false, color: "green", shape: "square" },
        ],
      },
      {
        question_text: "Which blood vessels are responsible for carrying oxygen-rich blood away from the heart?",
        time_limit: 20,
        points: 1000,
        order_index: 2,
        options: [
          { id: "a", text: "Veins", is_correct: false, color: "red", shape: "triangle" },
          { id: "b", text: "Capillaries", is_correct: false, color: "blue", shape: "diamond" },
          { id: "c", text: "Arteries", is_correct: true, color: "yellow", shape: "circle" },
          { id: "d", text: "Venules", is_correct: false, color: "green", shape: "square" },
        ],
      },
      {
        question_text: "How many total bones make up a mature adult human skeletal system?",
        time_limit: 15,
        points: 1000,
        order_index: 3,
        options: [
          { id: "a", text: "206", is_correct: true, color: "red", shape: "triangle" },
          { id: "b", text: "240", is_correct: false, color: "blue", shape: "diamond" },
          { id: "c", text: "185", is_correct: false, color: "yellow", shape: "circle" },
          { id: "d", text: "300", is_correct: false, color: "green", shape: "square" },
        ],
      },
      {
        question_text: "What macromolecule carries hereditary genetic instructions across all known living organisms?",
        time_limit: 15,
        points: 1000,
        order_index: 4,
        options: [
          { id: "a", text: "Insulin", is_correct: false, color: "red", shape: "triangle" },
          { id: "b", text: "DNA (Deoxyribonucleic Acid)", is_correct: true, color: "blue", shape: "diamond" },
          { id: "c", text: "Hemoglobin", is_correct: false, color: "yellow", shape: "circle" },
          { id: "d", text: "ATP", is_correct: false, color: "green", shape: "square" },
        ],
      },
      {
        question_text: "Which brain structure is primarily in charge of motor balance, precision coordination, and posture?",
        time_limit: 20,
        points: 1000,
        order_index: 5,
        options: [
          { id: "a", text: "Amygdala", is_correct: false, color: "red", shape: "triangle" },
          { id: "b", text: "Hippocampus", is_correct: false, color: "blue", shape: "diamond" },
          { id: "c", text: "Cerebellum", is_correct: true, color: "yellow", shape: "circle" },
          { id: "d", text: "Brainstem", is_correct: false, color: "green", shape: "square" },
        ],
      },
    ],
  },

  // 7. General Knowledge: Inventions & Milestones
  {
    id: "77777777-7777-7777-7777-777777777777",
    title: "Great Inventions & World Milestones",
    description: "From the printing press to the lunar landing—celebrating humanity's greatest scientific leaps.",
    category: "General",
    creator_email: "Quizemia Official",
    is_public: true,
    cover_image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80",
    play_count: 254,
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    questions: [
      {
        question_text: "Who pioneered movable-type mechanical printing in Europe around 1440?",
        time_limit: 15,
        points: 1000,
        order_index: 0,
        options: [
          { id: "a", text: "Johannes Gutenberg", is_correct: true, color: "red", shape: "triangle" },
          { id: "b", text: "Leonardo da Vinci", is_correct: false, color: "blue", shape: "diamond" },
          { id: "c", text: "Galileo Galilei", is_correct: false, color: "yellow", shape: "circle" },
          { id: "d", text: "Benjamin Franklin", is_correct: false, color: "green", shape: "square" },
        ],
      },
      {
        question_text: "Sir Alexander Fleming discovered which revolutionary antibiotic substance in 1928?",
        time_limit: 15,
        points: 1000,
        order_index: 1,
        options: [
          { id: "a", text: "Aspirin", is_correct: false, color: "red", shape: "triangle" },
          { id: "b", text: "Penicillin", is_correct: true, color: "blue", shape: "diamond" },
          { id: "c", text: "Morphine", is_correct: false, color: "yellow", shape: "circle" },
          { id: "d", text: "Insulin", is_correct: false, color: "green", shape: "square" },
        ],
      },
      {
        question_text: "In what landmark year did Apollo 11 land Neil Armstrong and Buzz Aldrin on the surface of the Moon?",
        time_limit: 15,
        points: 1000,
        order_index: 2,
        options: [
          { id: "a", text: "1965", is_correct: false, color: "red", shape: "triangle" },
          { id: "b", text: "1972", is_correct: false, color: "blue", shape: "diamond" },
          { id: "c", text: "1969", is_correct: true, color: "yellow", shape: "circle" },
          { id: "d", text: "1959", is_correct: false, color: "green", shape: "square" },
        ],
      },
      {
        question_text: "Who formulated the universal laws of gravitation and classical mechanics in 'Principia Mathematica'?",
        time_limit: 20,
        points: 1000,
        order_index: 3,
        options: [
          { id: "a", text: "Sir Isaac Newton", is_correct: true, color: "red", shape: "triangle" },
          { id: "b", text: "Albert Einstein", is_correct: false, color: "blue", shape: "diamond" },
          { id: "c", text: "Nikola Tesla", is_correct: false, color: "yellow", shape: "circle" },
          { id: "d", text: "Michael Faraday", is_correct: false, color: "green", shape: "square" },
        ],
      },
      {
        question_text: "Which British scientist invented the World Wide Web in 1989 while working at CERN?",
        time_limit: 15,
        points: 1000,
        order_index: 4,
        options: [
          { id: "a", text: "Vint Cerf", is_correct: false, color: "red", shape: "triangle" },
          { id: "b", text: "Tim Berners-Lee", is_correct: true, color: "blue", shape: "diamond" },
          { id: "c", text: "Linus Torvalds", is_correct: false, color: "yellow", shape: "circle" },
          { id: "d", text: "Steve Wozniak", is_correct: false, color: "green", shape: "square" },
        ],
      },
    ],
  },

  // 8. Albanian History, Geography & Culture (Shqip)
  {
    id: "88888888-8888-8888-8888-888888888888",
    title: "Gjeografia, Historia & Kultura Shqiptare",
    description: "Një kuiz magjepsës mbi qytetet historike, natyrën e mrekullueshme dhe trashëgiminë e lavdishme shqiptare.",
    category: "History",
    language: "al",
    creator_email: "Quizemia Official",
    is_public: true,
    cover_image: "https://images.unsplash.com/photo-1687294088591-5e434c105bc1?auto=format&fit=crop&w=800&q=80",
    play_count: 312,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    questions: [
      {
        question_text: "Cili është qyteti historik i Shqipërisë ku u shpall Pavarësia Kombëtare më 28 Nëntor 1912?",
        time_limit: 15,
        points: 1000,
        order_index: 0,
        options: [
          { id: "a", text: "Vlora", is_correct: true, color: "red", shape: "triangle" },
          { id: "b", text: "Tirana", is_correct: false, color: "blue", shape: "diamond" },
          { id: "c", text: "Durrësi", is_correct: false, color: "yellow", shape: "circle" },
          { id: "d", text: "Shkodra", is_correct: false, color: "green", shape: "square" },
        ],
      },
      {
        question_text: "Cili hero kombëtar udhëhoqi me sukses qëndresën e shqiptarëve kundër Perandorisë Osmane në shekullin XV?",
        time_limit: 15,
        points: 1000,
        order_index: 1,
        options: [
          { id: "a", text: "Ismail Qemali", is_correct: false, color: "red", shape: "triangle" },
          { id: "b", text: "Gjergj Kastrioti Skënderbeu", is_correct: true, color: "blue", shape: "diamond" },
          { id: "c", text: "Dedë Gjo Luli", is_correct: false, color: "yellow", shape: "circle" },
          { id: "d", text: "Isa Boletini", is_correct: false, color: "green", shape: "square" },
        ],
      },
      {
        question_text: "Cili liqen është një nga liqenet më të thella dhe më të lashta në Evropë, nën mbrojtjen e UNESCO-s?",
        time_limit: 20,
        points: 1000,
        order_index: 2,
        options: [
          { id: "a", text: "Liqeni i Shkodrës", is_correct: false, color: "red", shape: "triangle" },
          { id: "b", text: "Liqeni i Prespës", is_correct: false, color: "blue", shape: "diamond" },
          { id: "c", text: "Liqeni i Ohrit", is_correct: true, color: "yellow", shape: "circle" },
          { id: "d", text: "Liqeni i Fierzës", is_correct: false, color: "green", shape: "square" },
        ],
      },
      {
        question_text: "Qyteti historik i Beratit njihet ndërkombëtarisht me cilin emërtim tradicional?",
        time_limit: 15,
        points: 1000,
        order_index: 3,
        options: [
          { id: "a", text: "Qyteti i Gurtë", is_correct: false, color: "red", shape: "triangle" },
          { id: "b", text: "Qyteti i Serenatave", is_correct: false, color: "blue", shape: "diamond" },
          { id: "c", text: "Qyteti i Trëndafilave", is_correct: false, color: "yellow", shape: "circle" },
          { id: "d", text: "Qyteti i Një mbi Një Dritareve", is_correct: true, color: "green", shape: "square" },
        ],
      },
      {
        question_text: "Cili alfabet u vendos dhe u unifikua përfundimisht në Kongresin historik të Manastirit në vitin 1908?",
        time_limit: 20,
        points: 1000,
        order_index: 4,
        options: [
          { id: "a", text: "Alfabeti Latin me 36 shkronja", is_correct: true, color: "red", shape: "triangle" },
          { id: "b", text: "Alfabeti Cirilik", is_correct: false, color: "blue", shape: "diamond" },
          { id: "c", text: "Alfabeti Grek", is_correct: false, color: "yellow", shape: "circle" },
          { id: "d", text: "Alfabeti Arab", is_correct: false, color: "green", shape: "square" },
        ],
      },
      {
        question_text: "Cili lumë i Shqipërisë u shpall Parku i Parë Kombëtar i një Lumi të Egër në të gjithë Evropën?",
        time_limit: 15,
        points: 1000,
        order_index: 5,
        options: [
          { id: "a", text: "Drini", is_correct: false, color: "red", shape: "triangle" },
          { id: "b", text: "Vjosa", is_correct: true, color: "blue", shape: "diamond" },
          { id: "c", text: "Shkumbini", is_correct: false, color: "yellow", shape: "circle" },
          { id: "d", text: "Semani", is_correct: false, color: "green", shape: "square" },
        ],
      },
    ],
  },

  // 9. Macedonian Culture, Nature & History (Македонски)
  {
    id: "99999999-9999-9999-9999-999999999999",
    title: "Македонска Култура, Природа & Историја",
    description: "Проверете го вашето знаење за македонските езера, знаменитости, историски личности и културно наследство.",
    category: "History",
    language: "mk",
    creator_email: "Quizemia Official",
    is_public: true,
    cover_image: "https://images.unsplash.com/photo-1611845528017-75215e6d662c?auto=format&fit=crop&w=800&q=80",
    play_count: 289,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    questions: [
      {
        question_text: "Кое езеро во Македонија се смета за едно од најстарите и најдлабоките езера во Европа под заштита на УНЕСКО?",
        time_limit: 15,
        points: 1000,
        order_index: 0,
        options: [
          { id: "a", text: "Охридско Езеро", is_correct: true, color: "red", shape: "triangle" },
          { id: "b", text: "Преспанско Езеро", is_correct: false, color: "blue", shape: "diamond" },
          { id: "c", text: "Дојранско Езеро", is_correct: false, color: "yellow", shape: "circle" },
          { id: "d", text: "Мавровско Езеро", is_correct: false, color: "green", shape: "square" },
        ],
      },
      {
        question_text: "Кој е највисокиот планински врв во Република Македонија со височина од 2.764 метри?",
        time_limit: 15,
        points: 1000,
        order_index: 1,
        options: [
          { id: "a", text: "Титов Врв", is_correct: false, color: "red", shape: "triangle" },
          { id: "b", text: "Голем Кораб", is_correct: true, color: "blue", shape: "diamond" },
          { id: "c", text: "Пелистер", is_correct: false, color: "yellow", shape: "circle" },
          { id: "d", text: "Солунска Глава", is_correct: false, color: "green", shape: "square" },
        ],
      },
      {
        question_text: "Која светски позната хуманитарка и нобеловка за мир е родена во Скопје во 1910 година?",
        time_limit: 15,
        points: 1000,
        order_index: 2,
        options: [
          { id: "a", text: "Марија Кири", is_correct: false, color: "red", shape: "triangle" },
          { id: "b", text: "Флоренс Најтингел", is_correct: false, color: "blue", shape: "diamond" },
          { id: "c", text: "Мајка Тереза", is_correct: true, color: "yellow", shape: "circle" },
          { id: "d", text: "Елеонор Рузвелт", is_correct: false, color: "green", shape: "square" },
        ],
      },
      {
        question_text: "Како се нарекува познатиот македонски традиционален гастрономски специјалитет од печени црвени пиперки?",
        time_limit: 15,
        points: 1000,
        order_index: 3,
        options: [
          { id: "a", text: "Пинџур", is_correct: false, color: "red", shape: "triangle" },
          { id: "b", text: "Тавче гравче", is_correct: false, color: "blue", shape: "diamond" },
          { id: "c", text: "Ѓомлезе", is_correct: false, color: "yellow", shape: "circle" },
          { id: "d", text: "Ајвар", is_correct: true, color: "green", shape: "square" },
        ],
      },
      {
        question_text: "Кој антички град во близина на Битола бил основан во IV век пр.н.е. од Филип II Македонски?",
        time_limit: 20,
        points: 1000,
        order_index: 4,
        options: [
          { id: "a", text: "Хераклеја Линкестис", is_correct: true, color: "red", shape: "triangle" },
          { id: "b", text: "Стоби", is_correct: false, color: "blue", shape: "diamond" },
          { id: "c", text: "Скупи", is_correct: false, color: "yellow", shape: "circle" },
          { id: "d", text: "Баргала", is_correct: false, color: "green", shape: "square" },
        ],
      },
      {
        question_text: "Кој живописен кањон во близина на Скопје е познат по своите пештери и алпско вештачко езеро?",
        time_limit: 15,
        points: 1000,
        order_index: 5,
        options: [
          { id: "a", text: "Демир Капија", is_correct: false, color: "red", shape: "triangle" },
          { id: "b", text: "Кањон Матка", is_correct: true, color: "blue", shape: "diamond" },
          { id: "c", text: "Кањон Градешка Река", is_correct: false, color: "yellow", shape: "circle" },
          { id: "d", text: "Радика", is_correct: false, color: "green", shape: "square" },
        ],
      },
    ],
  },
];

// Helper to get local stored quizzes (for offline / instant fallback)
function getLocalQuizzes(): Quiz[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("kahoot_local_quizzes");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalQuiz(quiz: Quiz) {
  if (typeof window === "undefined") return;
  try {
    const list = getLocalQuizzes();
    const updated = [quiz, ...list.filter((q) => q.id !== quiz.id)];
    localStorage.setItem("kahoot_local_quizzes", JSON.stringify(updated));
  } catch (e) {
    console.error("Local storage error:", e);
  }
}

function deleteLocalQuiz(id: string) {
  if (typeof window === "undefined") return;
  try {
    const list = getLocalQuizzes().filter((q) => q.id !== id);
    localStorage.setItem("kahoot_local_quizzes", JSON.stringify(list));
  } catch (e) {
    console.error("Local storage error:", e);
  }
}

/**
 * Fetch all public quizzes for the Dashboard
 */
export async function fetchPublicQuizzes(): Promise<Quiz[]> {
  const localPublic = getLocalQuizzes().filter((q) => q.is_public);
  try {
    // Route through internal API endpoint to avoid direct client 404 network logs
    const res = await fetch("/api/quizzes?type=public");
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.quizzes) && data.quizzes.length > 0) {
        const remoteIds = new Set(data.quizzes.map((q: Quiz) => q.id));
        const extraLocal = localPublic.filter((q) => !remoteIds.has(q.id));
        return [...data.quizzes, ...extraLocal, ...DEFAULT_PUBLIC_QUIZZES];
      }
    }
    return [...localPublic, ...DEFAULT_PUBLIC_QUIZZES];
  } catch (err) {
    return [...localPublic, ...DEFAULT_PUBLIC_QUIZZES];
  }
}

/**
 * Fetch quizzes created by the logged-in user for MyQuizzes
 */
export async function fetchUserQuizzes(userId?: string | null): Promise<Quiz[]> {
  if (!userId) {
    // Only signed-in users have a personal quiz library
    return [];
  }

  const localList = getLocalQuizzes().filter((q) => q.user_id === userId);

  try {
    const res = await fetch(`/api/quizzes?type=user&userId=${encodeURIComponent(userId)}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.quizzes) && data.quizzes.length > 0) {
        const remoteIds = new Set(data.quizzes.map((q: Quiz) => q.id));
        const extraLocal = localList.filter((q) => !remoteIds.has(q.id));
        return [...data.quizzes, ...extraLocal];
      }
    }
    return localList;
  } catch {
    return localList;
  }
}

/**
 * Fetch single quiz with its full list of questions for gameplay
 */
export async function fetchQuizById(quizId: string): Promise<Quiz | null> {
  // Check local first
  const localMatch = getLocalQuizzes().find((q) => q.id === quizId);
  if (localMatch && localMatch.questions && localMatch.questions.length > 0) {
    return localMatch;
  }

  // Check default public quizzes
  const defaultMatch = DEFAULT_PUBLIC_QUIZZES.find((q) => q.id === quizId);
  if (defaultMatch) {
    return defaultMatch;
  }

  try {
    const res = await fetch(`/api/quizzes?type=single&id=${encodeURIComponent(quizId)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.quiz) {
        return data.quiz as Quiz;
      }
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Create a new quiz with its list of questions
 */
export async function createQuizWithQuestions(
  input: CreateQuizInput,
  userId?: string | null,
  userEmailOrNickname?: string | null
): Promise<{ success: boolean; quiz?: Quiz; error?: string }> {
  const quizId = crypto.randomUUID();
  const authorTag = userEmailOrNickname?.trim() || "Quizemia Creator";
  const newQuiz: Quiz = {
    id: quizId,
    user_id: userId || null,
    creator_email: authorTag,
    title: input.title,
    description: input.description,
    category: input.category || "General",
    language: input.language || "en",
    is_public: input.is_public,
    cover_image:
      input.cover_image ||
      "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&w=800&q=80",
    play_count: 0,
    created_at: new Date().toISOString(),
    questions: input.questions.map((q, idx) => ({
      ...q,
      id: crypto.randomUUID(),
      quiz_id: quizId,
      order_index: idx,
    })),
  };

  // Only persist to storage if user is signed in! Guests play transiently without saving.
  if (userId) {
    saveLocalQuiz(newQuiz);

    try {
      await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quiz: newQuiz,
          questions: newQuiz.questions || [],
        }),
      });
      return { success: true, quiz: newQuiz };
    } catch {
      return { success: true, quiz: newQuiz };
    }
  }

  // Guests: Return in-memory quiz for immediate play, but it is not saved anywhere.
  return { success: true, quiz: newQuiz };
}

/**
 * Delete quiz
 */
export async function deleteQuiz(quizId: string): Promise<boolean> {
  deleteLocalQuiz(quizId);
  try {
    await fetch(`/api/quizzes?id=${encodeURIComponent(quizId)}`, {
      method: "DELETE",
    });
    return true;
  } catch {
    return true;
  }
}

/**
 * Increment play count for quiz
 */
export async function incrementQuizPlayCount(quizId: string): Promise<void> {
  // Update local
  const list = getLocalQuizzes();
  const target = list.find((q) => q.id === quizId);
  if (target) {
    target.play_count += 1;
    saveLocalQuiz(target);
  }

  try {
    await supabase.rpc("increment_quiz_plays", { target_quiz_id: quizId });
  } catch {
    // Ignore RPC failure if migration not executed
  }
}
