import { Routes, Route } from "react-router-dom";
import Home from "../pages/public/Home";
import Book from "../pages/public/Book";

export default function PublicRouter() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />        {/* Landing page */}
      <Route path="/book" element={<Book />} />    {/* Reservas */}
    </Routes>
  );
}