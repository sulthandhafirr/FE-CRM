import { BrowserRouter } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { AuthProvider } from "../context/AuthProvider";
import Router from "./router";

// App-wide MUI theme — match the Inter font loaded in index.html so
// MUI components (dialogs, buttons, tables) render consistently.
const muiTheme = createTheme({
  typography: {
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  },
});

function App() {
  return (
    <ThemeProvider theme={muiTheme}>
      <AuthProvider>
        <BrowserRouter>
          <Router />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
