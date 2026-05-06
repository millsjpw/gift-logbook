import Navbar from "./Navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-8">{children}</main>
    </>
  );
}
