import PublicNavbar from './PublicNavbar';
import PublicFooter from './PublicFooter';

/**
 * PublicLayout — wrapper for all public-facing SaaS marketing pages.
 * Includes sticky Navbar + Footer with legal links.
 */
export default function PublicLayout({ children }) {
    return (
        <div className="min-h-screen bg-black flex flex-col">
            <PublicNavbar />
            <main className="flex-1 pt-16">
                {children}
            </main>
            <PublicFooter />
        </div>
    );
}
