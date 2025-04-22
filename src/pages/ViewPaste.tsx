
import { CodeViewer } from "@/components/CodeViewer";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const ViewPaste = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <section className="py-8 md:py-12">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-3xl">
              <CodeViewer />
            </div>
          </div>
        </section>
      </main>
      <div className="diagonal-line my-8" />
      <Footer />
    </div>
  );
};

export default ViewPaste;
