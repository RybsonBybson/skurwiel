import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./css/index.css";
import Frame from "./templates/template-parts/Frame";

function Main() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Frame />
      <Routes>
        <Route path="/"></Route>
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(<Main />);
