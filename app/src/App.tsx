import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { AuthProvider, useAuth } from "./context/AuthContext";
import type { JSX } from "react/jsx-dev-runtime";
import MyPeople from "./pages/MyPeople";
import MyLists from "./pages/MyLists";
import ListView from "./pages/ListView";
import GiftExchanges from "./pages/GiftExchanges";
import GiftExchangeView from "./pages/GiftExchangeView";
import Logbook from "./pages/Logbook";

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        Loading…
      </div>
    );
  }
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/people"
            element={
              <ProtectedRoute>
                <MyPeople />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lists"
            element={
              <ProtectedRoute>
                <MyLists />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lists/:id"
            element={
              <ProtectedRoute>
                <ListView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gift-exchanges"
            element={
              <ProtectedRoute>
                <GiftExchanges />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gift-exchanges/:id"
            element={
              <ProtectedRoute>
                <GiftExchangeView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/logbook"
            element={
              <ProtectedRoute>
                <Logbook />
              </ProtectedRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
        <SpeedInsights />
        <Analytics />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
