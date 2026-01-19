export const CornerLogo = () => (
  <div className="fixed top-6 left-4 z-40 pointer-events-none">
    <div className="bg-background/85 border border-border/60 rounded-lg shadow-md backdrop-blur-md px-2 py-1">
      <img
        src="/college-logo.png"
        alt="College logo"
        className="h-10 w-auto object-contain"
        loading="lazy"
      />
    </div>
  </div>
);
