import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - Swiss Travel Companion',
  description: 'Terms of service for Swiss Travel Companion',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Terms of Service
        </h1>

        <p className="text-sm text-gray-600 mb-8">
          Last updated: December 31, 2024
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Acceptance of Terms
          </h2>
          <p className="text-gray-700">
            By accessing and using Swiss Travel Companion, you accept and agree
            to be bound by these Terms of Service. If you do not agree to these
            terms, please do not use our service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Description of Service
          </h2>
          <p className="text-gray-700 mb-4">
            Swiss Travel Companion is an AI-powered travel assistant that
            provides:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Real-time Swiss public transport information</li>
            <li>Journey planning and route suggestions</li>
            <li>Weather and ski condition reports</li>
            <li>Tourist attraction information</li>
            <li>Multi-language support</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Use of Service
          </h2>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">
            Acceptable Use
          </h3>
          <p className="text-gray-700 mb-4">
            You agree to use our service only for lawful purposes. You must not:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>
              Use the service in any way that violates applicable laws or
              regulations
            </li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Interfere with or disrupt the service or servers</li>
            <li>Use automated systems to access the service excessively</li>
            <li>Impersonate others or provide false information</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">
            API Usage Limits
          </h3>
          <p className="text-gray-700">
            We reserve the right to limit the number of requests you can make to
            our service to ensure fair usage for all users.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Information Accuracy
          </h2>
          <p className="text-gray-700 mb-4">
            <strong>Important Disclaimer:</strong> While we strive to provide
            accurate and up-to-date information, we cannot guarantee:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>The accuracy of travel schedules, prices, or availability</li>
            <li>Real-time accuracy of weather or ski conditions</li>
            <li>The completeness of attraction information</li>
          </ul>
          <p className="text-gray-700 mt-4">
            <strong>Always verify critical travel information</strong> with
            official sources (SBB, MeteoSwiss, etc.) before making travel
            decisions.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            AI-Generated Content
          </h2>
          <p className="text-gray-700">
            Our service uses AI (Google Gemini) to generate responses.
            AI-generated content may occasionally be inaccurate, incomplete, or
            inappropriate. We are not responsible for decisions made based on
            AI-generated content.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Intellectual Property
          </h2>
          <p className="text-gray-700 mb-4">
            The service, including its design, features, and content, is owned
            by us and protected by copyright and other intellectual property
            laws.
          </p>
          <p className="text-gray-700">
            Travel data is provided by third parties (SBB, MeteoSwiss, etc.) and
            remains their property.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Limitation of Liability
          </h2>
          <p className="text-gray-700 mb-4">
            <strong>To the maximum extent permitted by law:</strong>
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>
              We provide the service "as is" without warranties of any kind
            </li>
            <li>
              We are not liable for any damages arising from your use of the
              service
            </li>
            <li>
              We are not responsible for missed connections, travel delays, or
              other travel-related issues
            </li>
            <li>We are not liable for any loss of data or content</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Service Availability
          </h2>
          <p className="text-gray-700">
            We strive to keep the service available 24/7, but we do not
            guarantee uninterrupted access. We may suspend or terminate the
            service at any time for maintenance, updates, or other reasons.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Third-Party Services
          </h2>
          <p className="text-gray-700 mb-4">
            Our service integrates with third-party services:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Google Gemini AI (subject to Google's terms)</li>
            <li>Journey Service MCP (SBB data)</li>
            <li>Google Cloud Translation API</li>
          </ul>
          <p className="text-gray-700 mt-4">
            Your use of these services is subject to their respective terms and
            conditions.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Privacy</h2>
          <p className="text-gray-700">
            Your use of the service is also governed by our{' '}
            <a
              href="/privacy"
              className="text-sbb-red hover:text-red-700 font-medium"
            >
              Privacy Policy
            </a>
            .
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Changes to Terms
          </h2>
          <p className="text-gray-700">
            We reserve the right to modify these terms at any time. Continued
            use of the service after changes constitutes acceptance of the new
            terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Termination
          </h2>
          <p className="text-gray-700">
            We may terminate or suspend your access to the service immediately,
            without prior notice, for any reason, including violation of these
            terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Governing Law
          </h2>
          <p className="text-gray-700">
            These terms are governed by the laws of Switzerland. Any disputes
            shall be resolved in Swiss courts.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact</h2>
          <p className="text-gray-700">
            For questions about these Terms of Service, please use the feedback
            button in the app.
          </p>
        </section>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <a href="/" className="text-sbb-red hover:text-red-700 font-medium">
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
