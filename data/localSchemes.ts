
export const localData = {
  "schemes": [
    {
      "id": "pm-kisan",
      "category": "Agriculture",
      "provider": "Central Government",
      "names": { "English": "PM-Kisan Samman Nidhi", "Hindi": "पीएम-किसान सम्मान निधि", "Marathi": "पीएम-किसान सन्मान निधी" },
      "descriptions": { "English": "Income support of ₹6000/year to all landholding farmers' families.", "Hindi": "सभी भूमिधारक किसान परिवारों को ₹6000/वर्ष की आय सहायता।", "Marathi": "सर्व जमीनधारक शेतकरी कुटुंबांना ₹६०००/वर्ष उत्पन्न समर्थन." },
      "benefits": ["₹6000 per year in 3 installments", "Direct bank transfer"],
      "eligibility": ["Small and marginal farmers", "Indian citizenship", "Land ownership records"],
      "documents": ["Aadhaar Card", "Land papers", "Bank Account"],
      "applyLink": "https://pmkisan.gov.in/"
    },
    {
      "id": "pm-jay",
      "category": "Healthcare",
      "provider": "Central Government",
      "names": { "English": "Ayushman Bharat (PM-JAY)", "Hindi": "आयुष्मान भारत (पीएम-जय)", "Marathi": "आयुष्मान भारत (पीएम-जय)" },
      "descriptions": { "English": "Health cover of ₹5 lakhs per family per year for secondary and tertiary care.", "Hindi": "माध्यमिक और तृतीयक देखभाल के लिए प्रति परिवार प्रति वर्ष ₹5 लाख का स्वास्थ्य कवर।", "Marathi": "दुय्यम आणि तृतीयक काळजीसाठी प्रति कुटुंब प्रति वर्ष ₹५ लाख आरोग्य विमा." },
      "benefits": ["Cashless hospitalization", "₹5 Lakh annual coverage"],
      "eligibility": ["SECC 2011 listed families", "Low income groups"],
      "documents": ["Aadhaar Card", "Ration Card"],
      "applyLink": "https://pmjay.gov.in/"
    },
    {
      "id": "pmay-u",
      "category": "Housing",
      "provider": "Central Government",
      "names": { "English": "PMAY-Urban", "Hindi": "पीएम आवास योजना (शहरी)", "Marathi": "पीएम आवास योजना (शहरी)" },
      "descriptions": { "English": "Affordable housing for urban poor with interest subsidies.", "Hindi": "ब्याज सब्सिडी के साथ शहरी गरीबों के लिए किफायती आवास।", "Marathi": "व्याज सवलतीसह शहरी गरिबांसाठी परवडणारी घरे." },
      "benefits": ["Subsidy up to ₹2.67 Lakh", "Interest subvention on home loans"],
      "eligibility": ["EWS/LIG categories", "No pucca house anywhere in India"],
      "documents": ["Identity Proof", "Address Proof", "Income Certificate"],
      "applyLink": "https://pmaymis.gov.in/"
    },
    {
      "id": "ssy",
      "category": "Women & Child",
      "provider": "Central Government",
      "names": { "English": "Sukanya Samriddhi Yojana", "Hindi": "सुकन्या समृद्धि योजना", "Marathi": "सुकन्या समृद्धी योजना" },
      "descriptions": { "English": "Savings scheme for the girl child with high interest rates.", "Hindi": "बालिकाओं के लिए उच्च ब्याज दरों वाली बचत योजना।", "Marathi": "मुलींसाठी उच्च व्याजदराची बचत योजना." },
      "benefits": ["Tax benefits under 80C", "High interest rate (8.2%+)", "Maturity after 21 years"],
      "eligibility": ["Girl child below 10 years", "Max 2 girls per family"],
      "documents": ["Birth Certificate", "Guardian ID"],
      "applyLink": "https://www.indiapost.gov.in/"
    },
    {
      "id": "pm-mudra",
      "category": "Business",
      "provider": "Central Government",
      "names": { "English": "PMMY (Mudra Loan)", "Hindi": "पीएम मुद्रा योजना", "Marathi": "पीएम मुद्रा योजना" },
      "descriptions": { "English": "Loans up to ₹10 Lakh for small business units.", "Hindi": "छोटी व्यावसायिक इकाइयों के लिए ₹10 लाख तक का ऋण।", "Marathi": "लघु व्यवसाय घटकांसाठी ₹१० लाखांपर्यंतचे कर्ज." },
      "benefits": ["Shishu (up to 50k)", "Kishore (50k-5L)", "Tarun (5L-10L)"],
      "eligibility": ["Small business owners", "Entrepreneurs"],
      "documents": ["ID Proof", "Business Plan", "Address Proof"],
      "applyLink": "https://www.mudra.org.in/"
    },
    {
      "id": "nrega",
      "category": "Employment",
      "provider": "Central Government",
      "names": { "English": "MGNREGA", "Hindi": "मनरेगा", "Marathi": "मनरेगा" },
      "descriptions": { "English": "Guaranteed wage employment for rural households.", "Hindi": "ग्रामीण परिवारों के लिए गारंटीकृत मजदूरी रोजगार।", "Marathi": "ग्रामीण कुटुंबांसाठी हमी मजुरी रोजगार." },
      "benefits": ["100 days of work per year", "Unemployment allowance"],
      "eligibility": ["Rural households", "Adult members"],
      "documents": ["Job Card", "Aadhaar Card"],
      "applyLink": "https://nrega.nic.in/"
    },
    {
      "id": "pm-fby",
      "category": "Agriculture",
      "provider": "Central Government",
      "names": { "English": "PM Fasal Bima Yojana", "Hindi": "पीएम फसल बीमा योजना", "Marathi": "पीएम फसल विमा योजना" },
      "descriptions": { "English": "Crop insurance for farmers against natural calamities.", "Hindi": "प्राकृतिक आपदाओं के खिलाफ किसानों के लिए फसल बीमा।", "Marathi": "नैसर्गिक आपत्तींविरुद्ध शेतकऱ्यांसाठी पीक विमा." },
      "benefits": ["Financial support for crop loss", "Low premium"],
      "eligibility": ["All farmers with land records"],
      "documents": ["Land Records", "Sowing Certificate", "Aadhaar"],
      "applyLink": "https://pmfby.gov.in/"
    },
    {
      "id": "jan-dhan",
      "category": "Social Security",
      "provider": "Central Government",
      "names": { "English": "PM Jan Dhan Yojana", "Hindi": "पीएम जन धन योजना", "Marathi": "पीएम जन धन योजना" },
      "descriptions": { "English": "Financial inclusion for every household with bank accounts.", "Hindi": "बैंक खातों के साथ हर परिवार के लिए वित्तीय समावेशन।", "Marathi": "बँक खात्यांसह प्रत्येक कुटुंबासाठी आर्थिक समावेशन." },
      "benefits": ["Zero balance account", "Insurance cover", "Overdraft facility"],
      "eligibility": ["Indian citizens", "No prior bank account preferred"],
      "documents": ["Aadhaar Card", "Mobile Number"],
      "applyLink": "https://pmjdy.gov.in/"
    }
  ]
};
