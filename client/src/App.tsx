import { Switch, Route } from "wouter";
import SidebarLayout from "./components/layouts/sidebar-layout";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import JobOverview from "./pages/job-overview";
import ApplicantDetail from "./pages/applicant-detail";
import Compare from "./pages/compare";
import NotFound from "./pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      
      {/* Protected routes wrapped in the sidebar layout */}
      <Route path="/jobs/:jobId">
        {params => (
          <SidebarLayout>
            <JobOverview jobId={parseInt(params.jobId) || 1} />
          </SidebarLayout>
        )}
      </Route>
      
      <Route path="/applicants/:id">
        {params => (
          <SidebarLayout>
            <ApplicantDetail id={parseInt(params.id) || 1} />
          </SidebarLayout>
        )}
      </Route>
      
      <Route path="/compare">
        <SidebarLayout>
          <Compare />
        </SidebarLayout>
      </Route>
      
      <Route path="/">
        <SidebarLayout>
          <Dashboard />
        </SidebarLayout>
      </Route>
      
      {/* Fallback 404 route */}
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

function App() {
  return <Router />;
}

export default App;
