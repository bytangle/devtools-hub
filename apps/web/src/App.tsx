import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { WorkspaceProvider } from "@/context/workspace-context";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import Index from "./pages/Index";
import Formatters from "./pages/Formatters";
import Validators from "./pages/Validators";
import Converters from "./pages/Converters";
import Generators from "./pages/Generators";
import GenericToolPage from "./pages/tools/GenericToolPage";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="devtools-theme">
      <TooltipProvider>
        <WorkspaceProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            {/* Main workspace - the multi-tool interface */}
            <Route path="/" element={<WorkspaceLayout />} />
            <Route path="/workspace" element={<WorkspaceLayout />} />
            
            {/* Legacy/SEO routes */}
            <Route path="/home" element={<Index />} />
            <Route path="/formatters" element={<Formatters />} />
            <Route path="/validators" element={<Validators />} />
            <Route path="/converters" element={<Converters />} />
            <Route path="/generators" element={<Generators />} />
            
            {/* All tool pages — rendered inside workspace with SEO meta */}
            <Route path="/tools/:toolId" element={<GenericToolPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </BrowserRouter>
        </WorkspaceProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
