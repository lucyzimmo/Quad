import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { CreateMarket } from "./screens/create_market";
import { ResolveMarket } from "./screens/resolve_market.tsx";
import { MarketDetail } from "./screens/market_detail";
import { Leaderboard } from "./screens/leaderboard";
import { Login } from "./screens/auth/login";
import { Signup } from "./screens/auth/signup";
import { Profile } from "./screens/profile";
import { PublicProfile } from "./screens/public_profile";
import { SetupProfile } from "./screens/auth/setup_profile";
import { Markets } from "./screens/markets";
import { About } from "./screens/about";
import { BetConfirmation } from "./screens/bet_confirmation";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminDashboard } from "./screens/admin-dashboard";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/markets" replace />} />

          {/* Protected Routes */}
          <Route
            path="/markets"
            element={
              <ProtectedRoute>
                <Markets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/market/:id"
            element={
              <ProtectedRoute>
                <MarketDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create"
            element={
              <ProtectedRoute>
                <CreateMarket />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resolve/:id"
            element={
              <ProtectedRoute>
                <ResolveMarket />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:userId"
            element={
              <ProtectedRoute>
                <PublicProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <Leaderboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bet-confirmation"
            element={
              <ProtectedRoute>
                <BetConfirmation />
              </ProtectedRoute>
            }
          />

          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/setup-profile" element={<SetupProfile />} />
          <Route path="/about" element={<About />} />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
