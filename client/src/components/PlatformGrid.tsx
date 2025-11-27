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
import { MoreHorizontal, Eye, Star } from 'lucide-react';

export type Platform = 'all' | 'instagram' | 'youtube' | 'facebook' | 'tiktok' | 'twitter' | 
  'telegram' | 'snapchat' | 'discord' | 'linkedin' | 'google' | 'spotify' | 'twitch' | 'views' | 'ratings';

interface PlatformGridProps {
  selectedPlatform: Platform | null;
  onPlatformSelect: (platform: Platform) => void;
  showAll?: boolean;
}

const platformData: { id: Platform; icon: typeof SiInstagram | typeof MoreHorizontal; color: string }[] = [
  { id: 'all', icon: MoreHorizontal, color: 'text-muted-foreground' },
  { id: 'instagram', icon: SiInstagram, color: 'text-pink-500' },
  { id: 'facebook', icon: SiFacebook, color: 'text-blue-500' },
  { id: 'youtube', icon: SiYoutube, color: 'text-red-500' },
  { id: 'tiktok', icon: SiTiktok, color: 'text-foreground' },
  { id: 'spotify', icon: SiSpotify, color: 'text-green-500' },
  { id: 'twitch', icon: SiTwitch, color: 'text-purple-500' },
  { id: 'telegram', icon: SiTelegram, color: 'text-sky-500' },
  { id: 'discord', icon: SiDiscord, color: 'text-indigo-500' },
  { id: 'snapchat', icon: SiSnapchat, color: 'text-yellow-400' },
  { id: 'twitter', icon: SiX, color: 'text-foreground' },
  { id: 'linkedin', icon: SiLinkedin, color: 'text-blue-600' },
  { id: 'google', icon: SiGoogle, color: 'text-red-500' },
  { id: 'views', icon: Eye, color: 'text-muted-foreground' },
  { id: 'ratings', icon: Star, color: 'text-yellow-500' },
];

export default function PlatformGrid({ selectedPlatform, onPlatformSelect, showAll = true }: PlatformGridProps) {
  const { t } = useLanguage();

  const platforms = showAll ? platformData : platformData.filter(p => p.id !== 'all');

  return (
    <div className="grid grid-cols-5 gap-2">
      {platforms.map((platform) => {
        const Icon = platform.icon;
        const isSelected = selectedPlatform === platform.id;

        return (
          <button
            key={platform.id}
            onClick={() => onPlatformSelect(platform.id)}
            className={cn(
              "flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-card border border-border transition-all hover-elevate",
              isSelected && "ring-2 ring-primary border-primary"
            )}
            data-testid={`button-platform-${platform.id}`}
          >
            <Icon className={cn("w-6 h-6", platform.color)} />
            <span className="text-[10px] font-medium text-foreground truncate w-full text-center">
              {platform.id === 'all' ? t('allServices') : t(platform.id)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
