import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { 
  SiInstagram, 
  SiYoutube, 
  SiFacebook, 
  SiTiktok, 
  SiX, 
  SiTelegram, 
  SiSnapchat, 
  SiDiscord, 
  SiLinkedin, 
  SiGoogle, 
  SiSpotify, 
  SiTwitch 
} from 'react-icons/si';
import { MoreHorizontal, Eye } from 'lucide-react';

export type Platform = 'all' | 'instagram' | 'youtube' | 'facebook' | 'tiktok' | 'twitter' | 
  'telegram' | 'snapchat' | 'discord' | 'linkedin' | 'google' | 'spotify' | 'twitch' | 'views' | 'ratings';

interface PlatformGridProps {
  selectedPlatform: Platform | null;
  onPlatformSelect: (platform: Platform) => void;
  showAll?: boolean;
}

const platformData: { id: Platform; icon: typeof SiInstagram | typeof MoreHorizontal; color: string; bgColor: string }[] = [
  { id: 'all', icon: MoreHorizontal, color: 'text-white', bgColor: 'bg-gray-600' },
  { id: 'instagram', icon: SiInstagram, color: 'text-white', bgColor: 'bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400' },
  { id: 'facebook', icon: SiFacebook, color: 'text-white', bgColor: 'bg-blue-600' },
  { id: 'youtube', icon: SiYoutube, color: 'text-white', bgColor: 'bg-red-600' },
  { id: 'tiktok', icon: SiTiktok, color: 'text-white', bgColor: 'bg-black dark:bg-white dark:text-black' },
  { id: 'twitter', icon: SiX, color: 'text-white', bgColor: 'bg-black dark:bg-white dark:text-black' },
  { id: 'telegram', icon: SiTelegram, color: 'text-white', bgColor: 'bg-sky-500' },
  { id: 'twitch', icon: SiTwitch, color: 'text-white', bgColor: 'bg-purple-600' },
  { id: 'discord', icon: SiDiscord, color: 'text-white', bgColor: 'bg-indigo-600' },
  { id: 'snapchat', icon: SiSnapchat, color: 'text-black', bgColor: 'bg-yellow-400' },
  { id: 'spotify', icon: SiSpotify, color: 'text-white', bgColor: 'bg-green-500' },
  { id: 'google', icon: SiGoogle, color: 'text-white', bgColor: 'bg-red-500' },
  { id: 'linkedin', icon: SiLinkedin, color: 'text-white', bgColor: 'bg-blue-700' },
  { id: 'views', icon: Eye, color: 'text-white', bgColor: 'bg-gray-500' },
];

export default function PlatformGrid({ selectedPlatform, onPlatformSelect, showAll = true }: PlatformGridProps) {
  const { t } = useLanguage();

  const platforms = showAll ? platformData : platformData.filter(p => p.id !== 'all');

  return (
    <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-7 gap-3">
      {platforms.map((platform) => {
        const Icon = platform.icon;
        const isSelected = selectedPlatform === platform.id;

        return (
          <button
            key={platform.id}
            onClick={() => onPlatformSelect(platform.id)}
            className={cn(
              "flex flex-col items-center gap-2 p-2 rounded-lg transition-all",
              isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
            )}
            data-testid={`button-platform-${platform.id}`}
          >
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center",
              platform.bgColor,
              platform.id === 'tiktok' && 'dark:bg-white'
            )}>
              <Icon className={cn("w-6 h-6", platform.color, platform.id === 'tiktok' && 'dark:text-black')} />
            </div>
            <span className="text-xs font-medium text-foreground truncate w-full text-center">
              {platform.id === 'all' ? t('allServices') : t(platform.id)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
