"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "al";

export interface AnswerOptionTranslation {
  id: string;
  shape: string;
  shapeSymbol: string;
  label: string;
  bgGradient: string;
  borderColor: string;
  glowShadow: string;
  isCorrect: boolean;
}

export interface Translations {
  nav: {
    dashboard: string;
    leaderboard: string;
    myQuizzes: string;
    playCreate: string;
    aboutUs: string;
    enterPin: string;
    hostGame: string;
    signIn: string;
    getStarted: string;
    signOut: string;
  };
  common: {
    loading: string;
    search: string;
    all: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    next: string;
    back: string;
    finish: string;
    play: string;
    create: string;
    public: string;
    private: string;
    language: string;
    english: string;
    albanian: string;
    macedonian: string;
  };
  categories: Record<string, string>;
  footer: {
    tagline: string;
    description: string;
    platform: string;
    publicQuizzes: string;
    aiQuizGenerator: string;
    myLibraryStats: string;
    about: string;
    ourMissionStory: string;
    howItWorks: string;
    copyright: string;
  };
  myQuizzes: {
    title: string;
    subtitle: string;
    guestTitle: string;
    guestDesc: string;
    signInRegister: string;
    explorePublic: string;
    createNew: string;
    totalQuizzes: string;
    publicQuizzes: string;
    privateQuizzes: string;
    totalPlays: string;
    emptyTitle: string;
    emptyDesc: string;
    createFirst: string;
  };
  hero: {
    titlePrefix: string;
    titleHighlight: string;
    subtitle: string;
    launchStudio: string;
    exploreArena: string;
    headlinePrefix: string;
    rotatingWords: Array<{ text: string; gradient: string }>;
    mainSubtitle: string;
    inputPlaceholder: string;
    uploadTooltip: string;
    generateButton: string;
    tryLabel: string;
    tryChips: string[];
    howItWorks: string;
    card: {
      questionBadge: string;
      subject: string;
      streak: string;
      multipleChoice: string;
      question: string;
      tapHint: string;
      options: AnswerOptionTranslation[];
      practiceRound: string;
      score: string;
      pointsCelebration: string;
    };
  };
  dashboard: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    filterAll: string;
    filterOfficial: string;
    filterCommunity: string;
    createNew: string;
    questionsCount: string;
    playCount: string;
    playNow: string;
    noQuizzesFound: string;
    tryDifferentSearch: string;
  };
  quiz: {
    playMode: string;
    createMode: string;
    studioTitle: string;
    studioSubtitle: string;
    guestNotice: string;
    playArenaBtn: string;
    createStudioBtn: string;
    aiTab: string;
    manualTab: string;
    aiTitle: string;
    aiSubtitle: string;
    topicPlaceholder: string;
    selectLanguage: string;
    generateButton: string;
    generating: string;
    uploadNotes: string;
    quizTitleLabel: string;
    quizTitlePlaceholder: string;
    quizDescLabel: string;
    quizDescPlaceholder: string;
    quizCategoryLabel: string;
    addQuestion: string;
    questionTextLabel: string;
    timeLimitLabel: string;
    seconds: string;
    correctAnswer: string;
    saveQuizButton: string;
    publishTitle: string;
    publishPrompt: string;
    publishPublic: string;
    keepPrivate: string;
    gameOverTitle: string;
    finalScore: string;
    correctAnswers: string;
    playAgain: string;
    exploreMore: string;
    streak: string;
    points: string;
    timeRemaining: string;
    questionOf: string;
  };
  about: {
    titlePrefix: string;
    titleHighlight: string;
    mission: string;
    howItWorksBadge: string;
    howItWorksTitle: string;
    howItWorksSubtitle: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    readyTitle: string;
    readySubtitle: string;
    featuresTitle: string;
    featuresSubtitle: string;
    feature1Title: string;
    feature1Desc: string;
    feature2Title: string;
    feature2Desc: string;
    feature3Title: string;
    feature3Desc: string;
    demoTitle: string;
    demoSubtitle: string;
    demoStep1: string;
    demoStep2: string;
    demoStep3: string;
  };
  auth: {
    welcomeBack: string;
    createAccount: string;
    nicknameLabel: string;
    nicknamePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    loginButton: string;
    signupButton: string;
    noAccount: string;
    hasAccount: string;
  };
  leaderboard: {
    title: string;
    subtitle: string;
    allTime: string;
    weekly: string;
    today: string;
    searchPlaceholder: string;
    rankCol: string;
    playerCol: string;
    pointsCol: string;
    playedCol: string;
    createdCol: string;
    accuracyCol: string;
    streakCol: string;
    howPointsWork: string;
    howPointsDesc: string;
    correctAnswerRule: string;
    speedBonusRule: string;
    streakBonusRule: string;
    completionBonusRule: string;
    creatorBonusRule: string;
    yourRankTitle: string;
    yourRankSubtitle: string;
    signInPrompt: string;
    guestNotice: string;
    noPlayersFound: string;
    pointsLabel: string;
  };
  live: {
    title: string;
    subtitle: string;
    hostGameTitle: string;
    hostGameSubtitle: string;
    enterGameTitle: string;
    enterGameSubtitle: string;
    gamePin: string;
    nickname: string;
    nicknamePlaceholder: string;
    joinButton: string;
    createLobbyButton: string;
    startGameButton: string;
    waitingForHost: string;
    playersJoined: string;
    questionProgress: string;
    answersCount: string;
    submittedWaiting: string;
    correct: string;
    incorrect: string;
    nextQuestion: string;
    showStandings: string;
    podiumTitle: string;
    returnHome: string;
    selectQuizPrompt: string;
    noPinError: string;
    invalidPinError: string;
  };
}

const TRANSLATIONS: Record<Language, Translations> = {
  en: {
    nav: {
      dashboard: "Dashboard",
      leaderboard: "Leaderboard",
      myQuizzes: "My Quizzes",
      playCreate: "Play / Create",
      aboutUs: "About Us",
      enterPin: "Enter PIN",
      hostGame: "Host Game",
      signIn: "Sign In",
      getStarted: "Get Started",
      signOut: "Sign Out",
    },
    common: {
      loading: "Loading...",
      search: "Search...",
      all: "All",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      next: "Next",
      back: "Back",
      finish: "Finish",
      play: "Play",
      create: "Create",
      public: "Public",
      private: "Private",
      language: "Language",
      english: "English",
      albanian: "Albanian (Shqip)",
      macedonian: "Macedonian (Македонски)",
    },
    categories: {
      All: "All",
      General: "General",
      Geography: "Geography",
      Science: "Science",
      Technology: "Technology",
      History: "History",
      "Pop Culture": "Pop Culture",
    },
    footer: {
      tagline: "Turn lessons into play!",
      description: "An interactive educational quiz platform. Turn any study guide, PDF, or topic into high-energy, memorable learning games.",
      platform: "Platform",
      publicQuizzes: "Public Quizzes",
      aiQuizGenerator: "AI Quiz Generator",
      myLibraryStats: "My Library & Stats",
      about: "About",
      ourMissionStory: "Our Mission & Story",
      howItWorks: "How It Works",
      copyright: "Empowering teachers, students, and curious minds.",
    },
    myQuizzes: {
      title: "My Quizzes",
      subtitle: "Manage your personal creations, check engagement, and launch games.",
      guestTitle: "Sign In to View My Quizzes",
      guestDesc: "Your personal library is available exclusively to signed-in creators. Guest quizzes are not saved after completing games.",
      signInRegister: "Sign In / Register",
      explorePublic: "Explore Public Quizzes",
      createNew: "Create New Quiz",
      totalQuizzes: "Total Quizzes",
      publicQuizzes: "Public Quizzes",
      privateQuizzes: "Private Quizzes",
      totalPlays: "Total Plays",
      emptyTitle: "No Quizzes Created Yet",
      emptyDesc: "Build your first AI-generated or custom quiz in seconds and start challenging players!",
      createFirst: "Create Your First Quiz",
    },
    hero: {
      titlePrefix: "Gamifying Education Through ",
      titleHighlight: "Interactive Play",
      subtitle:
        "Traditional studying often feels passive and repetitive. We built Quizemia with a simple mission: Turn lessons into play! We transform study materials into high-octane, memorable quiz competitions that ignite curiosity and reward speed and accuracy.",
      launchStudio: "Launch Quiz Studio",
      exploreArena: "Explore Public Arena",
      headlinePrefix: "Learn, Challenge, & Win in ",
      rotatingWords: [
        { text: "High Energy", gradient: "from-amber-300 via-orange-400 to-red-400" },
        { text: "Lightning Speed", gradient: "from-yellow-300 via-amber-400 to-orange-500" },
        { text: "Epic Battles", gradient: "from-purple-300 via-pink-400 to-rose-400" },
        { text: "Real-Time Arena", gradient: "from-cyan-300 via-blue-400 to-indigo-400" },
        { text: "Playful Flow", gradient: "from-emerald-300 via-teal-400 to-cyan-400" },
        { text: "AI Superpowers", gradient: "from-fuchsia-300 via-purple-400 to-blue-400" },
      ],
      mainSubtitle:
        "Generate 4-option battle quizzes in seconds using AI from notes, images, or any topic. Join thousands of students and curious minds in fast-paced arena battles!",
      inputPlaceholder: "Paste notes or drop lesson image...",
      uploadTooltip: "Upload lesson notes or image (PDF, TXT, PNG)",
      generateButton: "Generate Quiz",
      tryLabel: "Try:",
      tryChips: ["Photosynthesis", "Solar System", "Roman History", "Python Code"],
      howItWorks: "How It Works",
      card: {
        questionBadge: "Q 3/10",
        subject: "🌱 Biology",
        streak: "Streak",
        multipleChoice: "MULTIPLE CHOICE • 1,000 PTS",
        question: "What is the primary product of photosynthesis?",
        tapHint: "Tap an answer below to test yourself right in the hero!",
        options: [
          {
            id: "a",
            shape: "triangle",
            shapeSymbol: "▲",
            label: "Oxygen & Glucose",
            bgGradient: "from-red-500 to-rose-600",
            borderColor: "border-red-400/60",
            glowShadow: "shadow-red-500/30",
            isCorrect: true,
          },
          {
            id: "b",
            shape: "diamond",
            shapeSymbol: "◆",
            label: "Carbon Dioxide & Water",
            bgGradient: "from-blue-500 to-indigo-600",
            borderColor: "border-blue-400/60",
            glowShadow: "shadow-blue-500/30",
            isCorrect: false,
          },
          {
            id: "c",
            shape: "circle",
            shapeSymbol: "●",
            label: "Nitrogen & Sunlight",
            bgGradient: "from-amber-400 to-amber-600",
            borderColor: "border-amber-300/60",
            glowShadow: "shadow-amber-500/30",
            isCorrect: false,
          },
          {
            id: "d",
            shape: "square",
            shapeSymbol: "■",
            label: "Hydrogen & Lipids",
            bgGradient: "from-emerald-500 to-teal-600",
            borderColor: "border-emerald-400/60",
            glowShadow: "shadow-emerald-500/30",
            isCorrect: false,
          },
        ],
        practiceRound: "Practice Round",
        score: "Score:",
        pointsCelebration: "+1,000 PTS!",
      },
    },
    dashboard: {
      title: "Discover & Compete",
      subtitle: "Explore high-energy quizzes generated by peers, educators, and multimodal AI.",
      searchPlaceholder: "Search quizzes by topic, keyword, or creator...",
      filterAll: "All Decks",
      filterOfficial: "Official",
      filterCommunity: "Community",
      createNew: "Create New Quiz",
      questionsCount: "Questions",
      playCount: "Plays",
      playNow: "Play Now",
      noQuizzesFound: "No quizzes match your search criteria.",
      tryDifferentSearch: "Try searching for a different keyword or create your own custom quiz!",
    },
    quiz: {
      playMode: "Play Arena",
      createMode: "Quiz Studio",
      studioTitle: "Quiz Creation Studio",
      studioSubtitle: "Create 4-choice interactive quizzes manually or let AI distill your notes into questions.",
      guestNotice: "Guest quizzes are not saved after playing.",
      playArenaBtn: "Play Arena",
      createStudioBtn: "Quiz Studio (Create)",
      aiTab: "AI Synthesis",
      manualTab: "Manual Creation",
      aiTitle: "Generate with Multimodal AI",
      aiSubtitle: "Paste a topic, lecture notes, or upload Word (.docx), PowerPoint (.pptx), PDF, or image files to generate questions instantly.",
      topicPlaceholder: "e.g. World War II European Theater, Photosynthesis Calvin Cycle, Quantum Computing basics...",
      selectLanguage: "Quiz Language",
      generateButton: "Generate Questions with AI",
      generating: "Synthesizing Questions with Gemini AI...",
      uploadNotes: "Upload Study Material (Word .docx, PowerPoint .pptx, PDF, or Images)",
      quizTitleLabel: "Quiz Title",
      quizTitlePlaceholder: "Give your quiz an engaging title...",
      quizDescLabel: "Quiz Description",
      quizDescPlaceholder: "Brief summary of topics covered...",
      quizCategoryLabel: "Category",
      addQuestion: "Add Another Question",
      questionTextLabel: "Question Text",
      timeLimitLabel: "Time Limit",
      seconds: "seconds",
      correctAnswer: "Correct Option",
      saveQuizButton: "Review & Save Quiz",
      publishTitle: "Quiz Publishing Options",
      publishPrompt: "Do you want to publish this quiz so anyone else can play, or keep it private?",
      publishPublic: "Publish Publicly 🌍",
      keepPrivate: "Keep Private 🔒",
      gameOverTitle: "Quiz Completed!",
      finalScore: "Final Score",
      correctAnswers: "Correct Answers",
      playAgain: "Play Again",
      exploreMore: "Explore More Quizzes",
      streak: "Streak",
      points: "Points",
      timeRemaining: "Time Left",
      questionOf: "Question",
    },
    about: {
      titlePrefix: "Gamifying Education Through ",
      titleHighlight: "Interactive Play",
      mission:
        "Traditional studying often feels passive and repetitive. We built Quizemia with a simple mission: Turn lessons into play! We transform study materials into high-octane, memorable quiz competitions that ignite curiosity and reward speed and accuracy.",
      howItWorksBadge: "Interactive Architecture",
      howItWorksTitle: "How It Works in 3 Simple Steps",
      howItWorksSubtitle: "From raw notes to an interactive live arena in under 30 seconds.",
      step1Title: "AI-Powered Question Synthesis",
      step1Desc:
        "Paste any lecture transcript, textbook notes, or upload diagrams. Our multimodal AI engine automatically structures questions, assigns distractors, and balances difficulty in seconds.",
      step2Title: "High-Energy Arena Gameplay",
      step2Desc:
        "Players battle against countdown timers using 4 tactile, color-coded choices (Red Triangle, Blue Diamond, Yellow Circle, Green Square). Speed bonuses and streak multipliers turn learning into a thrilling race.",
      step3Title: "Instant Analytics & Knowledge Retention",
      step3Desc:
        "Review answers on the celebratory podium. Creators monitor player participation, track pass rates, and pinpoint topics needing reinforcement.",
      readyTitle: "Ready to test your knowledge?",
      readySubtitle: "Explore hundreds of community quizzes or craft your own in under a minute.",
      featuresTitle: "Built for Modern Learners & Educators",
      featuresSubtitle: "Combining tactile game design with robust cloud architecture.",
      feature1Title: "Kahoot-Inspired Mechanics",
      feature1Desc: "Color-coded choices (Red, Blue, Yellow, Green) and shape anchors that help players answer with speed and spatial memory.",
      feature2Title: "Universal Accessibility",
      feature2Desc: "Designed mobile-first. No bulky app installation required—simply load the web page on any mobile browser and start playing.",
      feature3Title: "Secure Cloud Architecture",
      feature3Desc: "Backed by Supabase PostgreSQL, Row-Level Security, and instant auth for seamless public sharing and private homework sets.",
      demoTitle: "See It In Action",
      demoSubtitle: "From raw lesson notes or textbook diagrams to a live, gamified 4-option quiz arena in seconds.",
      demoStep1: "1. Upload Notes / Image",
      demoStep2: "2. AI Processing",
      demoStep3: "3. Play & Compete",
    },
    auth: {
      welcomeBack: "Welcome Back",
      createAccount: "Join Quizemia",
      nicknameLabel: "Nickname / Gamertag",
      nicknamePlaceholder: "Enter your player nickname...",
      emailLabel: "Email Address",
      emailPlaceholder: "name@example.com",
      passwordLabel: "Password",
      passwordPlaceholder: "••••••••",
      loginButton: "Sign In",
      signupButton: "Create Account",
      noAccount: "Don't have an account?",
      hasAccount: "Already have an account?",
    },
    leaderboard: {
      title: "Global Leaderboard",
      subtitle: "Race against other quiz masters, earn skill-based points, and climb to the top of the podium!",
      allTime: "All-Time",
      weekly: "This Week",
      today: "Today",
      searchPlaceholder: "Search player by nickname...",
      rankCol: "Rank",
      playerCol: "Player",
      pointsCol: "Total Points",
      playedCol: "Played",
      createdCol: "Created",
      accuracyCol: "Accuracy",
      streakCol: "Best Streak",
      howPointsWork: "How Points Are Earned",
      howPointsDesc: "Points are awarded through skill, speed, accuracy, and active community contributions:",
      correctAnswerRule: "+100 pts per correct answer",
      speedBonusRule: "Up to +50 pts speed bonus for quick answers",
      streakBonusRule: "+10 to +50 pts bonus for consecutive answers",
      completionBonusRule: "+50 to +150 pts bonus for finishing a quiz",
      creatorBonusRule: "+200 pts bonus for creating and publishing a quiz",
      yourRankTitle: "Your Standing",
      yourRankSubtitle: "Keep playing and creating to climb the ranks!",
      signInPrompt: "Sign In to Record Your Points",
      guestNotice: "You are currently playing as a guest. Sign in or create an account to save your points permanently and enter the global race!",
      noPlayersFound: "No players found matching your search.",
      pointsLabel: "pts",
    },
    live: {
      title: "Live Arena",
      subtitle: "Synchronized real-time multiplayer challenge.",
      hostGameTitle: "Host a Live Game",
      hostGameSubtitle: "Choose a quiz and display the game code for participants.",
      enterGameTitle: "Join Live Game",
      enterGameSubtitle: "Enter the 6-digit game PIN to participate.",
      gamePin: "Game PIN",
      nickname: "Your Nickname",
      nicknamePlaceholder: "Enter your display name",
      joinButton: "Join Game",
      createLobbyButton: "Launch Live Lobby",
      startGameButton: "Start Game",
      waitingForHost: "Waiting for the host to start the game...",
      playersJoined: "Participants Joined",
      questionProgress: "Question",
      answersCount: "Answers received",
      submittedWaiting: "Answer recorded. Waiting for round completion.",
      correct: "Correct Answer",
      incorrect: "Incorrect",
      nextQuestion: "Next Question",
      showStandings: "View Round Standings",
      podiumTitle: "Final Standings",
      returnHome: "Return to Arena",
      selectQuizPrompt: "Select a quiz to host:",
      noPinError: "Please enter a valid PIN.",
      invalidPinError: "Game room not found or session ended.",
    },
  },
  al: {
    nav: {
      dashboard: "Paneli",
      leaderboard: "Renditja",
      myQuizzes: "Kuizet e Mia",
      playCreate: "Luaj / Krijo",
      aboutUs: "Rreth Nesh",
      enterPin: "Shkruaj PIN",
      hostGame: "Krijo Lojë",
      signIn: "Hyr",
      getStarted: "Fillo Tani",
      signOut: "Dil",
    },
    common: {
      loading: "Po ngarkohet...",
      search: "Kërko...",
      all: "Të gjitha",
      save: "Ruaj",
      cancel: "Anulo",
      delete: "Fshij",
      edit: "Ndrysho",
      next: "Tjetra",
      back: "Kthehu",
      finish: "Përfundo",
      play: "Luaj",
      create: "Krijo",
      public: "Publik",
      private: "Privat",
      language: "Gjuha",
      english: "Anglisht (English)",
      albanian: "Shqip (Albanian)",
      macedonian: "Maqedonisht (Македонски)",
    },
    categories: {
      All: "Të Gjitha",
      General: "Të Përgjithshme",
      Geography: "Gjeografi",
      Science: "Shkencë",
      Technology: "Teknologji",
      History: "Histori",
      "Pop Culture": "Kulturë Popullore",
    },
    footer: {
      tagline: "Kthejini mësimet në lojë!",
      description: "Platformë edukative dhe interaktive kuizesh. Ktheni çdo guidë studimi, PDF ose temë në lojëra mësimore plot energji e të paharrueshme.",
      platform: "Platforma",
      publicQuizzes: "Kuize Publike",
      aiQuizGenerator: "Gjenerues Kuizesh me AI",
      myLibraryStats: "Biblioteka & Statistikat e Mia",
      about: "Rreth Nesh",
      ourMissionStory: "Misioni & Historia Jonë",
      howItWorks: "Si Funksionon",
      copyright: "Fuqizojmë mësuesit, nxënësit dhe mendjet kurioze.",
    },
    myQuizzes: {
      title: "Kuizet e Mia",
      subtitle: "Menaxhoni krijimet tuaja, kontrolloni angazhimin dhe nisni lojëra.",
      guestTitle: "Kyçuni për të Parë Kuizet e Mia",
      guestDesc: "Biblioteka juaj personale është e disponueshme vetëm për krijuesit e regjistruar. Kuizet e vizitorëve nuk ruhen pas përfundimit të lojërave.",
      signInRegister: "Hyni / Regjistrohuni",
      explorePublic: "Eksploroni Kuizet Publike",
      createNew: "Krijo Kuiz të Ri",
      totalQuizzes: "Totali i Kuizeve",
      publicQuizzes: "Kuize Publike",
      privateQuizzes: "Kuize Private",
      totalPlays: "Totali i Lojërave",
      emptyTitle: "Ende nuk keni krijuar kuize",
      emptyDesc: "Krijoni kuizin tuaj të parë me AI ose manualisht në pak sekonda dhe filloni të sfidoni lojtarët!",
      createFirst: "Krijoni Kuizin Tuaj të Parë",
    },
    hero: {
      titlePrefix: "Lojëzimi i Edukimit Përmes ",
      titleHighlight: "Lojës Interaktive",
      subtitle:
        "Studimi tradicional shpesh duket pasiv dhe i përsëritur. Ne e krijuam Quizemia me një mision të thjeshtë: Kthe mësimet në lojë! Ne i shndërrojmë materialet e studimit në gara kuizi me energji të lartë dhe të paharrueshme, që nxisin kureshtjen dhe shpërblejnë shpejtësinë dhe saktësinë.",
      launchStudio: "Fillo Studion e Kuizeve",
      exploreArena: "Eksploro Arenën Publike",
      headlinePrefix: "Mëso, Sfidohu & Fito në ",
      rotatingWords: [
        { text: "Energji e Lartë", gradient: "from-amber-300 via-orange-400 to-red-400" },
        { text: "Shpejtësi Rrufe", gradient: "from-yellow-300 via-amber-400 to-orange-500" },
        { text: "Beteja Epike", gradient: "from-purple-300 via-pink-400 to-rose-400" },
        { text: "Arenë në Kohë Reale", gradient: "from-cyan-300 via-blue-400 to-indigo-400" },
        { text: "Rrjedhë Argëtuese", gradient: "from-emerald-300 via-teal-400 to-cyan-400" },
        { text: "Superfuqi me AI", gradient: "from-fuchsia-300 via-purple-400 to-blue-400" },
      ],
      mainSubtitle:
        "Gjeneroni kuize beteje me 4 opsione në pak sekonda duke përdorur AI nga shënimet, imazhet ose çdo temë. Bashkohuni me mijëra nxënës e mendje kurioze në beteja me ritëm të shpejtë!",
      inputPlaceholder: "Ngjitni shënime ose ngarkoni foto të librit...",
      uploadTooltip: "Ngarkoni shënime mësimi ose foto (PDF, TXT, PNG)",
      generateButton: "Gjenero Kuiz ✨",
      tryLabel: "Provo:",
      tryChips: ["🧬 Fotosinteza", "🪐 Sistemi Diellor", "🏛️ Historia Romake", "⚡ Kod Python"],
      howItWorks: "Si Funksionon",
      card: {
        questionBadge: "P 3/10",
        subject: "🌱 Biologji",
        streak: "Seri",
        multipleChoice: "ME ZGJEDHJE • 1,000 PIKË",
        question: "Cili është produkti kryesor i fotosintezës?",
        tapHint: "Kliko një përgjigje më poshtë për të testuar veten menjëherë në krye!",
        options: [
          {
            id: "a",
            shape: "triangle",
            shapeSymbol: "▲",
            label: "Oksigjen & Glukozë",
            bgGradient: "from-red-500 to-rose-600",
            borderColor: "border-red-400/60",
            glowShadow: "shadow-red-500/30",
            isCorrect: true,
          },
          {
            id: "b",
            shape: "diamond",
            shapeSymbol: "◆",
            label: "Dioksid Karboni & Ujë",
            bgGradient: "from-blue-500 to-indigo-600",
            borderColor: "border-blue-400/60",
            glowShadow: "shadow-blue-500/30",
            isCorrect: false,
          },
          {
            id: "c",
            shape: "circle",
            shapeSymbol: "●",
            label: "Azot & Dritë Dielli",
            bgGradient: "from-amber-400 to-amber-600",
            borderColor: "border-amber-300/60",
            glowShadow: "shadow-amber-500/30",
            isCorrect: false,
          },
          {
            id: "d",
            shape: "square",
            shapeSymbol: "■",
            label: "Hidrogjen & Lipide",
            bgGradient: "from-emerald-500 to-teal-600",
            borderColor: "border-emerald-400/60",
            glowShadow: "shadow-emerald-500/30",
            isCorrect: false,
          },
        ],
        practiceRound: "Raund Praktike",
        score: "Pikët:",
        pointsCelebration: "+1,000 PIKË!",
      },
    },
    dashboard: {
      title: "Zbulo & Garoj",
      subtitle: "Eksploro kuize plot energji të krijuara nga bashkëmoshatarët, edukatorët dhe inteligjenca artificiale.",
      searchPlaceholder: "Kërko kuize sipas temës, fjalës kyçe ose krijuesit...",
      filterAll: "Të Gjitha",
      filterOfficial: "Zyrtare",
      filterCommunity: "Komuniteti",
      createNew: "Krijo Kuiz të Ri",
      questionsCount: "Pyetje",
      playCount: "Lojëra",
      playNow: "Luaj Tani",
      noQuizzesFound: "Nuk u gjet asnjë kuiz me këtë kërkim.",
      tryDifferentSearch: "Provo të kërkosh një fjalë tjetër ose krijo kuizin tënd të personalizuar!",
    },
    quiz: {
      playMode: "Arena e Lojës",
      createMode: "Studioja e Kuizit",
      studioTitle: "Studio e Krijimit të Kuizeve",
      studioSubtitle: "Krijoni kuize interaktive me 4 opsione manualisht ose lini AI të nxjerrë pyetje nga shënimet tuaja.",
      guestNotice: "Kuizet e vizitorëve nuk ruhen pas përfundimit të lojës.",
      playArenaBtn: "Arena e Lojës",
      createStudioBtn: "Studio e Kuizeve (Krijo)",
      aiTab: "Sinteza me AI",
      manualTab: "Krijim Manual",
      aiTitle: "Gjenero me Inteligjencë Artificiale",
      aiSubtitle: "Vendos një temë, shënime leksioni ose ngarko skedarë Word (.docx), PowerPoint (.pptx), PDF, ose foto për të gjeneruar pyetje menjëherë.",
      topicPlaceholder: "p.sh. Lufta e Dytë Botërore, Fotosinteza, Cikli i Kalvinit, Bazat e Llogaritjes Kuantike...",
      selectLanguage: "Gjuha e Kuizit",
      generateButton: "Gjenero Pyetje me AI",
      generating: "Po sintetizohen pyetjet me Gemini AI...",
      uploadNotes: "Ngarko Materiale Studimi (Word .docx, PowerPoint .pptx, PDF, ose Foto)",
      quizTitleLabel: "Titulli i Kuizit",
      quizTitlePlaceholder: "Vendos një titull tërheqës për kuizin tënd...",
      quizDescLabel: "Përshkrimi i Kuizit",
      quizDescPlaceholder: "Përmbledhje e shkurtër e temave të përfshira...",
      quizCategoryLabel: "Kategoria",
      addQuestion: "Shto një Pyetje Tjetër",
      questionTextLabel: "Teksti i Pyetjes",
      timeLimitLabel: "Koha Limite",
      seconds: "sekonda",
      correctAnswer: "Opsioni i Saktë",
      saveQuizButton: "Rishiko & Ruaj Kuizin",
      publishTitle: "Opsionet e Publikimit të Kuizit",
      publishPrompt: "Dëshiron ta publikosh këtë kuiz që të mund të luajë çdokush, apo ta mbash privat?",
      publishPublic: "Publiko Publikisht 🌍",
      keepPrivate: "Mbaj Privat 🔒",
      gameOverTitle: "Kuizi Përfundoi!",
      finalScore: "Pikët Përfundimtare",
      correctAnswers: "Përgjigje të Sakta",
      playAgain: "Luaj Përsëri",
      exploreMore: "Eksploro Kuize të Tjera",
      streak: "Seria",
      points: "Pikët",
      timeRemaining: "Koha e Mbetur",
      questionOf: "Pyetja",
    },
    about: {
      titlePrefix: "Lojëzimi i Edukimit Përmes ",
      titleHighlight: "Lojës Interaktive",
      mission:
        "Studimi tradicional shpesh duket pasiv dhe i përsëritur. Ne e krijuam Quizemia me një mision të thjeshtë: Kthe mësimet në lojë! Ne i shndërrojmë materialet e studimit në gara kuizi me energji të lartë dhe të paharrueshme, që nxisin kureshtjen dhe shpërblejnë shpejtësinë dhe saktësinë.",
      howItWorksBadge: "Arkitekturë Interaktive",
      howItWorksTitle: "Si Funksionon në 3 Hapa të Thjeshtë",
      howItWorksSubtitle: "Nga shënimet e papërpunuara te arena live interaktive në më pak se 30 sekonda.",
      step1Title: "Sintezë Pyetjesh me Fuqinë e AI",
      step1Desc:
        "Ngjit çdo transkript leksioni, shënime teksti ose ngarko diagrame. Motori ynë AI multimodal strukturon automatikisht pyetjet, cakton opsionet mashtruese dhe balancon vështirësinë brenda pak sekondash.",
      step2Title: "Lojë me Energji të Lartë në Arenë",
      step2Desc:
        "Lojtarët garojnë kundër kohës duke përdorur 4 zgjedhje me ngjyra dhe simbole (Trekëndësh i Kuq, Romb i Kaltër, Rreth i Verdhë, Katror i Gjelbër). Bonusët e shpejtësisë dhe shumëzuesit e serisë e kthejnë mësimin në një garë emocionuese.",
      step3Title: "Analitikë e Menjëhershme & Mbajtje e Dijes",
      step3Desc:
        "Rishiko përgjigjet në podiumin festiv. Krijuesit monitorojnë pjesëmarrjen e lojtarëve, shkallën e suksesit dhe identifikojnë temat që kërkojnë përforcim.",
      readyTitle: "Gati për të testuar njohuritë e tua?",
      readySubtitle: "Eksploro qindra kuize të komunitetit ose krijo kuizin tënd brenda një minute.",
      featuresTitle: "Ndërtuar për Nxënës & Edukatorë Modernë",
      featuresSubtitle: "Kombinimi i dizajnit taktil të lojërave me arkitekturë të fuqishme në re (cloud).",
      feature1Title: "Mekanika të Frymëzuara nga Kahoot",
      feature1Desc: "Opsione me ngjyra të dallueshme (E Kuqe, E Kaltër, E Verdhë, E Gjelbër) dhe forma që ndihmojnë lojtarët të përgjigjen me shpejtësi dhe memorie hapësinore.",
      feature2Title: "Qasje Universale",
      feature2Desc: "Projektuar posaçërisht për pajisje mobile. Nuk kërkohet instalim aplikacionesh të rënda—thjesht hapni shfletuesin në çdo celular dhe filloni lojën.",
      feature3Title: "Arkitekturë e Sigurt në Re",
      feature3Desc: "Mbështetur nga Supabase PostgreSQL, Siguri në Nivel Rreshti (RLS) dhe identifikim i menjëhershëm për ndarje publike ose detyra private.",
      demoTitle: "Shiheni në Veprim",
      demoSubtitle: "Nga shënimet e papërpunuara ose diagramet te një arenë kuizi me 4 opsione në pak sekonda.",
      demoStep1: "1. Ngarko Shënime / Foto",
      demoStep2: "2. Përpunim me AI",
      demoStep3: "3. Luaj & Garoj",
    },
    auth: {
      welcomeBack: "Mirë se u ktheve",
      createAccount: "Bashkohu me Quizemia",
      nicknameLabel: "Nofka / Pseudonimi",
      nicknamePlaceholder: "Vendos nofkën tënde të lojtarit...",
      emailLabel: "Adresa e Email-it",
      emailPlaceholder: "emri@shembull.com",
      passwordLabel: "Fjalëkalimi",
      passwordPlaceholder: "••••••••",
      loginButton: "Hyr",
      signupButton: "Krijo Llogari",
      noAccount: "Nuk ke një llogari?",
      hasAccount: "Ke tashmë një llogari?",
    },
    leaderboard: {
      title: "Tabela e Renditjes Globale",
      subtitle: "Garoni kundër mjeshtërve të tjerë të kuizeve, fitoni pikë reale dhe ngjituni në majë të podiumit!",
      allTime: "Gjithë Kohës",
      weekly: "Këtë Javë",
      today: "Sot",
      searchPlaceholder: "Kërko lojtarin sipas emrit...",
      rankCol: "Renditja",
      playerCol: "Lojtari",
      pointsCol: "Pikët Totale",
      playedCol: "Luajtur",
      createdCol: "Krijuar",
      accuracyCol: "Saktësia",
      streakCol: "Seria më e Mirë",
      howPointsWork: "Si Fitohen Pikët",
      howPointsDesc: "Pikët fitohen përmes shkathtësisë, shpejtësisë, saktësisë dhe kontributeve në komunitet:",
      correctAnswerRule: "+100 pikë për çdo përgjigje të saktë",
      speedBonusRule: "Deri në +50 pikë bonus shpejtësie për përgjigje të shpejta",
      streakBonusRule: "+10 deri +50 pikë bonus për seri përgjigjesh të sakta radhazi",
      completionBonusRule: "+50 deri +150 pikë bonus për përfundimin me sukses të kuizit",
      creatorBonusRule: "+200 pikë bonus për krijimin dhe publikimin e një kuizi",
      yourRankTitle: "Pozicioni Juaj",
      yourRankSubtitle: "Vazhdoni të luani dhe të krijoni për t'u ngjitur në renditje!",
      signInPrompt: "Hyni për të Regjistruar Pikët Tuaja",
      guestNotice: "Aktualisht po luani si mysafir. Hyni ose krijoni një llogari për të ruajtur pikët dhe për t'u bërë pjesë e garës globale!",
      noPlayersFound: "Nuk u gjet asnjë lojtar me këtë emër.",
      pointsLabel: "pikë",
    },
    live: {
      title: "Arena e Drejtpërdrejtë",
      subtitle: "Sfidë e sinkronizuar në kohë reale me shumë lojtarë.",
      hostGameTitle: "Fillo një Lojë Live",
      hostGameSubtitle: "Zgjidhni një kuiz dhe shfaqni kodin e lojës për pjesëmarrësit.",
      enterGameTitle: "Bashkohu në Lojë Live",
      enterGameSubtitle: "Shkruani PIN-in 6-shifror për të marrë pjesë.",
      gamePin: "PIN-i i Lojës",
      nickname: "Pseudonimi Juaj",
      nicknamePlaceholder: "Shkruani emrin tuaj",
      joinButton: "Bashkohu në Lojë",
      createLobbyButton: "Fillo Hollin Live",
      startGameButton: "Fillo Lojën",
      waitingForHost: "Duke pritur organizatorin të nisë lojën...",
      playersJoined: "Pjesëmarrës të Bashkuar",
      questionProgress: "Pyetja",
      answersCount: "Përgjigje të pranuara",
      submittedWaiting: "Përgjigja u regjistrua. Duke pritur përfundimin e raundit.",
      correct: "Përgjigje e Saktë",
      incorrect: "E Pasaktë",
      nextQuestion: "Pyetja e Radhës",
      showStandings: "Shiko Renditjen e Raundit",
      podiumTitle: "Renditja Përfundimtare",
      returnHome: "Kthehu në Arenë",
      selectQuizPrompt: "Zgjidhni një kuiz për të organizuar:",
      noPinError: "Ju lutem shkruani një PIN të vlefshëm.",
      invalidPinError: "Dhoma e lojës nuk u gjet ose seanca ka përfunduar.",
    },
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => { },
  t: TRANSLATIONS.en,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem("quizemia_lang") as Language | null;
      if (savedLang === "en" || savedLang === "al") {
        setLanguageState(savedLang);
        document.documentElement.lang = savedLang === "al" ? "sq" : "en";
      }
    } catch {
      // ignore
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("quizemia_lang", lang);
      document.documentElement.lang = lang === "al" ? "sq" : "en";
    } catch {
      // ignore
    }
  };

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
