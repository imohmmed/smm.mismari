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
import { MoreHorizontal, Eye, Star, Globe } from 'lucide-react';

export type Platform = 'all' | 'instagram' | 'youtube' | 'facebook' | 'tiktok' | 'twitter' | 
  'telegram' | 'snapchat' | 'discord' | 'linkedin' | 'google' | 'spotify' | 'twitch' | 'views' | 'ratings' | 'visits';

interface PlatformGridProps {
  selectedPlatform: Platform | null;
  onPlatformSelect: (platform: Platform) => void;
  showAll?: boolean;
}

const platformData: { id: Platform; icon: typeof SiInstagram | typeof MoreHorizontal; color: string; bgColor: string }[] = [
  { id: 'all', icon: MoreHorizontal, color: 'text-white', bgColor: 'bg-gray-700' },
  { id: 'instagram', icon: SiInstagram, color: 'text-white', bgColor: 'bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400' },
  { id: 'facebook', icon: SiFacebook, color: 'text-white', bgColor: 'bg-blue-600' },
  { id: 'youtube', icon: SiYoutube, color: 'text-white', bgColor: 'bg-red-600' },
  { id: 'tiktok', icon: SiTiktok, color: 'text-white', bgColor: 'bg-black dark:bg-zinc-800' },
  { id: 'spotify', icon: SiSpotify, color: 'text-black', bgColor: 'bg-green-500' },
  { id: 'twitch', icon: SiTwitch, color: 'text-white', bgColor: 'bg-purple-600' },
  { id: 'telegram', icon: SiTelegram, color: 'text-white', bgColor: 'bg-sky-500' },
  { id: 'discord', icon: SiDiscord, color: 'text-white', bgColor: 'bg-indigo-600' },
  { id: 'snapchat', icon: SiSnapchat, color: 'text-black', bgColor: 'bg-yellow-400' },
  { id: 'twitter', icon: SiX, color: 'text-white', bgColor: 'bg-black dark:bg-zinc-800' },
  { id: 'linkedin', icon: SiLinkedin, color: 'text-white', bgColor: 'bg-blue-700' },
  { id: 'google', icon: SiGoogle, color: 'text-white', bgColor: 'bg-red-500' },
  { id: 'views', icon: Eye, color: 'text-white', bgColor: 'bg-gray-600' },
  { id: 'ratings', icon: Star, color: 'text-white', bgColor: 'bg-cyan-500' },
  { id: 'visits', icon: Globe, color: 'text-white', bgColor: 'bg-gray-700' },
];

export default function PlatformGrid({ selectedPlatform, onPlatformSelect, showAll = true }: PlatformGridProps) {
  const { t } = useLanguage();

  const platforms = showAll ? platformData : platformData.filter(p => p.id !== 'all');

  return (
    <div className="grid grid-cols-5 gap-3">
      {platforms.map((platform) => {
        const Icon = platform.icon;
        const isSelected = selectedPlatform === platform.id;

        return (
          <button
            key={platform.id}
            onClick={() => onPlatformSelect(platform.id)}
            className={cn(
              "flex flex-col items-center gap-2 p-2 rounded-xl transition-all",
              isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
            )}
            data-testid={`button-platform-${platform.id}`}
          >
            <div className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center shadow-md",
              platform.bgColor
            )}>
              <Icon className={cn("w-7 h-7", platform.color)} />
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
