import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { LogOut, User, Flame, Menu } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';

const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/timeline', label: 'Timeline' },
  { path: '/quiz', label: 'Quiz Arena' },
  { path: '/explore', label: 'Saraswati' },
  { path: '/stories', label: 'Stories' },
];

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, karmaPoints, logout } = useStore();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
    toast({
      title: "Farewell, seeker",
      description: "May your journey continue with wisdom.",
    });
    navigate('/');
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/80 border-b border-border"
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-background border border-border shadow-sm overflow-hidden">
              <img
                src={`${import.meta.env.BASE_URL}college-logo.png`}
                alt="College logo"
                className="h-9 w-9 object-contain"
                loading="lazy"
              />
            </div>
            <div className="flex flex-col">
              <motion.span
                className="text-2xl font-cinzel font-bold text-primary leading-none"
                whileHover={{ scale: 1.05 }}
              >
                संस्कृत Spark
              </motion.span>
              <span className="text-xs font-mukta text-muted-foreground">
                R V College of Engineering
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="relative group"
              >
                <span className={`font-mukta text-sm transition-colors ${location.pathname === link.path
                  ? 'text-primary font-semibold'
                  : 'text-foreground hover:text-primary'
                  }`}>
                  {link.label}
                </span>
                {location.pathname === link.path && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
                  />
                )}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {/* Desktop Auth & Karma - Hidden on mobile if needed, or keep minimal */}
            <div className="hidden md:flex items-center gap-4 py-8">
              {isAuthenticated && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-secondary"
                >
                  <Flame className="w-4 h-4 text-primary" />
                  <span className="font-mukta font-semibold text-secondary">
                    {karmaPoints}
                  </span>
                </motion.div>
              )}

              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 border border-primary/50">
                    <span className="text-sm font-mukta font-bold text-primary">
                      {user?.name?.charAt(0).toUpperCase() || 'S'}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="text-muted-foreground hover:text-primary"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Link to="/auth">
                  <Button variant="default" className="font-mukta saffron-glow">
                    Enter Gurukul
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile Menu Trigger */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-primary">
                    <Menu className="w-6 h-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-background/95 backdrop-blur-md border-l border-border">
                  <SheetHeader className="text-left mb-6">
                    <SheetTitle className="font-cinzel text-xl text-primary">Menu</SheetTitle>
                  </SheetHeader>

                  <nav className="flex flex-col gap-6">
                    {navLinks.map((link) => (
                      <SheetClose asChild key={link.path}>
                        <Link
                          to={link.path}
                          className={`font-mukta text-lg transition-colors ${location.pathname === link.path
                            ? 'text-primary font-semibold pl-2 border-l-2 border-primary'
                            : 'text-foreground hover:text-primary'
                            }`}
                        >
                          {link.label}
                        </Link>
                      </SheetClose>
                    ))}

                    <div className="h-px bg-border my-2" />

                    {isAuthenticated ? (
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 border border-primary/50">
                              <span className="text-sm font-mukta font-bold text-primary">
                                {user?.name?.charAt(0).toUpperCase() || 'S'}
                              </span>
                            </div>
                            <span className="font-mukta font-medium">{user?.name}</span>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-secondary">
                            <Flame className="w-4 h-4 text-primary" />
                            <span className="font-mukta font-semibold text-secondary">
                              {karmaPoints}
                            </span>
                          </div>
                        </div>
                        <SheetClose asChild>
                          <Button
                            onClick={handleLogout}
                            variant="outline"
                            className="w-full justify-start text-muted-foreground hover:text-destructive"
                          >
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                          </Button>
                        </SheetClose>
                      </div>
                    ) : (
                      <SheetClose asChild>
                        <Link to="/auth">
                          <Button className="w-full font-mukta saffron-glow">
                            Enter Gurukul
                          </Button>
                        </Link>
                      </SheetClose>
                    )}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </motion.nav >
  );
};
