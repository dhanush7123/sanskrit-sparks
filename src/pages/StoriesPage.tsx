import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { FloatingSanskrit } from '@/components/ui/FloatingSanskrit';
import navarasaStories from '@/data/navarasa-stories.json';

const StoriesPage = () => {
    return (
        <div className="min-h-screen vedic-gradient relative">
            <FloatingSanskrit count={8} />
            <Navbar />

            <div className="pt-24 md:pt-32 pb-16 px-4">
                <div className="container mx-auto max-w-6xl">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <h1 className="text-4xl md:text-6xl font-cinzel font-bold text-foreground mb-4">
                            नवरस कथाएं
                        </h1>
                        <p className="text-xl md:text-2xl font-cinzel text-secondary mb-2">
                            Navarasa Stories
                        </p>
                        <p className="font-mukta text-muted-foreground max-w-2xl mx-auto">
                            Explore the nine emotional essences through timeless tales
                        </p>
                    </motion.div>

                    {/* Story Cards Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {navarasaStories.map((story, index) => (
                            <motion.div
                                key={story.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Link to={`/stories/${story.id}`}>
                                    <motion.div
                                        className="talapatra-card h-full cursor-pointer overflow-hidden border-primary/20"
                                        whileHover={{ scale: 1.03, y: -5 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <div className="relative z-10 p-6">
                                            {/* Rasa Badge */}
                                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 bg-primary/10 border border-primary/20">
                                                <span className="text-2xl">{story.emoji}</span>
                                                <div className="text-left">
                                                    <p className="font-cinzel text-sm font-semibold text-foreground">
                                                        {story.rasaSanskrit}
                                                    </p>
                                                    <p className="font-mukta text-xs text-muted-foreground">
                                                        {story.rasaEnglish}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Story Title */}
                                            <h3 className="font-cinzel text-xl font-bold text-foreground mb-2 leading-tight">
                                                {story.storyTitle}
                                            </h3>

                                            {/* Sanskrit Title */}
                                            <p className="font-mukta text-sm text-foreground/80 mb-3">
                                                {story.storyTitleSanskrit}
                                            </p>

                                            {/* Description */}
                                            <p className="font-mukta text-sm text-muted-foreground line-clamp-2">
                                                {story.description}
                                            </p>

                                            {/* Read More Indicator */}
                                            <div className="mt-4 flex items-center gap-2 text-primary text-sm font-mukta">
                                                <span>Read Story</span>
                                                <span>→</span>
                                            </div>
                                        </div>

                                        {/* Decorative gradient overlay */}
                                        <div className="absolute inset-0 opacity-5 pointer-events-none bg-gradient-to-br from-primary to-secondary" />
                                    </motion.div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>

                    {/* Info Box */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="mt-16 text-center"
                    >
                        <div className="talapatra-card p-8 max-w-3xl mx-auto">
                            <div className="relative z-10">
                                <h3 className="font-cinzel text-2xl text-foreground mb-3">
                                    About Navarasa
                                </h3>
                                <p className="font-mukta text-muted-foreground leading-relaxed">
                                    Navarasa, meaning "nine emotions," are the fundamental emotional essences
                                    in Sanskrit aesthetics. Each rasa represents a specific human emotion that
                                    can be evoked through art, music, dance, and storytelling. These timeless
                                    tales embody each rasa, offering profound insights into the human experience.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
            <Footer variant="simple" />
        </div>
    );
};

export default StoriesPage;
