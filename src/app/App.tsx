import { RouterProvider } from "react-router-dom";
import { Providers } from "./providers";
import { SessionHydrator } from "./SessionHydrator";
import { router } from "./router";

export function App() {
  return (
    <Providers>
      <SessionHydrator>
        <RouterProvider router={router} />
      </SessionHydrator>
    </Providers>
  );
}
