import Navbar from "./Navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        {children}
      </main>
      <footer className="bg-gray-300 dark:bg-gray-800 text-gray-400 dark:text-gray-500 px-6 py-2 text-right text-xs">
        v{APP_VERSION}
      </footer>
    </div>
  );
}
