import React from "react";
import { AppProviders } from "./providers/AppProviders";
import { AppRouter } from "./components/AppRouter";

function App() {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
}

export default App;
