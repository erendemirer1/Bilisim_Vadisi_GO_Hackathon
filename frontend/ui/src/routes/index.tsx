import { BrowserRouter, Routes, Route } from "react-router-dom";
import { routesConfig } from "./RoutesConfig";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {routesConfig.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}
      </Routes>
    </BrowserRouter>
  );
}
