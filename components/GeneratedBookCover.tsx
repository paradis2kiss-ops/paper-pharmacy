
import React, { useState, useEffect } from 'react';

// Simple string hash to generate a number for deterministic generation.
const stringToHash = (str: string): number => {
  let hash = 0;
  if (str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

// A curated list of beautiful, harmonious color palettes.
const colorPalettes = [
  { from: '#ff9a9e', to: '#fecfef', text: '#5e3449' }, // Cotton Candy
  { from: '#a1c4fd', to: '#c2e9fb', text: '#2c3e50' }, // Gentle Sky
  { from: '#84fab0', to: '#8fd3f4', text: '#13547a' }, // Ocean Mist
  { from: '#f6d365', to: '#fda085', text: '#8c520a' }, // Warm Sunset
  { from: '#d4fc79', to: '#96e6a1', text: '#2c522c' }, // Fresh Lime
  { from: '#c3a3f4', to: '#fbc2eb', text: '#4a2c52' }, // Lavender Dream
  { from: '#fccb90', to: '#d57eeb', text: '#522c4a' }, // Soft Peach
  { from: '#48c6ef', to: '#6f86d6', text: '#073352' }, // Deep Ocean
  { from: '#ff758c', to: '#ff7eb3', text: '#6d1839' }, // Raspberry Fizz
  { from: '#56ab2f', to: '#a8e063', text: '#193a0d' }, // Lush Meadow
  { from: '#30cfd0', to: '#330867', text: '#ffffff' }, // Galaxy Night
  { from: '#20002c', to: '#cbb4d4', text: '#ffffff' }, // Royal Amethyst
  { from: '#1e3c72', to: '#2a5298', text: '#ffffff' }, // Starry Night
  { from: '#ffdde1', to: '#ee9ca7', text: '#7d3c47' }, // Rose Petals
  { from: '#00c3ff', to: '#ffff1c', text: '#004c66' }, // Electric Pop
];

// Abstract SVG patterns for background texture
const patterns = [
  // Plus signs
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'%3E%3Cpath fill='%23FFFFFF' fill-opacity='0.3' d='M2 9h6V3h2v6h6v2H10v6H8V11H2V9z'/%3E%3C/svg%3E")`,
  // Dots
  `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23FFFFFF' fill-opacity='0.3' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")`,
  // Zigzag
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'%3E%3Cpath fill='%23FFFFFF' fill-opacity='0.3' d='M0 0h20L0 20zM20 20H0L20 0z'/%3E%3C/svg%3E")`,
];

interface GeneratedBookCoverProps {
  title: string;
  author: string;
  isbn: string;
  coverImageUrl?: string;
  size?: 'small' | 'large';
  className?: string;
}

const GeneratedBookCover: React.FC<GeneratedBookCoverProps> = ({ title, author, isbn, coverImageUrl, size = 'large', className }) => {
  const [displayUrl, setDisplayUrl] = useState<string | null>(null);
  const [showFallback, setShowFallback] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Re-calculate coverSources based on props without memoization, as props drive the effect.
  const coverSources = [
    coverImageUrl,
    isbn ? `https://contents.kyobobook.co.kr/sih/fit-in/400x0/pdt/${isbn}.jpg` : undefined,
    isbn ? `https://cover.aladin.co.kr/getbook.aspx?isbn=${isbn}` : undefined,
    // Yes24 does not have a reliable ISBN-based URL pattern.
    isbn ? `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false` : undefined,
  ].filter((url): url is string => !!url);


  useEffect(() => {
    // Reset state for new props
    setDisplayUrl(null);
    setShowFallback(false);
    setIsLoading(true);

    if (coverSources.length === 0) {
      setShowFallback(true);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    let imageLoaded = false;
    let failedAttempts = 0;

    coverSources.forEach(src => {
      // Create an in-memory image to preload
      const img = new Image();
      
      img.onload = () => {
        if (isMounted && !imageLoaded) {
          imageLoaded = true;
          setDisplayUrl(src);
          setIsLoading(false);
        }
      };

      img.onerror = () => {
        if (isMounted) {
          failedAttempts++;
          if (failedAttempts === coverSources.length && !imageLoaded) {
            setShowFallback(true);
            setIsLoading(false);
          }
        }
      };
      
      img.src = src;
    });

    return () => {
      isMounted = false;
    };
  }, [isbn, title, coverImageUrl]); // Rerun effect when these props change

  const containerClasses = size === 'large' 
    ? "w-32 h-48 md:w-40 md:h-60 lg:w-48 lg:h-72 rounded-r-xl rounded-l-md shadow-xl border-l-4 border-white/20" 
    : "w-14 h-20 rounded-r-md rounded-l-sm shadow-md border-l-2 border-white/20 flex-shrink-0";

  if (showFallback) {
    // Enhanced fallback generation logic
    const safeTitle = title || "제목 미정";
    const safeAuthor = author || "작자 미상";
    
    const hash = stringToHash(safeTitle + safeAuthor);
    const palette = colorPalettes[hash % colorPalettes.length];
    const pattern = patterns[hash % patterns.length];
    
    const titleClass = size === 'large' ? 'text-lg font-surround leading-tight mb-2' : 'text-[10px] font-surround leading-none mb-1';
    const authorClass = size === 'large' ? 'text-sm font-body' : 'text-[8px] font-body';
    const paddingClass = size === 'large' ? 'p-4' : 'p-1';

    return (
      <div 
          className={`relative ${containerClasses} ${className} ${paddingClass} flex flex-col justify-center items-center text-center overflow-hidden transition-transform hover:scale-105 group`}
          style={{
              background: `linear-gradient(135deg, ${palette.from} 0%, ${palette.to} 100%)`,
              color: palette.text,
          }}
      >
          {/* Pattern Overlay */}
          <div 
            className="absolute inset-0 opacity-30 group-hover:opacity-40 transition-opacity duration-500"
            style={{
              backgroundImage: pattern,
              backgroundSize: size === 'large' ? '20px 20px' : '10px 10px',
            }}
          />
          
          {/* Spine effect */}
          <div className="absolute left-0 top-0 bottom-0 w-[4%] bg-black/10" />
          
          {/* Subtle sheen animation */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent translate-x-[-100%] animate-[shimmer_3s_infinite]" />

          <div className="relative z-10 drop-shadow-md">
            <h3 className={`font-bold ${titleClass} break-keep`}>{safeTitle}</h3>
            <div className={`w-1/2 h-px bg-current opacity-50 mx-auto my-1 ${size === 'small' ? 'hidden' : 'block'}`} />
            <p className={`opacity-90 ${authorClass}`}>{safeAuthor}</p>
          </div>
          
          <style>{`
            @keyframes shimmer {
              100% { transform: translateX(100%); }
            }
          `}</style>
      </div>
    );
  }

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
          alt={`${title} book cover`}
          className={`w-full h-full object-cover transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          onError={() => setShowFallback(true)}
        />
      )}
    </div>
  );
};

export default GeneratedBookCover;
