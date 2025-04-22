
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useParams } from "react-router-dom";

const Info = () => {
  const { type } = useParams<{ type: string }>();
  
  const getTitle = () => {
    switch (type) {
      case "terms":
        return "Terms of Service";
      case "privacy":
        return "Privacy Policy";
      case "contact":
        return "Contact Us";
      case "api":
        return "API Documentation";
      default:
        return "Information";
    }
  };
  
  const getContent = () => {
    switch (type) {
      case "terms":
        return (
          <div className="prose prose-sm max-w-none">
            <h2>Terms of Service</h2>
            <p>
              Welcome to CodeBin. By using our services, you agree to these terms.
            </p>
            <h3>Usage Guidelines</h3>
            <p>
              Users are responsible for all content they post. We prohibit illegal, harmful, or abusive content.
            </p>
            <h3>Intellectual Property</h3>
            <p>
              Users retain ownership of their content but grant us a license to store and display it.
            </p>
            <h3>Service Limitations</h3>
            <p>
              We provide the service "as is" without warranties. We may modify or terminate services at any time.
            </p>
          </div>
        );
      case "privacy":
        return (
          <div className="prose prose-sm max-w-none">
            <h2>Privacy Policy</h2>
            <p>
              Your privacy is important to us. This policy explains how we collect and use your data.
            </p>
            <h3>Information We Collect</h3>
            <p>
              We collect information you provide, such as account details and paste content.
            </p>
            <h3>How We Use Your Information</h3>
            <p>
              We use your information to provide and improve our services, and to communicate with you.
            </p>
            <h3>Data Security</h3>
            <p>
              We implement reasonable security measures to protect your data.
            </p>
          </div>
        );
      case "contact":
        return (
          <div className="prose prose-sm max-w-none">
            <h2>Contact Us</h2>
            <p>
              We're here to help with any questions or concerns.
            </p>
            <h3>Support</h3>
            <p>
              For general inquiries: support@codebin.example.com
            </p>
            <h3>Report Abuse</h3>
            <p>
              To report abuse: abuse@codebin.example.com
            </p>
            <h3>Business Inquiries</h3>
            <p>
              For business inquiries: business@codebin.example.com
            </p>
          </div>
        );
      case "api":
        return (
          <div className="prose prose-sm max-w-none">
            <h2>API Documentation</h2>
            <p>
              Our API allows you to programmatically create and retrieve pastes.
            </p>
            <h3>Authentication</h3>
            <p>
              Use your API key to authenticate requests.
            </p>
            <h3>Endpoints</h3>
            <pre><code>GET /api/pastes - List pastes
POST /api/pastes - Create a paste
GET /api/pastes/:id - Get a paste
DELETE /api/pastes/:id - Delete a paste</code></pre>
            <h3>Rate Limits</h3>
            <p>
              The API is rate limited to 60 requests per minute.
            </p>
          </div>
        );
      default:
        return (
          <div className="prose prose-sm max-w-none">
            <h2>Information</h2>
            <p>
              This page doesn't exist.
            </p>
          </div>
        );
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <section className="py-8 md:py-12">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-3xl">
              <h1 className="text-3xl font-bold mb-6">{getTitle()}</h1>
              {getContent()}
            </div>
          </div>
        </section>
      </main>
      <div className="diagonal-line my-8" />
      <Footer />
    </div>
  );
};

export default Info;
