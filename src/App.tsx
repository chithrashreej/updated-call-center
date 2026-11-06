import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { ToastProvider } from '@/components/ui/Toast';
import { CallProvider } from '@/context/CallContext';
import { DataProvider } from '@/context/DataContext';
import { LeadsModalProvider } from '@/context/LeadsModalContext';
import { SearchProvider } from '@/context/SearchContext';
import { AuthProvider } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { LandingPage } from '@/pages/LandingPage';
import { SignInPage } from '@/pages/SignInPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { CallsToMakePage } from '@/pages/CallsToMakePage';
import { IncomingCallsPage } from '@/pages/IncomingCallsPage';
import { RecentCallsPage } from '@/pages/RecentCallsPage';
import { CalendarPage } from '@/pages/CalendarPage';
import { PulseHomePage } from '@/pages/PulseHomePage';
import { PulseChannelPage } from '@/pages/PulseChannelPage';
import { LeadsPage } from '@/pages/LeadsPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { SettingsPage } from '@/pages/SettingsPage';

function App() {
  const [search, setSearch] = useState('');
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/signin" element={<SignInPage />} />

            {/* Protected app routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <AppWrapper search={search} onSearchChange={setSearch}>
                    <DashboardPage />
                  </AppWrapper>
                </ProtectedRoute>
              }
            />
            <Route
              path="/plan/calls"
              element={
                <ProtectedRoute>
                  <AppWrapper search={search} onSearchChange={setSearch}>
                    <CallsToMakePage />
                  </AppWrapper>
                </ProtectedRoute>
              }
            />
            <Route
              path="/leads"
              element={
                <ProtectedRoute>
                  <AppWrapper search={search} onSearchChange={setSearch}>
                    <LeadsPage />
                  </AppWrapper>
                </ProtectedRoute>
              }
            />
            <Route
              path="/plan/incoming"
              element={
                <ProtectedRoute>
                  <AppWrapper search={search} onSearchChange={setSearch}>
                    <IncomingCallsPage />
                  </AppWrapper>
                </ProtectedRoute>
              }
            />
            <Route
              path="/plan/recent"
              element={
                <ProtectedRoute>
                  <AppWrapper search={search} onSearchChange={setSearch}>
                    <RecentCallsPage />
                  </AppWrapper>
                </ProtectedRoute>
              }
            />
            <Route
              path="/calendar"
              element={
                <ProtectedRoute>
                  <AppWrapper search={search} onSearchChange={setSearch}>
                    <CalendarPage />
                  </AppWrapper>
                </ProtectedRoute>
              }
            />
            <Route
              path="/pulse"
              element={
                <ProtectedRoute>
                  <AppWrapper search={search} onSearchChange={setSearch}>
                    <PulseHomePage />
                  </AppWrapper>
                </ProtectedRoute>
              }
            />
            <Route
              path="/pulse/:channelId"
              element={
                <ProtectedRoute>
                  <AppWrapper search={search} onSearchChange={setSearch}>
                    <PulseChannelPage />
                  </AppWrapper>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <AppWrapper search={search} onSearchChange={setSearch}>
                    <ProfilePage />
                  </AppWrapper>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <AppWrapper search={search} onSearchChange={setSearch}>
                    <SettingsPage />
                  </AppWrapper>
                </ProtectedRoute>
              }
            />

            {/* Fallbacks */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

interface AppWrapperProps {
  search: string;
  onSearchChange: (v: string) => void;
  children: React.ReactNode;
}

function AppWrapper({ search, onSearchChange, children }: AppWrapperProps) {
  return (
    <DataProvider>
      <CallProvider>
        <LeadsModalProvider>
          <SearchProvider query={search}>
            <AppShell search={search} onSearchChange={onSearchChange}>{children}</AppShell>
          </SearchProvider>
        </LeadsModalProvider>
      </CallProvider>
    </DataProvider>
  );
}

export default App;
