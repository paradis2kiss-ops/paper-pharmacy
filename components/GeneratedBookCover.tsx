import React, { useState, useEffect } from 'react';

const stringToHash = (str: string): number => {
  let hash = 0;
  if (str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

const colorPalettes = [
  { from: '#ff9a9e', to: '#fecfef', text: '#5e3449' },
  { from: '#a1c4fd', to: '#c2e9fb', text: '#2c3e50' },
  { from: '#84fab0', to: '#8fd3f4', text: '#13547a' },
  { from: '#f6d365', to: '#fda085', text: '#8c520a' },
  { from: '#d4fc79', to: '#96e6a1', text: '#2c522c' },
  { from: '#c3a3f4', to: '#fbc2eb', text: '#4a2c52' },
];

const patterns = [
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'%3E%3Cpath fill='%23FFFFFF' fill-opacity='0.3' d='M2 9h6V3h2v6h6v2H10v6H8V11H2V9z'/%3E%3C/svg%3E")`,
  `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23FFFFFF' fill-opacity='0.3' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")`,
];

interface GeneratedBookCoverProps {
  title: string;
  author: string;
  isbn: string;
  coverImageUrl?: string;
  size?: 'small' | 'large';
  className?: string;
}

const GeneratedBookCover: React.FC<GeneratedBookCoverProps> = ({ 
  title, 
  author, 
  isbn, 
  coverImageUrl, 
  size = 'large', 
  className 
}) => {
  const [displayUrl, setDisplayUrl] = useState<string | null>(null);
  const [showFallback, setShowFallback] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setDisplayUrl(null);
    setShowFallback(false);
    setIsLoading(true);

    // ⭐ 알라딘 API에서 받은 coverImageUrl을 최우선으로 사용
    const imageUrls = [
      coverImageUrl, // 알라딘 TTB API가 제공한 정확한 URL
    ].filter(Boolean) as string[];

    console.log('📸 커버 URL 시도:', imageUrls);

    if (imageUrls.length === 0) {
      console.log('⚠️ 커버 URL 없음, fallback 표시');
      setShowFallback(true);
      setIsLoading(false);
      return;
    }

    let loaded = false;

    // 이미지 로드 시도
    const tryLoadImage = (index: number) => {
      if (index >= imageUrls.length) {
        console.log('❌ 모든 URL 실패, fallback 표시');
        setShowFallback(true);
        setIsLoading(false);
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        if (!loaded) {
          loaded = true;
          setDisplayUrl(imageUrls[index]);
          setIsLoading(false);
          console.log('✅ 이미지 로드 성공:', imageUrls[index]);
        }
      };

      img.onerror = () => {
        console.log('❌ 이미지 로드 실패:', imageUrls[index]);
        // 다음 URL 시도
        tryLoadImage(index + 1);
      };

      img.src = imageUrls[index];
    };

    tryLoadImage(0);

  }, [isbn, title, coverImageUrl]);

  const containerClasses = size === 'large' 
    ? "w-32 h-48 md:w-40 md:h-60 lg:w-48 lg:h-72 rounded-r-xl rounded-l-md shadow-xl border-l-4 border-white/20" 
    : "w-14 h-20 rounded-r-md rounded-l-sm shadow-md border-l-2 border-white/20 flex-shrink-0";

  // Fallback 디자인
  if (showFallback) {
    const safeTitle = title || "제목 미정";
    const safeAuthor = author || "저자 미상";
    
    const hash = stringToHash(safeTitle + safeAuthor);
    const palette = colorPalettes[hash % colorPalettes.length];
    const pattern = patterns[hash % patterns.length];
    
    const titleClass = size === 'large' ? 'text-lg font-surround leading-tight mb-2' : 'text-[10px] font-surround leading-none mb-1';
    const authorClass = size === 'large' ? 'text-sm font-body' : 'text-[8px] font-body';
    const paddingClass = size === 'large' ? 'p-4' : 'p-1';

    return (
      <div 
        className={`relative ${containerClasses} ${className} ${paddingClass} flex flex-col justify-center items-center text-center overflow-hidden transition-transform hover:scale-105`}
        style={{
          background: `linear-gradient(135deg, ${palette.from} 0%, ${palette.to} 100%)`,
          color: palette.text,
        }}
      >
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: pattern,
            backgroundSize: size === 'large' ? '20px 20px' : '10px 10px',
          }}
        />
        
        <div className="absolute left-0 top-0 bottom-0 w-[4%] bg-black/10" />

        <div className="relative z-10 drop-shadow-md">
          <h3 className={`font-bold ${titleClass} break-keep`}>{safeTitle}</h3>
          <div className={`w-1/2 h-px bg-current opacity-50 mx-auto my-1 ${size === 'small' ? 'hidden' : 'block'}`} />
          <p className={`opacity-90 ${authorClass}`}>{safeAuthor}</p>
        </div>
      </div>
    );
  }

  // 실제 이미지 표시
  return (
    <div className={`relative ${containerClasses} ${className} bg-gray-200 dark:bg-gray-800/50 overflow-hidden transition-transform hover:scale-105`}>
      {isLoading && (
        <div className="absolute inset-0 animate-pulse bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {displayUrl && (
        <img
          src={displayUrl}
          alt={`${title} 표지`}
          className={`w-full h-full object-cover transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          crossOrigin="anonymous"
          onError={() => {
            console.log('❌ img 태그 렌더링 실패:', displayUrl);
            setShowFallback(true);
          }}
          onLoad={() => {
            console.log('✅ img 태그 렌더링 성공:', displayUrl);
          }}
        />
      )}
    </div>
  );
};

export default GeneratedBookCover;