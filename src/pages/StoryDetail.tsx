import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { FloatingSanskrit } from '@/components/ui/FloatingSanskrit';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Volume2, VolumeX, Languages } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import navarasaStories from '@/data/navarasa-stories.json';

const StoryDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [language, setLanguage] = useState<'english' | 'sanskrit'>('english');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);

    const story = navarasaStories.find((s) => s.id === parseInt(id || '0'));

    useEffect(() => {
        // Cleanup speech on unmount
        return () => {
            window.speechSynthesis.cancel();
        };
    }, []);

    if (!story) {
        return (
            <div className="min-h-screen vedic-gradient relative flex items-center justify-center">
                <Navbar />
                <div className="text-center">
                    <h1 className="text-4xl font-cinzel text-foreground mb-4">Story Not Found</h1>
                    <Button onClick={() => navigate('/stories')}>
                        Back to Stories
                    </Button>
                </div>
            </div>
        );
    }

    const hasContent = story.contentEnglish && story.contentEnglish !== '[Story content to be provided]';

    const toggleLanguage = () => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setLanguage(prev => prev === 'english' ? 'sanskrit' : 'english');
    };

    const speakText = () => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            setCurrentUtterance(null);
            return;
        }

        if (!hasContent) {
            toast({
                title: "Story Not Available",
                description: "This story content will be added soon.",
                variant: "destructive",
            });
            return;
        }

        // Create text from HTML content
        const content = language === 'english' ? story.contentEnglish : story.contentSanskrit;
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content || '';
        const text = tempDiv.textContent || tempDiv.innerText || '';

        const utterance = new SpeechSynthesisUtterance(text);

        // Voice selection logic
        const voices = window.speechSynthesis.getVoices();

        if (language === 'sanskrit') {
            // Try to find Sanskrit voice, fallback to Hindi, then generic India
            const sanskritVoice = voices.find(v => v.lang.includes('sa-IN'));
            const hindiVoice = voices.find(v => v.lang.includes('hi-IN'));

            if (sanskritVoice) {
                utterance.voice = sanskritVoice;
                utterance.lang = 'sa-IN';
                utterance.rate = 0.8;
            } else if (hindiVoice) {
                utterance.voice = hindiVoice;
                utterance.lang = 'hi-IN';
                utterance.rate = 0.8;
                console.log('Using Hindi voice fallback for Sanskrit');
            } else {
                // Last resort fallback
                utterance.lang = 'hi-IN';
            }
        } else {
            utterance.lang = 'en-US';
            utterance.rate = 0.9;
        }

        utterance.pitch = 1;
        utterance.volume = 1;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
            setIsSpeaking(false);
            setCurrentUtterance(null);
        };
        utterance.onerror = (event) => {
            console.error('Speech error:', event);
            setIsSpeaking(false);
            setCurrentUtterance(null);

            // Don't show toast for 'interrupted' or 'canceled' errors which happen normally
            if (event.error !== 'interrupted' && event.error !== 'canceled') {
                toast({
                    title: "Audio Issue",
                    description: "Could not play audio. Please check if your system supports this language.",
                    variant: "destructive",
                });
            }
        };

        setCurrentUtterance(utterance);
        window.speechSynthesis.speak(utterance);
    };

    const currentContent = language === 'english' ? story.contentEnglish : story.contentSanskrit;

    return (
        <div className="min-h-screen vedic-gradient relative">
            <FloatingSanskrit count={6} />
            <Navbar />

            <div className="pt-24 pb-16 px-4">
                <div className="container mx-auto max-w-4xl">
                    {/* Back Button */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mb-6"
                    >
                        <Button
                            variant="ghost"
                            onClick={() => navigate('/stories')}
                            className="gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Stories
                        </Button>
                    </motion.div>

                    {/* Story Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        {/* Rasa Badge */}
                        <div className="flex justify-center mb-6">
                            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-primary/10 border-2 border-primary/30">
                                <span className="text-4xl">{story.emoji}</span>
                                <div className="text-left">
                                    <p className="font-cinzel text-xl font-bold text-foreground">
                                        {story.rasaSanskrit}
                                    </p>
                                    <p className="font-mukta text-sm text-muted-foreground">
                                        {story.rasaEnglish}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Story Title */}
                        <h1 className="text-3xl md:text-5xl font-cinzel font-bold text-foreground mb-3">
                            {story.storyTitle}
                        </h1>
                        <p className="text-xl font-mukta text-foreground/80 mb-4">
                            {story.storyTitleSanskrit}
                        </p>
                        <p className="font-mukta text-muted-foreground max-w-2xl mx-auto">
                            {story.description}
                        </p>
                    </motion.div>

                    {/* Language and Audio Controls */}
                    {hasContent && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="flex flex-wrap items-center justify-center gap-3 mb-8"
                        >
                            {/* Language Toggle */}
                            <Button
                                onClick={toggleLanguage}
                                variant="outline"
                                className="gap-2 border-primary/40 hover:bg-primary/10"
                            >
                                <Languages className="w-4 h-4" />
                                {language === 'english' ? 'Switch to संस्कृत' : 'Switch to English'}
                            </Button>

                            {/* Audio Button */}
                            <Button
                                onClick={speakText}
                                className="gap-2"
                                variant={isSpeaking ? "destructive" : "default"}
                            >
                                {isSpeaking ? (
                                    <>
                                        <VolumeX className="w-4 h-4" />
                                        Stop Reading
                                    </>
                                ) : (
                                    <>
                                        <Volume2 className="w-4 h-4" />
                                        Listen to Story
                                    </>
                                )}
                            </Button>
                        </motion.div>
                    )}

                    {/* Story Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="talapatra-card p-8 md:p-12 border-l-4 border-primary"
                    >
                        <div className="relative z-10">
                            {hasContent ? (
                                <div
                                    className={`prose prose-lg max-w-none font-mukta text-foreground/90 leading-relaxed ${language === 'sanskrit' ? 'text-xl' : ''
                                        }`}
                                    dangerouslySetInnerHTML={{ __html: currentContent || '' }}
                                />
                            ) : (
                                <div className="text-center py-12">
                                    <div className="inline-block p-6 rounded-2xl mb-6 bg-primary/10">
                                        <span className="text-6xl">{story.emoji}</span>
                                    </div>
                                    <p className="text-xl font-cinzel text-muted-foreground mb-4">
                                        Story Coming Soon
                                    </p>
                                    <p className="text-sm font-mukta text-muted-foreground max-w-md mx-auto">
                                        This beautiful tale embodying <span className="text-primary font-semibold">{story.rasa}</span> will be added shortly.
                                        Each story is being carefully curated to showcase the essence of its rasa.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Decorative accent */}
                        <div className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none bg-gradient-to-br from-primary to-secondary" />
                    </motion.div>

                    {/* Rasa Info Box */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-12"
                    >
                        <div className="bg-background/40 backdrop-blur-sm border border-primary/20 rounded-xl p-6">
                            <div className="flex items-start gap-4">
                                <div className="text-4xl">{story.emoji}</div>
                                <div>
                                    <h3 className="font-cinzel text-lg font-bold text-foreground mb-2">
                                        About {story.rasa} Rasa
                                    </h3>
                                    <p className="font-mukta text-sm text-muted-foreground">
                                        <span className="font-semibold text-primary">
                                            {story.rasaSanskrit}
                                        </span>{' '}
                                        ({story.rasaEnglish}) is one of the nine fundamental emotional essences in
                                        Sanskrit aesthetics. This rasa evokes feelings of {story.rasaEnglish.toLowerCase()}
                                        in the audience through artistic expression.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
            <Footer variant="simple" />
        </div>
    );
};

export default StoryDetail;
