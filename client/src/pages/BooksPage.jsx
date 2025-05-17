import BookSection from "../components/BookSection";

const BooksPage = () => {
  return (
    <div className="container mx-auto py-4">
      <h1 className="text-2xl font-bold mb-6">Books Management</h1>
      <BookSection />
    </div>
  );
};

export default BooksPage;
