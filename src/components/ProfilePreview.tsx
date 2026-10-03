import React from "react";
import * as HoverCard from "@radix-ui/react-hover-card";
import { Sparkles, MapPin, ExternalLink } from "lucide-react";
import { InstagramProfile } from "../types";

export const ProfilePreviewContent: React.FC<{ profile: InstagramProfile }> = ({ profile }) => {
  const ai = profile.aiAnalysis;
  const isAnalyzed = profile.isAnalyzed && ai;
  const displayName = ai?.displayName || profile.displayName || profile.username;

  return (
    <>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#FFD13B] border-2 border-[#1C1A17] flex items-center justify-center font-hand font-bold text-sm text-[#1C1A17] uppercase shadow-xs">
            {profile.username.slice(0, 2)}
          </div>
          <div className="flex flex-col">
            <span className="font-bold font-sans text-sm text-[#1C1A17] truncate max-w-[150px]">{displayName}</span>
            <span className="text-[#6B635B] text-xs font-typewriter truncate">@{profile.username}</span>
          </div>
        </div>
        {isAnalyzed && (
          <div className="flex items-center gap-1 bg-[#38B000]/15 border border-[#38B000] text-[#1E6B00] px-2 py-0.5 rounded-lg text-xs font-hand font-bold">
            <Sparkles className="w-3 h-3 text-[#38B000]" />
            <span>AI</span>
          </div>
        )}
      </div>

      {isAnalyzed ? (
        <div className="space-y-2.5">
          <div className="text-xs text-[#4A443E] line-clamp-3 leading-relaxed font-sans">
            {ai.description}
          </div>
          
          <div className="space-y-1.5 pt-1 border-t border-[#EBE5D8]">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-hand font-bold text-[#6B635B] shrink-0 w-16">Ruolo:</span>
              <span className="text-[#E63946] font-hand font-bold truncate">{ai.category} • {ai.studioType}</span>
            </div>
            
            <div className="flex items-center gap-1.5 text-xs text-[#4A443E]">
              <span className="font-hand font-bold text-[#6B635B] shrink-0 w-16">Sede:</span>
              <span className="flex items-center gap-1 truncate font-typewriter text-[11px]">
                <MapPin className="w-3 h-3 text-[#E63946]" />
                {ai.locationCity}{ai.locationCountry !== ai.locationCity ? `, ${ai.locationCountry}` : ''}
              </span>
            </div>
            
            <div className="flex items-start gap-1.5 text-xs text-[#4A443E]">
              <span className="font-hand font-bold text-[#6B635B] shrink-0 w-16 mt-0.5">Stile:</span>
              <span className="line-clamp-2 text-xs">{ai.visualStyle}</span>
            </div>
            
            {ai.designTags && ai.designTags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {ai.designTags.map(tag => (
                  <span key={tag} className="px-2 py-0.5 rounded-md bg-[#FFF] text-[#1C1A17] text-[10px] font-hand font-bold border border-[#1C1A17]">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-xs text-[#8C827A] font-hand italic py-2 text-center">
          Analisi non ancora effettuata nel taccuino.
        </div>
      )}
    </>
  );
};

interface ProfilePreviewProps {
  profile: InstagramProfile;
  children: React.ReactNode;
}

export const ProfilePreview: React.FC<ProfilePreviewProps> = ({ profile, children }) => {
  return (
    <HoverCard.Root openDelay={300} closeDelay={150}>
      <HoverCard.Trigger asChild>
        {children}
      </HoverCard.Trigger>
      
      <HoverCard.Portal>
        <HoverCard.Content
          side="top"
          align="center"
          sideOffset={8}
          className="z-50 w-72 bg-[#FFFDF9] border-2 border-[#1C1A17] rounded-xl shadow-doodle-lg p-4 text-[#1C1A17] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95"
        >
          <ProfilePreviewContent profile={profile} />
          <HoverCard.Arrow className="fill-[#1C1A17]" />
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  );
};
