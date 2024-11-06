import { Outlet } from "react-router-dom";
import { BottomNav, SideNav } from "./components/common/Navigation";
import { memo } from "react";

const App = memo(() => {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background">
      <SideNav />
      <main className="flex-1 md:ml-64 p-4 overflow-auto">
        <Outlet />
      </main>
      <BottomNav className="md:hidden" />
    </div>
  );
});

App.displayName = "App";

export default App;
