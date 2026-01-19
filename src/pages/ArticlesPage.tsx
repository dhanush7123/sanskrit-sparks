import { useState } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { FloatingSanskrit } from '@/components/ui/FloatingSanskrit';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import {
  Sparkles,
  MessageCircle,
  Volume2,
  VolumeX,
  Languages,
} from 'lucide-react';
import Footer from '@/components/layout/Footer';

type StoryMessage = {
  id: string;
  role: 'user' | 'assistant';
  mood?: string;
  prompt?: string;
  sanskrit?: string;
  english?: string;
};

const moods = [
  'Mythological',
  'Adventure',
  'Moral Story',
  'Friendship',
  'Inspiration',
  'Humour',
  'Festival',
  'Nature',
];

const ArticlesPage = () => {
  const [messages, setMessages] = useState<StoryMessage[]>([]);
  const [input, setInput] = useState('');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState<'sanskrit' | 'english'>(
    'sanskrit',
  );
  const [isSpeakingId, setIsSpeakingId] = useState<string | null>(null);

  const speakText = (id: string, text: string, lang: 'sanskrit' | 'english') => {
    if (!('speechSynthesis' in window)) {
      toast({
        title: 'Speech Not Supported',
        description: 'Text-to-speech is not supported in your browser.',
        variant: 'destructive',
      });
      return;
    }

    window.speechSynthesis.cancel();

    if (isSpeakingId === id) {
      setIsSpeakingId(null);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);

    if (lang === 'sanskrit') {
      utterance.lang = 'hi-IN';
      utterance.rate = 0.7;
    } else {
      utterance.lang = 'en-US';
      utterance.rate = 0.85;
    }

    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => setIsSpeakingId(id);
    utterance.onend = () => setIsSpeakingId(null);
    utterance.onerror = () => {
      setIsSpeakingId(null);
      toast({
        title: 'Speech Error',
        description: 'Unable to play audio. Please check your browser settings.',
        variant: 'destructive',
      });
    };

    const voices = window.speechSynthesis.getVoices();
    if (voices.length && lang === 'sanskrit') {
      const hindiVoice = voices.find((v) => v.lang.startsWith('hi'));
      if (hindiVoice) utterance.voice = hindiVoice;
    }

    window.speechSynthesis.speak(utterance);
  };

  const generateStory = async () => {
    const trimmed = input.trim();

    if (!trimmed && !selectedMood) {
      toast({
        title: 'Add a mood or prompt',
        description: 'Choose a genre/mood or type a short idea for the story.',
      });
      return;
    }

    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;

    // Debug logging (remove in production)
    console.log('🔑 API Key check:', {
      exists: !!geminiKey,
      length: geminiKey?.length || 0,
      startsWith: geminiKey?.substring(0, 10) || 'N/A',
    });

    if (!geminiKey || geminiKey.trim() === '') {
      toast({
        title: 'AI not configured',
        description: 'Gemini API key is missing. Add VITE_GEMINI_API_KEY to your .env file',
        variant: 'destructive',
      });
      console.error('❌ VITE_GEMINI_API_KEY is not set in .env file');
      return;
    }

    const userMood = selectedMood || 'Any inspiring story';
    const userPrompt = trimmed || 'Create a good story for this mood.';

    const userMessage: StoryMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      mood: userMood,
      prompt: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const systemPrompt = `You are a Sanskrit literature teacher creating original short stories.

Generate one engaging story in classical but readable Sanskrit, based on the mood/genre and prompt.
Then provide a clear, natural English translation.

Respond ONLY in strict JSON of the form:
{
  "sanskrit": "...",
  "english": "..."
}

Do not add any extra keys, markdown, or commentary.`;

      const promptText = `Mood / Genre: ${userMood}
User prompt (optional): ${userPrompt}`;

      console.log('🔄 Calling Gemini API...');

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: systemPrompt + "\n\n" + promptText
            }]
          }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.7,
            maxOutputTokens: 2000,
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = (errorData as any)?.error?.message || `HTTP ${response.status}`;
        console.error('❌ Gemini API Error:', errorMsg);
        throw new Error(
          `Gemini API Error: ${errorMsg}\n\n` +
          `SOLUTION:\n` +
          `1. Verify your Gemini API key is valid\n` +
          `2. Check your usage limits\n` +
          `3. Go to https://aistudio.google.com/app/apikey\n` +
          `4. Update VITE_GEMINI_API_KEY in your .env file`
        );
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

      if (!rawText) {
        throw new Error('Gemini response was empty.');
      }

      let sanskrit = '';
      let english = '';

      try {
        const parsed = JSON.parse(rawText);
        sanskrit = parsed.sanskrit || '';
        english = parsed.english || '';
      } catch (e) {
        console.warn("JSON parse failed, trying fallback parsing", e);
        // Fallback if JSON mode fails or returns markdown
        const cleanedText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        try {
          const parsed = JSON.parse(cleanedText);
          sanskrit = parsed.sanskrit || '';
          english = parsed.english || '';
        } catch {
          // Second fallback: simple splitter
          const marker = '\n\nEnglish:';
          if (rawText.includes(marker)) {
            const [sa, en] = rawText.split(marker);
            sanskrit = sa.trim();
            english = en.trim();
          } else {
            sanskrit = rawText;
          }
        }
      }

      if (!sanskrit) {
        throw new Error('AI response did not include Sanskrit text.');
      }

      const aiMessage: StoryMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        mood: userMood,
        prompt: userPrompt,
        sanskrit,
        english,
      };

      setMessages((prev) => [...prev, aiMessage]);
      setActiveLanguage('sanskrit');
      setInput('');

      toast({
        title: 'Story created',
        description: 'A new story has been woven for your chosen mood.',
      });
    } catch (error: any) {
      console.error('Story generation error:', error);

      const errorMsg = error?.message || 'Unknown error occurred';

      toast({
        title: 'Something went wrong',
        description: errorMsg.length > 150 ? errorMsg.substring(0, 150) + '...' : errorMsg,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen vedic-gradient relative">
      <FloatingSanskrit count={8} />
      <Navbar />

      <div className="pt-28 pb-16 px-4">
        <div className="container mx-auto max-w-5xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <h1 className="text-4xl md:text-5xl font-cinzel font-bold text-foreground mb-3">
              कथा कुक्षिः
            </h1>
            <p className="font-mukta text-muted-foreground max-w-2xl mx-auto">
              Choose a mood or genre, whisper a theme, and let the AI create a fresh
              Sanskrit tale with a flowing English translation.
            </p>
          </motion.div>

          {/* Mood / Genre chips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6"
          >
            <div className="flex items-center justify-between gap-4 flex-wrap mb-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-secondary" />
                <span className="font-mukta text-sm text-muted-foreground">
                  Tap a mood or type your own idea.
                </span>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={activeLanguage === 'sanskrit' ? 'default' : 'outline'}
                  className="flex items-center gap-1"
                  onClick={() => setActiveLanguage('sanskrit')}
                >
                  <Languages className="w-3 h-3" />
                  <span className="text-xs">Sanskrit</span>
                </Button>
                <Button
                  size="sm"
                  variant={activeLanguage === 'english' ? 'default' : 'outline'}
                  className="flex items-center gap-1"
                  onClick={() => setActiveLanguage('english')}
                >
                  <Languages className="w-3 h-3" />
                  <span className="text-xs">English</span>
                </Button>
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {moods.map((mood) => (
                <button
                  key={mood}
                  type="button"
                  onClick={() =>
                    setSelectedMood((prev) => (prev === mood ? null : mood))
                  }
                  className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-mukta border transition-colors ${selectedMood === mood
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card/70 text-foreground border-border hover:bg-card'
                    }`}
                >
                  {mood}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Chat area */}
          <div className="talapatra-card p-4 md:p-6 mb-6 h-[60vh] flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground gap-3">
                  <Sparkles className="w-8 h-8 text-secondary" />
                  <p className="font-mukta text-sm">
                    Start by choosing a mood like <span className="font-semibold">Mythological</span> or <span className="font-semibold">Adventure</span>, then click&nbsp;
                    <span className="font-semibold">Generate Story</span>.
                  </p>
                </div>
              )}

              {messages.map((msg) => {
                if (msg.role === 'user') {
                  return (
                    <div
                      key={msg.id}
                      className="flex justify-end text-right"
                    >
                      <div className="max-w-[80%] rounded-2xl bg-primary text-primary-foreground px-4 py-3 shadow-sm">
                        <div className="text-[11px] uppercase tracking-wide opacity-80 mb-1 font-mukta">
                          Mood: {msg.mood}
                        </div>
                        <div className="text-sm font-mukta">
                          {msg.prompt || 'Generate a story for this mood.'}
                        </div>
                      </div>
                    </div>
                  );
                }

                const textToShow =
                  activeLanguage === 'sanskrit'
                    ? msg.sanskrit
                    : msg.english || msg.sanskrit;

                return (
                  <div key={msg.id} className="flex justify-start">
                    <div className="max-w-[85%] rounded-2xl bg-card px-4 py-3 border border-border shadow-sm">
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <div className="text-[11px] uppercase tracking-wide text-secondary font-mukta">
                          Story • {msg.mood}
                        </div>
                        {textToShow && (
                          <button
                            type="button"
                            onClick={() =>
                              speakText(
                                msg.id,
                                textToShow,
                                activeLanguage,
                              )
                            }
                            className="text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {isSpeakingId === msg.id ? (
                              <VolumeX className="w-4 h-4" />
                            ) : (
                              <Volume2 className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                      <div
                        className={`font-mukta leading-relaxed whitespace-pre-line text-sm md:text-[0.95rem] ${activeLanguage === 'sanskrit'
                          ? 'text-foreground'
                          : 'text-foreground/90'
                          }`}
                      >
                        {textToShow}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Input area */}
          <div className="talapatra-card p-4 md:p-5">
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-end">
              <div className="flex-1">
                <label className="block text-xs font-mukta text-muted-foreground mb-1">
                  Optional theme or characters
                </label>
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="e.g. A wise sage guiding two confused students in a modern city..."
                  className="font-mukta text-sm bg-background/80"
                  rows={3}
                />
              </div>
              <div className="flex flex-col gap-2 w-full md:w-auto md:min-w-[170px]">
                <Button
                  onClick={generateStory}
                  disabled={isLoading}
                  className="w-full saffron-glow flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  {isLoading ? 'Weaving story...' : 'Generate Story'}
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-xs font-mukta"
                  onClick={() => {
                    setMessages([]);
                    setInput('');
                    setSelectedMood(null);
                  }}
                >
                  Clear conversation
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer variant="simple" />
    </div>
  );
};

export default ArticlesPage;
