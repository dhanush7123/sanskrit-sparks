interface FooterProps {
    variant?: 'default' | 'simple';
}

const Footer = ({ variant = 'default' }: FooterProps) => {
    return (
        <footer className="py-10 px-4 border-t border-border relative z-20 bg-background/50 backdrop-blur-sm">
            <div className="container mx-auto text-center space-y-4 max-w-4xl">
                {variant === 'default' && (
                    <p className="font-mukta text-muted-foreground text-sm leading-relaxed">
                        Website by <span className="text-foreground font-semibold">Dhanush L.</span> &amp; <span className="text-foreground font-semibold">Avinash V. J.</span>
                        <br />
                        Guided by <span className="text-foreground font-semibold">Dr. Veena Divya Krishnappa</span> and <span className="text-foreground font-semibold">Dr. Rohini S. Hallikar</span>
                        <br />
                        <span className="text-foreground">Dept of ECE, RVCE, Bengaluru 560059</span>
                    </p>
                )}
                <p className="font-mukta text-muted-foreground text-sm">
                    © 2026 Sanskrit Spark
                </p>
            </div>
        </footer>
    );
};

export default Footer;
