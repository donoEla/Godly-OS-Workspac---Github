import React from 'react';
import { getDomainFromUrl, getFaviconUrl } from '../../constants/browserAssets';

interface BrandFaviconProps {
  url?: string;
  title?: string;
  size?: number;
  className?: string;
}

export const BrandFavicon: React.FC<BrandFaviconProps> = ({
  url = '',
  title = '',
  size = 18,
  className = '',
}) => {
  const domain = getDomainFromUrl(url).toLowerCase();
  const lowerTitle = title.toLowerCase();

  // 1. YouTube
  if (domain.includes('youtube.com') || domain.includes('youtu.be') || lowerTitle.includes('youtube')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <rect width="24" height="24" rx="6" fill="#FF0000" />
        <path d="M10 8.5L16 12L10 15.5V8.5Z" fill="white" />
      </svg>
    );
  }

  // 2. Discord
  if (domain.includes('discord.com') || domain.includes('discord.gg') || lowerTitle.includes('discord')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <rect width="24" height="24" rx="6" fill="#5865F2" />
        <path d="M18.8 6.5C17.6 5.9 16.3 5.5 15 5.3C14.8 5.7 14.6 6.2 14.4 6.7C13 6.5 11.6 6.5 10.2 6.7C10 6.2 9.8 5.7 9.6 5.3C8.3 5.5 7 5.9 5.8 6.5C3.5 10 2.9 13.4 3.2 16.7C4.7 17.8 6.2 18.5 7.6 19C8 18.5 8.3 17.9 8.6 17.3C8.1 17.1 7.6 16.8 7.1 16.5C7.2 16.4 7.3 16.3 7.5 16.2C10.4 17.5 13.6 17.5 16.5 16.2C16.7 16.3 16.8 16.4 16.9 16.5C16.4 16.8 15.9 17.1 15.4 17.3C15.7 17.9 16.1 18.5 16.4 19C17.9 18.5 19.3 17.8 20.8 16.7C21.2 12.8 20.1 9.5 18.8 6.5ZM8.5 14.5C7.6 14.5 6.9 13.7 6.9 12.7C6.9 11.7 7.6 10.9 8.5 10.9C9.4 10.9 10.1 11.7 10.1 12.7C10.1 13.7 9.4 14.5 8.5 14.5ZM15.5 14.5C14.6 14.5 13.9 13.7 13.9 12.7C13.9 11.7 14.6 10.9 15.5 10.9C16.4 10.9 17.1 11.7 17.1 12.7C17.1 13.7 16.4 14.5 15.5 14.5Z" fill="white" />
      </svg>
    );
  }

  // 3. Spotify
  if (domain.includes('spotify.com') || lowerTitle.includes('spotify')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <circle cx="12" cy="12" r="12" fill="#1DB954" />
        <path d="M16.5 16.2C16.3 16.5 15.9 16.6 15.6 16.4C12.8 14.7 9.5 14.3 5.6 15.2C5.3 15.3 4.9 15.1 4.8 14.7C4.7 14.4 5 14 5.3 13.9C9.6 12.9 13.3 13.4 16.3 15.3C16.7 15.5 16.7 15.9 16.5 16.2ZM17.9 13.1C17.6 13.5 17.1 13.7 16.7 13.4C13.7 11.5 9 11 5.4 12.1C5 12.2 4.5 12 4.4 11.5C4.3 11.1 4.5 10.6 5 10.5C9.2 9.2 14.3 9.8 17.7 11.9C18.1 12.1 18.2 12.7 17.9 13.1ZM18 9.9C14.4 7.7 8.3 7.5 4.8 8.6C4.3 8.7 3.7 8.4 3.6 7.9C3.5 7.3 3.8 6.8 4.3 6.6C8.4 5.4 15.1 5.6 19.3 8.1C19.8 8.4 20 9 19.7 9.5C19.4 9.9 18.5 10.2 18 9.9Z" fill="#121212" />
      </svg>
    );
  }

  // 4. ChatGPT / OpenAI
  if (domain.includes('openai.com') || domain.includes('chatgpt.com') || lowerTitle.includes('chatgpt') || lowerTitle.includes('openai')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <rect width="24" height="24" rx="6" fill="#10A37F" />
        <path d="M19.1 10.4C18.9 7.7 16.9 5.8 14.3 5.8C13.8 5.8 13.2 5.9 12.8 6.1C12.1 4.8 10.7 4 9.2 4C6.6 4 4.5 5.9 4.3 8.5C3.4 9.1 2.8 10.2 2.8 11.4C2.8 13.1 3.9 14.5 5.5 15C5.7 17.4 7.5 19.3 9.9 19.6C10.5 20.5 11.6 21 12.8 21C15.4 21 17.5 19.1 17.7 16.6C19.3 16 20.3 14.5 20.3 12.8C20.3 11.8 19.9 10.9 19.1 10.4ZM12.8 19.5C12.1 19.5 11.4 19.2 10.9 18.6L12.5 17.7C12.7 17.8 12.9 17.8 13.1 17.8C14.4 17.8 15.4 16.8 15.4 15.5V13.8L16.8 14.6C17.3 15.6 16.7 17.2 15.6 17.8L12.8 19.5ZM4.3 11.8C4.3 10.8 5 9.7 6 9.3L7.4 10.1V12.7C7.4 13.2 7.7 13.7 8.1 13.9L9.5 14.7L8 15.6C6.9 15 4.3 13.5 4.3 11.8ZM6.8 7.3C7.6 6.3 9.1 5.8 10.3 6.5L11.7 7.3V10.1L10.3 9.3C9.9 9.1 9.4 9.1 8.9 9.4C7.8 10 7.3 11.3 7.3 12.6V10.8C6.9 9.8 6.7 8.4 6.8 7.3ZM12 13.4L10.4 12.5L12 11.6L13.6 12.5L12 13.4ZM17.2 13.2L15.6 12.3V10.7C15.6 10.2 15.3 9.7 14.9 9.5L13.5 8.7L15 7.8C16.1 8.4 18.7 9.9 18.7 11.6C18.7 12.6 18 13.7 17.2 13.2Z" fill="white" />
      </svg>
    );
  }

  // 5. Reddit
  if (domain.includes('reddit.com') || lowerTitle.includes('reddit')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <circle cx="12" cy="12" r="12" fill="#FF4500" />
        <path d="M19.5 12C19.5 11.2 18.8 10.5 18 10.5C17.6 10.5 17.2 10.7 16.9 11C15.8 10.2 14.3 9.7 12.7 9.6L13.5 5.8L16.2 6.4C16.3 7 16.8 7.5 17.5 7.5C18.3 7.5 19 6.8 19 6C19 5.2 18.3 4.5 17.5 4.5C16.9 4.5 16.4 4.9 16.2 5.4L13.1 4.7C12.9 4.7 12.7 4.8 12.7 5L11.7 9.6C10.1 9.7 8.6 10.2 7.5 11C7.2 10.7 6.8 10.5 6.4 10.5C5.6 10.5 5 11.2 5 12C5 12.6 5.4 13.1 5.9 13.4C5.8 13.6 5.8 13.8 5.8 14C5.8 16.5 8.6 18.5 12 18.5C15.4 18.5 18.2 16.5 18.2 14C18.2 13.8 18.2 13.6 18.1 13.4C18.6 13.1 19.5 12.6 19.5 12ZM9.5 13.5C8.9 13.5 8.5 13.1 8.5 12.5C8.5 11.9 8.9 11.5 9.5 11.5C10.1 11.5 10.5 11.9 10.5 12.5C10.5 13.1 10.1 13.5 9.5 13.5ZM14.5 16.2C13.7 16.7 12.7 16.8 12 16.8C11.3 16.8 10.3 16.7 9.5 16.2C9.3 16.1 9.3 15.8 9.4 15.6C9.6 15.4 9.8 15.4 10 15.5C10.6 15.9 11.4 16 12 16C12.6 16 13.4 15.9 14 15.5C14.2 15.4 14.4 15.4 14.6 15.6C14.7 15.8 14.7 16.1 14.5 16.2ZM14.5 13.5C13.9 13.5 13.5 13.1 13.5 12.5C13.5 11.9 13.9 11.5 14.5 11.5C15.1 11.5 15.5 11.9 15.5 12.5C15.5 13.1 15.1 13.5 14.5 13.5Z" fill="white" />
      </svg>
    );
  }

  // 6. GitHub
  if (domain.includes('github.com') || lowerTitle.includes('github')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <circle cx="12" cy="12" r="12" fill="#181717" />
        <path fillRule="evenodd" clipRule="evenodd" d="M12 4C7.58 4 4 7.58 4 12C4 15.54 6.29 18.53 9.47 19.59C9.87 19.66 10.02 19.42 10.02 19.21C10.02 19.02 10.01 18.39 10.01 17.72C8 18.09 7.47 17.21 7.31 16.76C7.22 16.53 6.83 15.82 6.5 15.64C6.22 15.49 5.82 15.12 6.49 15.11C7.12 15.1 7.57 15.69 7.72 15.93C8.44 17.15 9.6 16.81 10.06 16.6C10.13 16.08 10.34 15.72 10.57 15.52C8.77 15.32 6.89 14.62 6.89 11.52C6.89 10.64 7.2 9.91 7.72 9.35C7.64 9.15 7.36 8.32 7.8 7.21C7.8 7.21 8.48 7 10.02 8.04C10.67 7.86 11.35 7.77 12.03 7.77C12.71 7.77 13.39 7.86 14.04 8.04C15.58 6.99 16.26 7.21 16.26 7.21C16.7 8.32 16.42 9.15 16.34 9.35C16.86 9.91 17.17 10.63 17.17 11.52C17.17 14.64 15.28 15.32 13.47 15.52C13.76 15.77 14.02 16.25 14.02 17C14.02 18.08 14.01 18.95 14.01 19.21C14.01 19.42 14.16 19.67 14.56 19.59C17.71 18.53 20 15.53 20 12C20 7.58 16.42 4 12 4Z" fill="white" />
      </svg>
    );
  }

  // 7. Google
  if (domain.includes('google.com') || lowerTitle.includes('google')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <circle cx="12" cy="12" r="12" fill="#ffffff" />
        <path d="M19.6 12.2C19.6 11.7 19.5 11.2 19.4 10.7H12V13.8H16.3C16.1 14.8 15.5 15.7 14.7 16.3V18.3H17.3C18.8 16.9 19.6 14.7 19.6 12.2Z" fill="#4285F4" />
        <path d="M12 20C14.2 20 16 19.3 17.3 18.3L14.7 16.3C14 16.8 13.1 17.1 12 17.1C9.9 17.1 8.1 15.7 7.5 13.8H4.8V15.9C6.1 18.5 8.8 20 12 20Z" fill="#34A853" />
        <path d="M7.5 13.8C7.3 13.2 7.2 12.6 7.2 12C7.2 11.4 7.3 10.8 7.5 10.2V8.1H4.8C4.3 9.1 4 10.5 4 12C4 13.5 4.3 14.9 4.8 15.9L7.5 13.8Z" fill="#FBBC05" />
        <path d="M12 6.9C13.2 6.9 14.2 7.3 15.1 8.1L17.4 5.8C16 4.5 14.2 3.8 12 3.8C8.8 3.8 6.1 5.5 4.8 8.1L7.5 10.2C8.1 8.3 9.9 6.9 12 6.9Z" fill="#EA4335" />
      </svg>
    );
  }

  // 8. DuckDuckGo
  if (domain.includes('duckduckgo.com') || lowerTitle.includes('duckduckgo')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <circle cx="12" cy="12" r="12" fill="#DE5833" />
        <circle cx="12" cy="12" r="8" fill="#FFFFFF" />
        <path d="M14 9.5C14 10.6 13.1 11.5 12 11.5C10.9 11.5 10 10.6 10 9.5C10 8.4 10.9 7.5 12 7.5C13.1 7.5 14 8.4 14 9.5Z" fill="#F4900C" />
        <circle cx="11.5" cy="9.5" r="1.2" fill="#292F33" />
        <path d="M10 13C8.5 14 7 15 7 16C9 16.5 12 16.5 15 16C16 15 15 13 14 12.5C13 13.5 11 13.5 10 13Z" fill="#5C9E31" />
      </svg>
    );
  }

  // 9. Brave
  if (domain.includes('brave.com') || lowerTitle.includes('brave')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <rect width="24" height="24" rx="6" fill="#FB542B" />
        <path d="M12 4L6 8V14C6 17.5 8.6 20.7 12 21.5C15.4 20.7 18 17.5 18 14V8L12 4ZM12 6.3L16 9V13.8C16 16.4 14.3 18.7 12 19.4C9.7 18.7 8 16.4 8 13.8V9L12 6.3Z" fill="white" />
      </svg>
    );
  }

  // 10. Wikipedia
  if (domain.includes('wikipedia.org') || lowerTitle.includes('wikipedia')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <circle cx="12" cy="12" r="12" fill="#FFFFFF" />
        <path d="M5 8H8L10 15L12 8H14L16 15L18 8H20L17 18H15L13 12L11 18H9L5 8Z" fill="#000000" />
      </svg>
    );
  }

  // 11. Twitch
  if (domain.includes('twitch.tv') || lowerTitle.includes('twitch')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <rect width="24" height="24" rx="6" fill="#9146FF" />
        <path d="M6 5H18V14L15 17H12L10 19V17H6V5ZM11 8H9V13H11V8ZM15 8H13V13H15V8Z" fill="white" />
      </svg>
    );
  }

  // Dynamic Google S2 Favicon service with fallback to clean initial
  const faviconUrl = getFaviconUrl(url);

  return (
    <div 
      className={`relative flex items-center justify-center shrink-0 overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={faviconUrl}
        alt={title || domain}
        className="w-full h-full object-contain rounded-md"
        onError={(e) => {
          // If favicon service fails, fallback to letter avatar badge
          const target = e.currentTarget;
          target.style.display = 'none';
          if (target.nextElementSibling) {
            (target.nextElementSibling as HTMLElement).style.display = 'flex';
          }
        }}
      />
      <div 
        className="hidden w-full h-full rounded-md bg-purple-600/30 border border-purple-500/30 text-purple-200 text-[10px] font-bold items-center justify-center uppercase font-mono"
      >
        {(title || domain || 'G').slice(0, 1)}
      </div>
    </div>
  );
};
