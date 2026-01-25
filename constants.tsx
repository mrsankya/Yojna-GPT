
import { AppLanguage, Scheme } from './types';

export const SYSTEM_PROMPT = `
You are YojnaGPT, a specialized multilingual AI assistant for Indian Government Schemes. 

CONVERSATIONAL RULES:
1. **Handle Greetings Naturally**: If the user says "Hi", "Hello", "Namaste", or similar greetings, DO NOT dump a list of schemes. Respond warmly, acknowledge their name (from context), and ask how you can assist them with government schemes today.
2. **Contextual Relevance**: Only provide detailed scheme information when the user explicitly asks for help finding schemes, asks about a specific scheme, or asks "what am I eligible for?".
3. **Identity**: Your name is YojnaGPT. You help Indian citizens navigate welfare programs.

CORE MISSION (When requested):
Provide comprehensive, structured, and actionable information about welfare schemes. 
When discussing a scheme, you MUST extract and present:
1. **Benefits**: Clear bullet points of exactly what the citizen receives.
2. **Eligibility**: Specific criteria including age, income limits, category, and state.
3. **Documents Required**: A definitive checklist of necessary paperwork.
4. **Application Process**: A simple step-by-step guide.
5. **Official Links**: Provide verified .gov.in or .nic.in URLs.
6. **Video Tutorial**: Provide a YouTube link for "How to apply for [scheme name]".

STRICT ACCURACY RULES:
1. SOURCE VERIFICATION: Prioritize official government domains.
2. CITATION: Use grounding metadata for links.
3. FORMATTING: Use Markdown (bolding, headers) for readability.
4. LANGUAGE: Respond natively in the user's chosen language.

If information is missing, say: "Official confirmation for [specific detail] is currently being updated on the portal."
`;

export const INDIAN_LANGUAGES = Object.values(AppLanguage);

export const THEME_COLORS = {
  primary: 'rgb(255, 103, 31)', // Saffron
  secondary: 'rgb(4, 107, 0)', // Green
  accent: 'rgb(0, 0, 128)', // Navy Blue
};

export const STATIC_SCHEMES: Partial<Scheme>[] = [
  {
    name: "PM-Kisan Samman Nidhi",
    provider: "Central Government",
    description: "An initiative by the government of India in which all farmers will get up to ₹6,000 per year as minimum income support.",
    benefits: ["₹6,000 annual income support", "Direct Benefit Transfer (DBT)"],
    documents: ["Aadhaar Card", "Land Holding Documents", "Bank Account Details"],
    applyLink: "https://pmkisan.gov.in/",
    tags: ["Agriculture", "Direct Support"]
  },
  {
    name: "Ayushman Bharat (PM-JAY)",
    provider: "Central Government",
    description: "The world's largest health insurance scheme, providing a health cover of ₹5 lakhs per family per year for secondary and tertiary care hospitalization.",
    benefits: ["₹5 Lakh health coverage", "Cashless treatment in empaneled hospitals"],
    documents: ["Aadhaar Card", "Ration Card", "PM Letter (if available)"],
    applyLink: "https://pmjay.gov.in/",
    tags: ["Healthcare", "Insurance"]
  }
];

export const UI_STRINGS: Record<string, any> = {
  [AppLanguage.ENGLISH]: {
    nav_chat: "AI Smart Assistant",
    nav_discovery: "Scheme Pulse",
    nav_profile: "Citizen Profile",
    nav_admin: "Admin Control",
    nav_header: "Command Menu",
    lang_label: "Language",
    btn_compare: "Compare Schemes",
    eligibility_header: "Quick Eligibility",
    label_occupation: "Occupation",
    label_income: "Income Level (Annual)",
    label_disability: "Disability (Divyangjan)",
    chat_placeholder: "Ask about a scheme...",
    chat_intro: "**Namaste!** 🙏 I am **YojnaGPT**.\n\nI can help you find subsidies, scholarships, and social security benefits. How can I help you today?",
    profile_details: "Personal Details",
    profile_docs: "My Verified Docs",
    profile_points: "Citizen Trust Score",
    profile_saved: "My Watchlist",
    discovery_live: "Real-time Feed",
    discovery_docs: "Mandatory Documents",
    discovery_official: "Official Website",
    admin_queries: "Global Inquiries",
    admin_success: "Matched Citizens"
  },
  [AppLanguage.HINDI]: {
    nav_chat: "AI स्मार्ट सहायक",
    nav_discovery: "योजना पल्स",
    nav_profile: "नागरिक प्रोफाइल",
    nav_admin: "एडमिन कंट्रोल",
    nav_header: "कमांड मेनू",
    lang_label: "भाषा",
    btn_compare: "योजनाओं की तुलना करें",
    eligibility_header: "त्वरित पात्रता",
    label_occupation: "व्यवसाय",
    label_income: "आय स्तर (वार्षिक)",
    label_disability: "विकलांगता (दिव्यांगजन)",
    chat_placeholder: "किसी योजना के बारे में पूछें...",
    chat_intro: "**नमस्ते!** 🙏 मैं **YojnaGPT** हूँ।\n\nमैं आपको सब्सिडी, छात्रवृत्ति और सामाजिक सुरक्षा लाभ खोजने में मदद कर सकता हूँ। आज मैं आपकी क्या मदद कर सकता हूँ?",
    profile_details: "व्यक्तिगत विवरण",
    profile_docs: "सत्यापित दस्तावेज़",
    profile_points: "नागरिक ट्रस्ट स्कोर",
    profile_saved: "मेरी वॉचलिस्ट",
    discovery_live: "लाइव फीड",
    discovery_docs: "अनिवार्य दस्तावेज़",
    discovery_official: "आधिकारिक वेबसाइट",
    admin_queries: "वैश्विक पूछताछ",
    admin_success: "सफल मिलान"
  }
};

export const t = (key: string, lang: string) => {
  return UI_STRINGS[lang]?.[key] || UI_STRINGS[AppLanguage.ENGLISH][key] || key;
};
