
import React from 'react';
import { X, ScrollText, Library, PenSquare, Store, ExternalLink } from 'lucide-react';
import type { BookRecommendationWithId, PurchaseLinks } from '../types';
import GeneratedBookCover from './GeneratedBookCover';

interface RecommendationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  recommendations: BookRecommendationWithId[];
  isDarkMode: boolean;
  regionScope: string;
  selectedRegion: string;
}

const RecommendationPopup: React.FC<RecommendationPopupProps> = ({ 
  isOpen, 
  onClose, 
  recommendations, 
  isDarkMode,
  regionScope,
  selectedRegion
}) => {
  if (!isOpen) return null;

  const getLibraryTitle = () => {
    if (regionScope === 'current') return '내 주변';
    if (regionScope === 'national') return '전국';
    return selectedRegion;
  };
  
  const siteNames: { [key in keyof PurchaseLinks]: string } = {
      yes24: 'YES24',
      kyobo: '교보문고',
      aladin: '알라딘'
  };

  const bookstoreOrder: (keyof PurchaseLinks)[] = ['kyobo', 'aladin', 'yes24'];

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-subtle-fade-in-up" 
      onClick={onClose}
      style={{ animationDuration: '0.3s' }}
    >
      <div 
        className={`relative w-full max-w-4xl max-h-[90vh] rounded-3xl p-6 md:p-8 flex flex-col shadow-2xl overflow-hidden ${
            isDarkMode 
                ? 'bg-night-card border border-white/10' 
                : 'bg-day-bg border border-day-text/10'
        }`}
        onClick={e => e.stopPropagation()}
      >
        <button 
            onClick={onClose} 
            className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-white/10 text-night-sub' : 'hover:bg-black/10 text-day-text'}`} 
            aria-label="Close recommendations"
        >
            <X className="w-6 h-6" />
        </button>
        
        <h2 className={`text-2xl md:text-3xl font-surround font-bold mb-8 flex items-center gap-3 ${isDarkMode ? 'text-night-text' : 'text-day-text'}`}>
            <ScrollText className={isDarkMode ? 'text-night-accent' : 'text-day-accent'} />
            당신을 위한 책 처방전
        </h2>
        
        <div className="overflow-y-auto custom-scrollbar pr-2 -mr-4 flex-1">
          <div className="space-y-6">
            {recommendations.map((book, index) => (
              <div key={book.id} className={`rounded-2xl p-5 md:p-6 transition-all duration-500 border shadow-sm animate-fade-in-up 
                  ${isDarkMode 
                    ? 'bg-night-bg border-white/5 hover:bg-night-bg/80' 
                    : 'bg-day-card border-day-text/5 hover:bg-day-card/80'
                  }`} 
                  style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="flex flex-col sm:flex-row gap-6">
                  <GeneratedBookCover
                    title={book.title}
                    author={book.author}
                    isbn={book.isbn}
                    coverImageUrl={book.coverImageUrl}
                    size="large"
                    className="mx-auto sm:mx-0 shadow-lg"
                  />
                  <div className="flex-1 min-w-0 text-center sm:text-left">
                    <h3 className={`font-surround font-bold text-xl md:text-2xl mb-1 leading-snug ${isDarkMode ? 'text-night-text' : 'text-day-text'}`} style={{fontFamily: 'Cafe24Ssurround, Pretendard, sans-serif'}}>{book.title}</h3>
                    <p className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-night-sub' : 'text-day-sub'}`}>{book.author} · {book.publisher}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4 justify-center sm:justify-start">
                        {book.vibe.map((tag, idx) => (
                            <span key={idx} className={`text-xs px-2.5 py-1 rounded-full font-bold 
                                ${isDarkMode ? 'bg-night-btn text-night-text' : 'bg-day-bg text-day-text'}`}>
                                #{tag}
                            </span>
                        ))}
                    </div>
                    
                    <p className={`text-base italic mb-4 leading-relaxed font-body ${isDarkMode ? 'text-night-text/90' : 'text-day-text/90'}`}>"{book.description}"</p>
                    
                    <div className={`p-4 rounded-xl mb-4 text-sm ${isDarkMode ? 'bg-night-btn/30' : 'bg-day-bg'}`}>
                        <p className={`font-semibold flex items-start gap-2 ${isDarkMode ? 'text-night-text' : 'text-day-text'}`}>
                            <PenSquare className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-night-accent' : 'text-day-accent'}`} />
                            <span><span className="font-bold">AI's Note:</span> {book.aiReason}</span>
                        </p>
                    </div>
                    
                    <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Purchase Links */}
                        <div>
                            <p className={`text-sm font-bold mb-2 flex items-center justify-center sm:justify-start gap-1.5 ${isDarkMode ? 'text-night-sub' : 'text-day-sub'}`}>
                                <Store className="w-4 h-4" />온라인 서점
                            </p>
                            <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                                {bookstoreOrder.map((site) => (
                                    <a 
                                        key={site} 
                                        href={book.purchaseLinks[site]} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className={`flex items-center text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors border
                                            ${isDarkMode 
                                                ? 'bg-night-btn border-transparent hover:bg-night-btn/80 text-night-text' 
                                                : 'bg-day-bg border-transparent hover:bg-white text-day-text'
                                            }`}
                                    >
                                        <ExternalLink className="w-3 h-3 mr-1.5 opacity-70" />
                                        {siteNames[site]}
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Libraries */}
                        <div>
                          <p className={`text-sm font-bold mb-2 flex items-center justify-center sm:justify-start gap-1.5 ${isDarkMode ? 'text-night-sub' : 'text-day-sub'}`}>
                              <Library className="w-4 h-4" />{getLibraryTitle()} 도서관 현황
                          </p>
                          <div className="space-y-1.5 text-xs">
                            {book.libraries.map((lib, idx) => (
                            <div key={idx} className={`flex items-center justify-between p-2 rounded-lg 
                                ${isDarkMode ? 'bg-night-btn/50' : 'bg-day-bg/50'}`}>
                              {lib.url ? (
                                <a href={lib.url} target="_blank" rel="noopener noreferrer" className={`font-semibold truncate pr-2 flex items-center gap-1.5 hover:underline ${isDarkMode ? 'text-night-cta' : 'text-day-accent'}`}>
                                  {lib.name}
                                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                </a>
                              ) : (
                                <span className={`font-semibold truncate pr-2 ${isDarkMode ? 'text-night-text' : 'text-day-text'}`}>{lib.name}</span>
                              )}
                              {lib.available ? (
                                <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-bold flex-shrink-0">
                                    ✓ 대여 가능 {lib.distance && `(${lib.distance})`}
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-orange-500 dark:text-orange-400 font-bold flex-shrink-0">
                                    ◷ 대기 {lib.waitlist}명
                                </span>
                              )}
                            </div>))}
                          </div>
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendationPopup;
