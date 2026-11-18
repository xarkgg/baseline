import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import Work from "./work";
import Resources from "./resources";
import Contacts from "./contacts";
import Team from "./team";
import CustomMouseCursor from "./components/CustomMouseCursor";
import "./styles.css";
import { I18nProvider } from "./i18n";

const isWorkPage = window.location.pathname.replace(/\/+$/, "") === "/work";
const isResourcesPage = window.location.pathname.replace(/\/+$/, "") === "/resources";
const isContactsPage = window.location.pathname.replace(/\/+$/, "") === "/contact";
const isTeamPage = window.location.pathname.replace(/\/+$/, "") === "/team";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <I18nProvider>
      <CustomMouseCursor />
      {isWorkPage ? <Work /> : isResourcesPage ? <Resources /> : isContactsPage ? <Contacts /> : isTeamPage ? <Team /> : <App />}
    </I18nProvider>
  </StrictMode>,
);
