import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";

// Import Pages instead of components
import BooksPage from "./pages/BooksPage";
import UsersPage from "./pages/UsersPage";
import LoansPage from "./pages/LoansPage";
import StatsPage from "./pages/StatsPage";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-gray-100">
        <Header />

        <main className="flex-grow container mx-auto py-6 px-4">
          <Routes>
            <Route path="/" element={<BooksPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/loans" element={<LoansPage />} />
            <Route path="/stats" element={<StatsPage />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
