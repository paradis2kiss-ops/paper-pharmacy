import { GoogleGenAI, Type } from "@google/genai";
import type { BookRecommendation, UserInput } from '../types';

// ⭐ 알라딘 검색 함수 추가
const searchAladinBook = async (title: string, author: string): Promise<any> => {
  try {
    const query = `${title} ${author}`;
    const response = await fetch(`/api/aladin?query=${encodeURIComponent(query)}&queryType=Title`);
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.books?.[0] || null;
  } catch (error) {
    console.error('알라딘 검색 오류:', error);
    return null;
  }
};

const getBookRecommendations = async (
  userInput: UserInput, 
  region: string, 
  excludeTitles: string[] = [],
  location: { latitude: number, longitude: number } | null = null
): Promise<BookRecommendation[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        author: { type: Type.STRING },
        publisher: { type: Type.STRING },
        isbn: { type: Type.STRING },
        description: { type: Type.STRING },
        aiReason: { type: Type.STRING },
        vibe: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        libraries: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              available: { type: Type.BOOLEAN },
              distance: { type: Type.STRING },
              waitlist: { type: Type.INTEGER },
            },
            required: ['name', 'available']
          }
        },
      },
      required: ['title', 'author', 'publisher', 'description', 'aiReason', 'vibe', 'libraries']
    }
  };

  const genrePreference = userInput.genre
    ? `선호 장르: ${userInput.genre}`
    : "장르 제한 없음";

  const locationInfo = location
    ? `위치: 위도 ${location.latitude}, 경도 ${location.longitude}`
    : `지역: ${region}`;

  let prompt = `감정 기반 책 큐레이터로서 다음 정보를 바탕으로 정확히 3권의 책을 추천하세요.

기분: ${userInput.mood}
상황: ${userInput.situation || "미지정"}
${genrePreference}
목적: ${userInput.purpose || "미지정"}
${locationInfo}

중요: 반드시 실제로 존재하는 한국어 도서만 추천하세요.
도서관 정보는 ${region} 지역의 실제 공공도서관 3곳을 포함하되, URL은 생성하지 마세요.`;

  if (excludeTitles.length > 0) {
    prompt += `\n\n제외할 책: ${excludeTitles.join(', ')}`;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });
    
    const jsonString = response.text.trim();
    const booksFromAI: Omit<BookRecommendation, 'purchaseLinks' | 'coverImageUrl' | 'isbn'>[] = JSON.parse(jsonString);

    // ⭐ 알라딘 API로 실제 도서 정보 확인
    const enrichedBooks = await Promise.all(
      booksFromAI.map(async (book) => {
        // 알라딘에서 실제 책 검색
        const aladinBook = await searchAladinBook(book.title, book.author);
        
        const encodedTitle = encodeURIComponent(book.title);
        
        // ⭐ 도서관 URL 생성 (국립중앙도서관 통합검색)
        const librariesWithUrl = book.libraries.map(lib => ({
          ...lib,
          url: `https://www.nl.go.kr/seoji/SearchListSimple.do?searchType=SIMPLE&searchKeyword=${encodedTitle}`
        }));
        
        return {
          ...book,
          isbn: aladinBook?.isbn || '9788000000000', // fallback ISBN
          coverImageUrl: aladinBook?.cover || '',
          purchaseLinks: {
            yes24: `https://www.yes24.com/Product/Search?query=${encodedTitle}`,
            kyobo: `https://search.kyobobook.co.kr/search?keyword=${encodedTitle}`,
            aladin: aladinBook?.link || `https://www.aladin.co.kr/search/wsearchresult.aspx?SearchWord=${encodedTitle}`
          },
          libraries: librariesWithUrl
        };
      })
    );

    return enrichedBooks;

  } catch (error) {
    console.error("추천 오류:", error);
    throw new Error("AI 추천 실패. 다시 시도해주세요.");
  }
};

export default getBookRecommendations;