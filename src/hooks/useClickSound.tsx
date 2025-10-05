import { useAudio } from '@/contexts/AudioContext';

export const useClickSound = () => {
    const { playButtonClick } = useAudio();

    const handleClick = (callback?: () => void) => {
        return (e: React.MouseEvent) => {
            playButtonClick();
            callback?.();
        };
    };

    return { playButtonClick, handleClick };
};