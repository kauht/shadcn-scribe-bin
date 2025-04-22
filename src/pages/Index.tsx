
import { PasteForm } from "@/components/PasteForm";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <section className="py-12 md:py-16 lg:py-20">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-3xl space-y-4 text-center">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Share code snippets instantly
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                kaught.cc is a simple, fast, and secure pastebin service.
              </p>
            </div>
          </div>
        </section>
        <section className="py-8 md:py-12">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-3xl">
              <PasteForm />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
