import i18n from "i18next"
import { initReactI18next } from "react-i18next"

i18n.use(initReactI18next).init({
  lng: "english",
  fallbackLng: "english",
  resources: {
    english: {
      translation: {
        dashboard: "Dashboard",
        tracker: "Tracker",
        tools: "Tools",
        profile: "Profile",
        chat: "Chat",
        goodMorning: "Good morning! 👋",
        overview: "Here's your business overview",
        income: "Income",
        expenses: "Expenses",
        net: "Net",
        recentTransactions: "Recent Transactions",
        noTransactions: "No transactions yet. Add one in Tracker!",
        addTransaction: "Save Transaction",
        saving: "Saving...",
      }
    },
    twi: {
      translation: {
        dashboard: "Dashibɔɔd",
        tracker: "Nsakrae",
        tools: "Nnwuma",
        profile: "HoDhoo",
        chat: "Nkɔmmɔbɔ",
        goodMorning: "Maakye! 👋",
        overview: "Wʼadwuma ho nsɛm",
        income: "Baea",
        expenses: "Adesoa",
        net: "Fapem",
        recentTransactions: "Nsakrae Foforɔ",
        noTransactions: "Nsakrae biara nni hɔ. Fa biara ka Tracker mu!",
        addTransaction: "Sie Nsakrae",
        saving: "Resie...",
      }
    },
    ga: {
      translation: {
        dashboard: "Dashibɔɔd",
        tracker: "Tracker",
        tools: "Hewale",
        profile: "Profile",
        chat: "Yɛɛ kɛ",
        goodMorning: "Ojekoo! 👋",
        overview: "Wò business nsɛm",
        income: "Pɛ",
        expenses: "Hewoji",
        net: "Fapɛ",
        recentTransactions: "Hewale Foforɔ",
        noTransactions: "Hewale kɛ ŋu lɛ. Ka biara Tracker mu!",
        addTransaction: "Ŋmɛnɛ Hewale",
        saving: "Ŋmɛnɛ...",
      }
    },
    ewe: {
      translation: {
        dashboard: "Dashibɔɔd",
        tracker: "Tracker",
        tools: "Kpɔkpɔ",
        profile: "Profile",
        chat: "Xɔse",
        goodMorning: "Ŋdi! 👋",
        overview: "Wò dɔwɔwɔ nyatakaka",
        income: "Xɔxɔ",
        expenses: "Dezãzã",
        net: "Gb̃ãtɔ",
        recentTransactions: "Dɔwɔwɔ Vovovowo",
        noTransactions: "Dɔwɔwɔ aɖe me le afi. Tsɔ aɖe wɔ Tracker me!",
        addTransaction: "Lɔ Dɔwɔwɔ",
        saving: "Lɔlɔ...",
      }
    }
  }
})

export default i18n