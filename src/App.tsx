import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { WorkspaceProvider } from "@/context/workspace-context";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import Index from "./pages/Index";
import Formatters from "./pages/Formatters";
import Validators from "./pages/Validators";
import Converters from "./pages/Converters";
import Generators from "./pages/Generators";
import JsonFormatter from "./pages/tools/JsonFormatter";
import HtmlFormatter from "./pages/tools/HtmlFormatter";
import CssFormatter from "./pages/tools/CssFormatter";
import SqlFormatter from "./pages/tools/SqlFormatter";
import Base64Encoder from "./pages/tools/Base64Encoder";
import Base64Decoder from "./pages/tools/Base64Decoder";
import PasswordGenerator from "./pages/tools/PasswordGenerator";
import UuidGenerator from "./pages/tools/UuidGenerator";
import HashGenerator from "./pages/tools/HashGenerator";
import UrlEncoder from "./pages/tools/UrlEncoder";
import UrlDecoder from "./pages/tools/UrlDecoder";
import CssValidator from "./pages/tools/CssValidator";
import HtmlValidator from "./pages/tools/HtmlValidator";
import JsonValidator from "./pages/tools/JsonValidator";
import ColorPicker from "./pages/tools/ColorPicker";
import ImageOptimizer from "./pages/tools/ImageOptimizer";
import QrGenerator from "./pages/tools/QrGenerator";
import TimestampConverter from "./pages/tools/TimestampConverter";
import RegexTester from "./pages/tools/RegexTester";
import UrlShortener from "./pages/tools/UrlShortener";
import TextCounter from "./pages/tools/TextCounter";
import DiffChecker from "./pages/tools/DiffChecker";
import LoremGenerator from "./pages/tools/LoremGenerator";
import MarkdownPreview from "./pages/tools/MarkdownPreview";
import JwtDecoder from "./pages/tools/JwtDecoder";
import CssMinifier from "./pages/tools/CssMinifier";
import JsMinifier from "./pages/tools/JsMinifier";
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
            {/* Main workspace - the new multi-tool interface */}
            <Route path="/" element={<WorkspaceLayout />} />
            <Route path="/workspace" element={<WorkspaceLayout />} />
            
            {/* Legacy/SEO routes - redirect to workspace or keep for SEO */}
            <Route path="/home" element={<Index />} />
            <Route path="/formatters" element={<Formatters />} />
            <Route path="/validators" element={<Validators />} />
            <Route path="/converters" element={<Converters />} />
            <Route path="/generators" element={<Generators />} />
            
            {/* Individual tool pages (SEO-friendly, can also open in workspace) */}
            <Route path="/tools/json-formatter" element={<JsonFormatter />} />
            <Route path="/tools/html-formatter" element={<HtmlFormatter />} />
            <Route path="/tools/css-formatter" element={<CssFormatter />} />
            <Route path="/tools/sql-formatter" element={<SqlFormatter />} />
            <Route path="/tools/base64-encode" element={<Base64Encoder />} />
            <Route path="/tools/base64-decode" element={<Base64Decoder />} />
            <Route path="/tools/password-generator" element={<PasswordGenerator />} />
            <Route path="/tools/uuid-generator" element={<UuidGenerator />} />
            <Route path="/tools/hash-generator" element={<HashGenerator />} />
            <Route path="/tools/url-encode" element={<UrlEncoder />} />
            <Route path="/tools/url-decode" element={<UrlDecoder />} />
            <Route path="/tools/css-validator" element={<CssValidator />} />
            <Route path="/tools/html-validator" element={<HtmlValidator />} />
            <Route path="/tools/json-validator" element={<JsonValidator />} />
            <Route path="/tools/color-picker" element={<ColorPicker />} />
            <Route path="/tools/image-optimizer" element={<ImageOptimizer />} />
            <Route path="/tools/qr-generator" element={<QrGenerator />} />
            <Route path="/tools/timestamp-converter" element={<TimestampConverter />} />
            <Route path="/tools/regex-tester" element={<RegexTester />} />
            <Route path="/tools/url-shortener" element={<UrlShortener />} />
            <Route path="/tools/text-counter" element={<TextCounter />} />
            <Route path="/tools/diff-checker" element={<DiffChecker />} />
            <Route path="/tools/lorem-generator" element={<LoremGenerator />} />
            <Route path="/tools/markdown-preview" element={<MarkdownPreview />} />
            <Route path="/tools/jwt-decoder" element={<JwtDecoder />} />
            <Route path="/tools/minify-css" element={<CssMinifier />} />
            <Route path="/tools/minify-js" element={<JsMinifier />} />
            {/* Blog */}
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            {/* Generic catch-all for any tool by ID */}
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
