import AppRouter from "./routes";
import { SnackbarProvider } from "./context/SnackbarContext"; // 1. Provider'ı import et
function App() {
  return (
    <SnackbarProvider>
      <AppRouter />;
    </SnackbarProvider>
  );
}

export default App;
