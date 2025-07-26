import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Badminton Matchmaker",
  description:
    "A web application for generating fair badminton doubles matchups",
  viewport:
    "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <div className="min-h-screen">
          {/* Header */}
          <header className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-2xl">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative container mx-auto px-4 py-4 sm:py-8">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2 sm:mb-4">
                  <div className="text-2xl sm:text-4xl mr-2 sm:mr-4">🏸</div>
                  <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg">
                    Badminton Matchmaker
                  </h1>
                </div>
                <p className="text-sm sm:text-xl text-blue-100 font-medium px-2">
                  Generate fair doubles matchups with smart rotation
                </p>
                <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <div className="glass-effect rounded-full px-4 sm:px-6 py-2">
                    <span className="text-xs sm:text-sm font-medium">
                      ⚡ Smart Algorithm
                    </span>
                  </div>
                  <div className="glass-effect rounded-full px-4 sm:px-6 py-2">
                    <span className="text-xs sm:text-sm font-medium">
                      🎯 Fair Rotation
                    </span>
                  </div>
                  <div className="glass-effect rounded-full px-4 sm:px-6 py-2">
                    <span className="text-xs sm:text-sm font-medium">
                      🏆 Multiple Courts
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-16 sm:w-32 h-16 sm:h-32 bg-white/10 rounded-full -translate-x-8 sm:-translate-x-16 -translate-y-8 sm:-translate-y-16"></div>
            <div className="absolute top-0 right-0 w-12 sm:w-24 h-12 sm:h-24 bg-white/10 rounded-full translate-x-6 sm:translate-x-12 -translate-y-6 sm:-translate-y-12"></div>
            <div className="absolute bottom-0 left-1/4 w-8 sm:w-16 h-8 sm:h-16 bg-white/10 rounded-full translate-y-4 sm:translate-y-8"></div>
          </header>

          {/* Main Content */}
          <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
            <div className="animate-fade-in">{children}</div>
          </main>

          {/* Footer */}
          <footer className="bg-black/20 backdrop-blur-sm text-white text-center py-4 sm:py-6 mt-8 sm:mt-16">
            <div className="container mx-auto px-4">
              <p className="text-sm sm:text-base text-blue-100">
                Made with ❤️ for badminton enthusiasts
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
