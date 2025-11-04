
import { createRoot } from "react-dom/client";
import App from "../App";

const mount = document.getElementById("bj-helper-react-root");
if (mount) {
    createRoot(mount).render(<App />);
}
