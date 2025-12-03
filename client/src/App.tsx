import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Store from "@/pages/store";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import Gallery from "@/pages/gallery";
import Extras from "@/pages/extras";
import Designer from "@/pages/designer";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/store" component={Store} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/gallery" component={Gallery} />
      <Route path="/extras" component={Extras} />
      <Route path="/designer" component={Designer} />
      <Route path="/services" component={Home} />
      <Route path="/quote" component={Contact} />
      <Route path="/consultation" component={Contact} />
      <Route path="/calculator" component={Home} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
