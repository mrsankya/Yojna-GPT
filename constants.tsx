
import { AppLanguage, Scheme } from './types';

export const SYSTEM_PROMPT = `
You are YojnaGPT, a multilingual AI assistant designed to help Indian citizens discover and apply for government schemes. 
Your goal is to provide real-time, personalized, and accessible support.

STRICT RULES:
1. Understand queries in multiple Indian languages.
2. Identify user intent and extract details: Age, Gender, Occupation, Income, Category (SC/ST/OBC), Location (State/District), Education, Disability, Employment.
3. Match profiles with relevant central and state schemes using search grounding for real-time accuracy.
4. Explain eligibility clearly.
5. Guide users through the application process (Documents, How to apply, Deadlines).
6. Be friendly and use emojis (✅, 📄, 🔗, ❌).
7. Respond in the SAME LANGUAGE the user uses.
8. If user is frustrated, offer to escalate or use a more empathetic tone.
9. Support checking eligibility for family members.
10. Summarize findings clearly.

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
  },
  {
    name: "Pradhan Mantri Awas Yojana (PMAY)",
    provider: "Central Government",
    description: "Housing for All initiative aiming to provide affordable housing for the urban and rural poor.",
    benefits: ["Subsidized interest rates on home loans", "Financial assistance for construction"],
    documents: ["Income Certificate", "Identity Proof", "Address Proof"],
    applyLink: "https://pmaymis.gov.in/",
    tags: ["Housing", "Infrastructure"]
  },
  {
    name: "Sukanya Samriddhi Yojana",
    provider: "Central Government",
    description: "A small deposit scheme for the girl child as part of the 'Beti Bachao Beti Padhao' campaign.",
    benefits: ["High interest rate", "Tax benefits under 80C", "Long-term savings for education/marriage"],
    documents: ["Birth Certificate of Girl Child", "Identity Proof of Parents"],
    applyLink: "https://www.indiapost.gov.in/",
    tags: ["Savings", "Girl Child Education"]
  }
];

export const UI_STRINGS: Record<string, any> = {
  [AppLanguage.ENGLISH]: {
    nav_chat: "GPT Chat",
    nav_discovery: "Discovery Hub",
    nav_profile: "My Profile",
    nav_admin: "Admin Panel",
    nav_header: "Navigation",
    lang_label: "Language",
    btn_compare: "Compare Schemes",
    eligibility_header: "Quick Eligibility",
    label_occupation: "Occupation",
    label_income: "Income Level (Annual)",
    label_disability: "Disability (Divyangjan)",
    chat_placeholder: "Ask YojnaGPT...",
    chat_intro: "**Namaste!** 🙏 I am **YojnaGPT**.\n\nHow can I help you today?",
    profile_details: "Personal Details",
    profile_docs: "Saved Documents",
    profile_points: "Citizen Points",
    profile_saved: "Saved Schemes",
    discovery_live: "Live Feed",
    discovery_docs: "Required Documents",
    discovery_official: "View Official Portal",
    admin_queries: "Total Queries",
    admin_success: "Successful Matches"
  },
  [AppLanguage.HINDI]: {
    nav_chat: "GPT चैट",
    nav_discovery: "खोज हब",
    nav_profile: "मेरी प्रोफाइल",
    nav_admin: "एडमिन पैनल",
    nav_header: "नेविगेशन",
    lang_label: "भाषा",
    btn_compare: "योजनाओं की तुलना करें",
    eligibility_header: "त्वरित पात्रता",
    label_occupation: "व्यवसाय",
    label_income: "आय स्तर (वार्षिक)",
    label_disability: "विकलांगता (दिव्यांगजन)",
    chat_placeholder: "YojnaGPT से पूछें...",
    chat_intro: "**नमस्ते!** 🙏 मैं **YojnaGPT** हूँ।\n\nआज मैं आपकी कैसे मदद कर सकता हूँ?",
    profile_details: "व्यक्तिगत विवरण",
    profile_docs: "सहेजे गए दस्तावेज़",
    profile_points: "नागरिक अंक",
    profile_saved: "सहेजी गई योजनाएं",
    discovery_live: "लाइव फीड",
    discovery_docs: "आवश्यक दस्तावेज़",
    discovery_official: "आधिकारिक पोर्टल देखें",
    admin_queries: "कुल प्रश्न",
    admin_success: "सफल मिलान"
  },
  [AppLanguage.MARATHI]: {
    nav_chat: "GPT चॅट",
    nav_discovery: "डिस्कवरी हब",
    nav_profile: "माझी प्रोफाइल",
    nav_admin: "अ‍ॅडमिन पॅनेल",
    nav_header: "नेव्हिगेशन",
    lang_label: "भाषा",
    btn_compare: "योजनांची तुलना करा",
    eligibility_header: "त्वरीत पात्रता",
    label_occupation: "व्यवसाय",
    label_income: "उत्पन्न पातळी (वार्षिक)",
    label_disability: "अपंगत्व (दिव्यांगजन)",
    chat_placeholder: "YojnaGPT ला विचारा...",
    chat_intro: "**नमस्ते!** 🙏 मी **YojnaGPT** आहे.\n\nआज मी तुम्हाला कशी मदत करू शकतो?",
    profile_details: "वैयक्तिक तपशील",
    profile_docs: "जतन केलेली कागदपत्रे",
    profile_points: "नागरिक गुण",
    profile_saved: "जतन केलेल्या योजना",
    discovery_live: "लाइव्ह फीड",
    discovery_docs: "आवश्यक कागदपत्रे",
    discovery_official: "अधिकृत पोर्टल पहा",
    admin_queries: "एकूण प्रश्न",
    admin_success: "यशस्वी जुळण्या"
  }
};

export const t = (key: string, lang: string) => {
  return UI_STRINGS[lang]?.[key] || UI_STRINGS[AppLanguage.ENGLISH][key] || key;
};
