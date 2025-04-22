
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PasteList } from "@/components/PasteList";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getCurrentUser, getUserPastes } from "@/lib/pasteStore";
import { Paste } from "@/lib/types";

const MyPastes = () => {
  const navigate = useNavigate();
  const [pastes, setPastes] = useState<Paste[]>([]);
  const currentUser = getCurrentUser();

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    setPastes(getUserPastes(currentUser.id));
  }, [currentUser, navigate]);

  if (!currentUser) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <section className="py-8 md:py-12">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-5xl">
              <PasteList
                pastes={pastes}
                title="My Pastes"
                description="View and manage all your saved pastes."
              />
            </div>
          </div>
        </section>
      </main>
      <div className="diagonal-line my-8" />
      <Footer />
    </div>
  );
};

export default MyPastes;
