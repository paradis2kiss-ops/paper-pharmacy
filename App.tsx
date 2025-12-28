
import React, { useState, useEffect } from 'react';
import { LibraryBig, MapPin, NotebookPen, Moon, Sun, RotateCcw, AlertTriangle, Store } from 'lucide-react';
import getBookRecommendations from './services/geminiService';
import type { UserInput, BookRecommendationWithId } from './types';
import CherryBlossom from './components/CherryBlossom';
import RecommendationPopup from './components/RecommendationPopup';

const App: React.FC = () => {
  const [userInput, setUserInput] = useState<UserInput>({
    mood: '',
    situation: '',
    genre: '',
    purpose: ''
  });
  
  const [selectedRegion, setSelectedRegion] = useState('서울');
  const [recommendations, setRecommendations] = useState<BookRecommendationWithId[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false); 
  const [showWelcome, setShowWelcome] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [location, setLocation] = useState<{ latitude: number, longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  useEffect(() => {
    // Check local storage or system preference
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);
  
  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const moodOptions = [
    { emoji: '😭', label: '마음이 무거워요', value: 'heavy', description: '슬픔이 가득해요' },
    { emoji: '✨', label: '반짝반짝 행복', value: 'sparkly', description: '기분 최고조!' },
    { emoji: '😰', label: '불안불안', value: 'anxious', description: '마음이 복잡해요' },
    { emoji: '🌙', label: '고요한 밤', value: 'calm', description: '평온이 필요해요' },
    { emoji: '🔥', label: '열받아요', value: 'angry', description: '화가 나네요' },
    { emoji: '🤔', label: '생각 많은 중', value: 'thoughtful', description: '고민이 있어요' }
  ];
  
  const genreOptions = [
    { name: '눈물 콧물 멈춰! (로맨스/감동)', emoji: '😭' },
    { name: '자, 드가자! (판타지/SF)', emoji: '🚀' },
    { name: '내가 그걸 모를까...? (실용서/지식)', emoji: '🧠' },
    { name: '갓생은 바라지도 않아 (일상 에세이)', emoji: '🏡' },
    { name: '하룰라라 여행 (여행/자기계발)', emoji: '🧭' },
    { name: '범인 이즈 마이 베이비 (미스터리)', emoji: '⏳' },
    { name: '분할 브이로그 (예술/취미)', emoji: '🎨' },
    { name: '맛잘알? ㄴㄴ 역잘알! (역사)', emoji: '🍳' },
    { name: '하면 해 ㅋㅋ (베스트셀러)', emoji: '⚡' },
  ];

  const handleGetLocation = () => {
    if (location) {
      setLocation(null);
      setLocationError(null);
      return;
    }

    setLocationError(null);
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            },
            () => {
                setLocationError('위치 정보를 가져올 수 없습니다. 브라우저 권한을 확인해주세요.');
            }
        );
    } else {
        setLocationError('이 브라우저에서는 위치 정보 기능을 지원하지 않습니다.');
    }
  };

  const fetchRecommendations = async () => {
    setIsLoading(true);
    setActiveStep(1);
    setError(null);
    setIsPopupOpen(false);

    try {
      const results = await getBookRecommendations(userInput, selectedRegion, [], location);
      const resultsWithIds: BookRecommendationWithId[] = results.map(book => ({
        ...book,
        id: `${book.isbn || book.title}-${book.author}`
      }));
      setRecommendations(resultsWithIds);
      setActiveStep(2);
      setIsPopupOpen(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
      setError(errorMessage);
      setActiveStep(0);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleInputChange = (field: keyof UserInput, value: string) => {
    setUserInput(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userInput.mood) { 
      alert('기분은 꼭 선택해주세요! 🙏');
      return;
    }
    fetchRecommendations();
  };
  
  const handleResetForm = () => {
    setUserInput({
      mood: '',
      situation: '',
      genre: '',
      purpose: '',
    });
    setError(null);
    setActiveStep(0);
    setRecommendations([]);
    setLocation(null);
    setLocationError(null);
    setSelectedRegion('서울');
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 font-body ${isDarkMode ? 'bg-night-bg text-night-text' : 'bg-day-bg text-day-text'}`}>
      <div id="brick-bg"></div>
      <CherryBlossom />
      <div className="relative z-10 max-w-7xl mx-auto p-4 md:p-8">
        
        {/* Header */}
        <header className="relative text-center mb-8 p-4 md:p-6 rounded-2xl">
          {/* Day/Night Toggle - Top Right - Updated Design */}
          <div className="absolute top-0 right-0 md:top-4 md:right-4">
             <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`relative inline-flex items-center h-[24px] w-[40px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none 
                ${isDarkMode ? 'bg-night-card shadow-inner' : 'bg-day-card shadow-inner'}`}
            >
              <span className="sr-only">Use setting</span>
              <span
                aria-hidden="true"
                className={`${isDarkMode ? 'translate-x-4 bg-night-accent' : 'translate-x-0 bg-day-accent'}
                  pointer-events-none inline-block h-[20px] w-[20px] transform rounded-full shadow-sm ring-0 transition duration-300 ease-in-out flex items-center justify-center`}
              >
                 {isDarkMode ? <Moon size={12} className="text-white" /> : <Sun size={12} className="text-white" />}
              </span>
            </button>
          </div>

          <div className="flex flex-col items-center justify-center gap-2 mb-2 pt-4 md:pt-0">
            <div className={`p-3 rounded-full mb-2 ${isDarkMode ? 'bg-night-btn' : 'bg-white/50'}`}>
                <LibraryBig className={`w-10 h-10 ${isDarkMode ? 'text-night-accent' : 'text-day-accent'}`} />
            </div>
            <h1 className={`text-4xl md:text-5xl font-title font-extrabold text-shadow-sm ${isDarkMode ? 'text-night-text' : 'text-day-text'}`}>종이약국</h1>
          </div>
          <p className={`text-md md:text-lg lg:text-xl text-shadow-sm font-surround ${isDarkMode ? 'text-night-sub' : 'text-day-sub'}`}>
            당신의 감정을 위한 책 처방전
          </p>
          {showWelcome && (
            <div className={`mt-4 inline-block p-2 px-4 rounded-full animate-fade-in-up ${isDarkMode ? 'bg-night-cta/20' : 'bg-day-accent/20'}`}>
              <p className={`text-sm ${isDarkMode ? 'text-night-cta' : 'text-day-text'}`}>💖 반가워요! 오늘은 어떤 책이 당신을 기다리고 있을까요?</p>
            </div>
          )}
        </header>
        
        <div className="flex justify-center">
          <div className={`w-full max-w-3xl lg:max-w-4xl xl:max-w-5xl rounded-3xl p-6 md:p-8 transition-all duration-500 animate-fade-in-up shadow-lg ${isDarkMode ? 'bg-night-card shadow-night' : 'bg-day-card shadow-day'}`}>
            <div className="flex justify-between items-center mb-8 border-b pb-4 border-black/5 dark:border-white/5">
              <h2 className={`font-surround font-bold flex items-center gap-3 leading-tight break-keep w-[85%] text-[18px] min-[376px]:text-[20px] min-[415px]:text-[22px] ${isDarkMode ? 'text-night-text' : 'text-day-text'}`}>
                <NotebookPen className={`flex-shrink-0 ${isDarkMode ? 'text-night-accent' : 'text-day-accent'}`} /> 
                <span>당신의 이야기를 <br className="inline sm:hidden"/>들려주세요</span>
              </h2>
              <button onClick={handleResetForm} type="button" className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-white/10 text-night-sub' : 'hover:bg-black/10 text-day-sub'}`} aria-label="Reset form">
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="flex justify-start gap-2 mb-6">
                {[0, 1, 2].map((step) => <div key={step} className={`h-1.5 rounded-full transition-all duration-500 ${activeStep >= step ? (isDarkMode ? 'w-10 bg-night-cta' : 'w-10 bg-day-accent') : 'w-6 bg-black/10 dark:bg-white/10'}`} />)}
              </div>
              
              <div>
                <label className="block text-xl font-surround font-bold mb-4">지금 기분은 어때요? *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {moodOptions.map(mood => (
                    <button 
                        key={mood.value} 
                        type="button" 
                        onClick={() => handleInputChange('mood', mood.label)} 
                        className={`group p-4 text-center rounded-2xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-md 
                            ${userInput.mood === mood.label 
                                ? (isDarkMode ? 'bg-night-bg border-night-accent text-night-text shadow-night' : 'bg-day-card border-day-accent text-day-text shadow-day') 
                                : (isDarkMode ? 'bg-night-btn border-transparent hover:bg-night-btn/80 text-night-sub' : 'bg-day-btn border-transparent hover:bg-day-btn/80 text-white shadow-day')
                            }`}
                    >
                      <div className="text-3xl mb-2 transform group-hover:rotate-[-10deg] transition-transform">{mood.emoji}</div>
                      <div className="font-surround text-[18px] font-bold leading-snug">{mood.label}</div>
                      <div className={`text-[13px] mt-1 font-normal opacity-85 ${userInput.mood === mood.label ? 'opacity-100' : ''}`}>{mood.description}</div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-xl font-surround font-bold mb-3">지금 상황을 편하게 말해줘요</label>
                <textarea 
                    value={userInput.situation} 
                    onChange={(e) => handleInputChange('situation', e.target.value)} 
                    placeholder="예: 요즘 취준 때문에 너무 힘들어요... 위로가 필요해요 😢" 
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-300 focus:outline-none resize-none font-body text-lg
                        ${isDarkMode 
                            ? 'bg-night-bg border-transparent text-night-text placeholder-night-sub/50 focus:border-night-cta' 
                            : 'bg-day-bg border-transparent text-day-text placeholder-day-sub/50 focus:border-day-accent'
                        }`} 
                    rows={3} 
                />
              </div>
              
              <div>
                <label className="block text-xl font-surround font-bold mb-3">선호하는 장르가 있나요? (선택)</label>
                <div className="flex flex-wrap gap-2.5">
                  {genreOptions.map(genre => (
                    <button 
                        key={genre.name} 
                        type="button" 
                        onClick={() => handleInputChange('genre', genre.name)} 
                        className={`px-4 py-2.5 rounded-xl text-sm font-surround font-bold transition-all duration-300 hover:scale-105 shadow-sm
                            ${userInput.genre === genre.name 
                                ? (isDarkMode ? 'bg-night-card text-night-text border border-night-accent' : 'bg-day-card text-day-text border border-day-accent') 
                                : (isDarkMode ? 'bg-night-btn text-night-text hover:bg-night-card hover:text-night-accent' : 'bg-day-btn text-white hover:text-day-accent hover:bg-day-card')
                            }`}
                    >
                        <span className="mr-2">{genre.emoji}</span>{genre.name}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-xl font-surround font-bold mb-3">이 책으로 뭘 얻고 싶어요?</label>
                <input 
                    type="text" 
                    value={userInput.purpose} 
                    onChange={(e) => handleInputChange('purpose', e.target.value)} 
                    placeholder="예: 위로, 성장, 도피..." 
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-300 focus:outline-none font-body text-lg
                        ${isDarkMode 
                            ? 'bg-night-bg border-transparent text-night-text placeholder-night-sub/50 focus:border-night-cta' 
                            : 'bg-day-bg border-transparent text-day-text placeholder-day-sub/50 focus:border-day-accent'
                        }`} 
                />
              </div>
             
              <div>
                <label className="block text-xl font-surround font-bold mb-3">도서관 검색 위치</label>
                <div className="flex flex-wrap items-center gap-3">
                    <button 
                        type="button" 
                        onClick={handleGetLocation} 
                        className={`flex items-center justify-center px-5 py-3 rounded-xl text-sm font-bold transition-all duration-300 border-2
                             ${location 
                                ? (isDarkMode ? 'bg-night-cta/20 border-night-cta text-night-cta' : 'bg-day-accent/20 border-day-accent text-day-text') 
                                : (isDarkMode ? 'bg-night-btn border-transparent text-night-sub hover:border-night-cta/50' : 'bg-day-btn border-transparent text-white hover:bg-day-accent/80')
                             }`}
                    >
                        <MapPin className="w-4 h-4 mr-2" />
                        {location ? '위치 정보 사용 중 (해제)' : '현재 위치 사용하기'}
                    </button>
                </div>
                {locationError && <p className="text-red-400 text-xs mt-2 ml-1">{locationError}</p>}
              </div>

              {error && (
                <div className="text-center p-4 rounded-xl bg-red-500/10 text-red-500 animate-pulse">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                  <p className="font-bold mb-1 font-surround">오류가 발생했어요</p>
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isLoading} 
                className={`w-full py-4 rounded-2xl font-surround font-bold text-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl disabled:opacity-60 disabled:hover:scale-100 flex items-center justify-center gap-3 shadow-lg mt-4
                    ${isDarkMode ? 'bg-night-cta text-night-bg' : 'bg-day-accent text-white'}`} 
               >
                {isLoading ? (<><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>책을 고르는 중...</>) : (<>나만의 책 처방전 받기</>)}
              </button>
            </form>
          </div>
        </div>
        
        <footer className="mt-12 text-center p-4">
          <p className={`text-sm font-bold opacity-60 ${isDarkMode ? 'text-night-sub' : 'text-day-sub'}`}>💫 Powered by Google Gemini API</p>
        </footer>
      </div>

      <RecommendationPopup 
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        recommendations={recommendations}
        isDarkMode={isDarkMode}
        regionScope={location ? 'current' : 'local'}
        selectedRegion={selectedRegion}
      />
    </div>
  );
};

export default App;
