import { AuthProvider } from "@/components/auth-provider";
import { Navbar } from "@/components/navbar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50/50 to-indigo-50/50">
        <Navbar />
        <main className="container max-w-4xl mx-auto px-4 py-8">{children}</main>
      </div>
    </AuthProvider>
  );
}
