import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";
import { OfflineIndicator } from "./components/OfflineIndicator";
import { usePushNotificationsInit } from "./hooks/usePushNotificationsInit";
import { BottomNav } from "@/components/BottomNav";
import { useTranslation } from "./hooks/useTranslation";
import { useState, useEffect, lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { PromptDialog } from "./components/PromptDialog";
import { ReminderNotifications } from "./components/ReminderNotifications";

// Code splitting - lazy load pages
const Home = lazy(() => import("./pages/Home"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Admin = lazy(() => import("./pages/Admin"));
const PaintEditorScreen = lazy(() => import("./pages/PaintEditorPage").then(m => ({ default: m.PaintEditorScreen })));
const FotografaScreenComponent = lazy(() => import("./pages/FotografaScreen").then(m => ({ default: m.FotografaScreen })));
const MyPreventivesScreenComponent = lazy(() => import("./components/MyPreventivesScreen"));
const MyPreventivesScreenRoute = () => (
  <MyPreventivesScreenComponent />
);

const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const PreventivesHistory = lazy(() => import("./pages/PreventivesHistory"));
const Install = lazy(() => import("./pages/Install"));
const InspirazioneDCPage = lazy(() => import("./pages/InspirazioneDCPage"));
const PreventiveDetailsPage = lazy(() => import("./pages/PreventiveDetailsPage"));

const DashboardScreen = lazy(() => import("./components/DashboardScreen"));
const CreatePreventivePage = lazy(() => import("./pages/CreatePreventivePage"));
const Impostazioni = lazy(() => import("./pages/Impostazioni"));

// Loading fallback
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen bg-background">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);


function Router() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Switch>
        <Route path="/ispirazione-dc" component={InspirazioneDCPage} />
        <Route path="/create-Preventivi" component={CreatePreventivePage} />
        <Route path={"/"}>
          <Home />
        </Route>
        <Route path={"/install"} component={Install} />
        <Route path={"/paint-editor"} component={() => <PaintEditorScreen onBack={() => window.location.href = '/'} />} />
        <Route path={"/fotografa"} component={() => <FotografaScreenComponent onBack={() => window.location.href = '/'} />} />
        <Route path={"/my-preventives"} component={MyPreventivesScreenRoute} />
         <Route path="/dashboard" component={DashboardScreen} />
        <Route path="/Preventivi/:id" component={PreventiveDetailsPage} />
        <Route path="/admin" component={Admin} />
        <Route path="/admin/dashboard" component={AdminDashboard} />
        <Route path="/impostazioni" component={Impostazioni} />
        <Route path="/preventives" component={PreventivesHistory} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  usePushNotificationsInit();
  const { t } = useTranslation();
  const [location] = useLocation();

  // Determine active screen from URL for BottomNav highlighting
  const getActiveScreen = () => {
    if (location === "/paint-editor") return "paint-editor";
    if (location === "/my-preventives") return "my-preventives";
    // Check query params for internal screens
    const params = new URLSearchParams(window.location.search);
    const screenParam = params.get('screen');
    if (screenParam) return screenParam;
    return "home";
  };

  const [activeScreen, setActiveScreen] = useState(getActiveScreen);

  useEffect(() => {
    setActiveScreen(getActiveScreen());
  }, [location]);

  // Listen for URL changes (popstate)
  useEffect(() => {
    const handlePopState = () => setActiveScreen(getActiveScreen());
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Hide BottomNav on /ispirazione-dc (full-screen AI page)
  const shouldHideBottomNav = location === "/ispirazione-dc";

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" switchable>
        <TooltipProvider>
          <Toaster />
          <PromptDialog />
          <ReminderNotifications />
          <PWAInstallPrompt location={location} />
          <OfflineIndicator />
          <div className="flex flex-col min-h-screen">
            <div className="flex-1">
              <Router />
            </div>
            {!shouldHideBottomNav && (
              <BottomNav active={activeScreen as any} onNavigate={() => {}} t={t} setScreen={() => {}} router={undefined} />
            )}
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
