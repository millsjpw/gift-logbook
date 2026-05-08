import Navbar from "./Navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        {children}
      </main>
      <footer className="bg-gray-300 text-gray-400 px-6 py-2 text-left text-xs">
        v{APP_VERSION}
      </footer>
    </div>
  );
}
