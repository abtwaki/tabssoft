import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./store/AuthContext";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AppLayout from "./components/AppLayout";

import Home from "./pages/public/Home";
import About from "./pages/public/About";
import Services from "./pages/public/Services";
import Contact from "./pages/public/Contact";
import Blog from "./pages/public/Blog";
import BlogPost from "./pages/public/BlogPost";
import Pricing from "./pages/public/Pricing";
import Privacy from "./pages/public/Privacy";

import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";

import Dashboard from "./pages/app/Dashboard";
import ToolPage from "./pages/app/ToolPage";
import Documents from "./pages/app/Documents";
import Billing from "./pages/app/Billing";
import BillingCallback from "./pages/app/BillingCallback";
import Settings from "./pages/app/Settings";

const AdminOverview = lazy(() => import("./pages/admin/AdminOverview"));
const AdminSubscribers = lazy(() => import("./pages/admin/AdminSubscribers"));
const AdminTemplates = lazy(() => import("./pages/admin/AdminTemplates"));
const AdminBlog = lazy(() => import("./pages/admin/AdminBlog"));

const Loader = (
  <div style={{ minHeight: "50vh", display: "grid", placeItems: "center" }}>
    <div className="spinner dark" style={{ width: 30, height: 30 }} />
  </div>
);

function Protected({ children, staff = false }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div style={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
        <div className="spinner dark" style={{ width: 34, height: 34 }} />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (staff && !user.is_staff) return <Navigate to="/app" replace />;
  return children;
}

function PublicPage({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public site */}
      <Route path="/" element={<PublicPage><Home /></PublicPage>} />
      <Route path="/about" element={<PublicPage><About /></PublicPage>} />
      <Route path="/services" element={<PublicPage><Services /></PublicPage>} />
      <Route path="/pricing" element={<PublicPage><Pricing /></PublicPage>} />
      <Route path="/blog" element={<PublicPage><Blog /></PublicPage>} />
      <Route path="/blog/:slug" element={<PublicPage><BlogPost /></PublicPage>} />
      <Route path="/contact" element={<PublicPage><Contact /></PublicPage>} />
      <Route path="/privacy" element={<PublicPage><Privacy /></PublicPage>} />

      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* AI Suite app */}
      <Route path="/app" element={<Protected><AppLayout /></Protected>}>
        <Route index element={<Dashboard />} />
        <Route path="tools/:toolKey" element={<ToolPage />} />
        <Route path="documents" element={<Documents />} />
        <Route path="billing" element={<Billing />} />
        <Route path="billing/callback" element={<BillingCallback />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Staff CMS — lazy-loaded (charts stay out of the main bundle) */}
      <Route path="/admin" element={<Protected staff><AppLayout admin /></Protected>}>
        <Route index element={<Suspense fallback={Loader}><AdminOverview /></Suspense>} />
        <Route path="subscribers" element={<Suspense fallback={Loader}><AdminSubscribers /></Suspense>} />
        <Route path="templates" element={<Suspense fallback={Loader}><AdminTemplates /></Suspense>} />
        <Route path="blog" element={<Suspense fallback={Loader}><AdminBlog /></Suspense>} />
      </Route>

      <Route path="*" element={<PublicPage><NotFound /></PublicPage>} />
    </Routes>
  );
}

function NotFound() {
  return (
    <div className="container section center">
      <h1 className="section-title">Page not found</h1>
      <p className="section-lede" style={{ margin: "0 auto 28px" }}>
        The page you're looking for doesn't exist.
      </p>
      <a className="btn btn-primary" href="/">Back to home</a>
    </div>
  );
}
