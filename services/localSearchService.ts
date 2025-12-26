
import { localData } from '../data/localSchemes';

export interface LocalScheme {
  id: string;
  category: string;
  provider: string;
  names: Record<string, string>;
  descriptions: Record<string, string>;
  benefits: string[];
  eligibility: string[];
  documents: string[];
  applyLink: string;
}

export const searchLocalSchemes = (query: string, language: string): string => {
  const schemes: LocalScheme[] = localData.schemes;
  const q = query.toLowerCase().trim();
  
  if (!q) return "Please enter a query to search our database.";

  // Enhanced search: Check names, descriptions, and categories across all supported languages
  const results = schemes.filter(s => {
    const searchSpace = [
      ...Object.values(s.names),
      ...Object.values(s.descriptions),
      s.category,
      s.provider
    ].join(' ').toLowerCase();
    
    return q.split(' ').every(word => searchSpace.includes(word));
  });

  if (results.length === 0) {
    return language === 'Hindi' 
      ? "क्षमा करें, मुझे इस बारे में कोई जानकारी नहीं मिली। आप 'किसान', 'स्वास्थ्य', या 'शिक्षा' जैसे शब्दों के साथ प्रयास कर सकते हैं।" 
      : "I couldn't find any specific local records for that. Try searching for broader terms like 'Farmers', 'Health', or 'Education'.";
  }

  let response = language === 'Hindi' 
    ? `मुझे आपकी खोज के लिए ${results.length} प्रासंगिक स्थानीय रिकॉर्ड मिले:\n\n`
    : `I found ${results.length} relevant local records for your query:\n\n`;

  results.slice(0, 10).forEach(res => {
    const name = res.names[language] || res.names['English'];
    const desc = res.descriptions[language] || res.descriptions['English'];
    
    response += `### ${name}\n`;
    response += `**${language === 'Hindi' ? 'श्रेणी' : 'Category'}:** ${res.category} (${res.provider})\n\n`;
    response += `${desc}\n\n`;
    response += `✅ **${language === 'Hindi' ? 'लाभ' : 'Benefits'}:** ${res.benefits.join(', ')}\n`;
    response += `📄 **${language === 'Hindi' ? 'दस्तावेज़' : 'Documents'}:** ${res.documents.join(', ')}\n`;
    response += `🔗 [${language === 'Hindi' ? 'यहाँ आवेदन करें' : 'Apply Here'}](${res.applyLink})\n\n---\n\n`;
  });

  return response;
};

export const getLocalLatestSchemes = (language: string): any[] => {
  // Returns top 4 schemes as a fallback for the "New Schemes" page
  return localData.schemes.slice(0, 4).map(s => ({
    name: s.names[language] || s.names['English'],
    description: s.descriptions[language] || s.descriptions['English'],
    provider: s.provider,
    benefits: s.benefits,
    documents: s.documents,
    applyLink: s.applyLink
  }));
};
