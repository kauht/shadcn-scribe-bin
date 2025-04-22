
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const NotFound = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <div className="container px-4 md:px-6 py-16 text-center">
          <h1 className="text-6xl font-bold">404</h1>
          <p className="mt-4 text-xl text-muted-foreground">
            The page you're looking for doesn't exist.
          </p>
          <Button asChild className="mt-8">
            <Link to="/">Return Home</Link>
          </Button>
        </div>
      </main>
      <div className="diagonal-line my-8" />
      <Footer />
    </div>
  );
};

export default NotFound;
