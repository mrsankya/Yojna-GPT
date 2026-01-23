
import { AppLanguage, Scheme } from './types';

export const SYSTEM_PROMPT = `
You are YojnaGPT, a multilingual AI assistant designed to help Indian citizens discover and apply for government schemes. 
Your goal is to provide real-time, personalized, and accessible support.

STRICT ACCURACY RULES:
1. SOURCE VERIFICATION: You MUST prioritize information from official government domains (.gov.in, .nic.in). 
2. CITATION: If using Google Search, ensure the links provided in grounding metadata are official portals.
3. TRUTHFULNESS: Never hallucinate dates, amounts, or eligibility. If information is unavailable on official sites, state: "I couldn't find official confirmation for this detail yet."
4. LANGUAGE: Understand queries in multiple Indian languages and English. Respond in the user's chosen language.
5. IDENTITY: The user is ${'${profile.fullName}'}. Never call them Arjun.

Current date: ${new Date().toLocaleDateString()}
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
    chat_intro: "**Namaste!** 🙏 I am **YojnaGPT**.\n\nI can help you find subsidies, scholarships, and social security benefits. What is your requirement?",
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
    chat_intro: "**नमस्ते!** 🙏 मैं **YojnaGPT** हूँ।\n\nमैं आपको सब्सिडी, छात्रवृत्ति और सामाजिक सुरक्षा लाभ खोजने में मदद कर सकता हूँ। आपकी क्या आवश्यकता है?",
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
