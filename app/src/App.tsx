import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { isAuthenticated } from './api/auth';
import type { JSX } from 'react/jsx-dev-runtime';
import MyPeople from './pages/MyPeople';
import MyLists from './pages/MyLists';
import ListView from './pages/ListView';

function ProtectedRoute({ children }: { children: JSX.Element }) {
  return isAuthenticated() ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/people" element={
          <ProtectedRoute>
            <MyPeople />
          </ProtectedRoute>
        } />
        <Route path="/lists" element={
          <ProtectedRoute>
            <MyLists />
          </ProtectedRoute>
        } />
        <Route path="/lists/:id" element={
          <ProtectedRoute>
            <ListView />
          </ProtectedRoute>
        } />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;