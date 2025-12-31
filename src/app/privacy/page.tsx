import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - Swiss Travel Companion',
  description: 'Privacy policy for Swiss Travel Companion',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Privacy Policy
        </h1>

        <p className="text-sm text-gray-600 mb-8">
          Last updated: December 31, 2024
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Introduction
          </h2>
          <p className="text-gray-700 mb-4">
            Swiss Travel Companion ("we", "our", or "us") is committed to
            protecting your privacy. This Privacy Policy explains how we
            collect, use, and safeguard your information when you use our
            service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Information We Collect
          </h2>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">
            Information You Provide
          </h3>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>Chat messages and queries you send to our AI assistant</li>
            <li>
              Saved trips and preferences (stored locally in your browser)
            </li>
            <li>Language preferences and settings</li>
            <li>Feedback submissions (optional)</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">
            Automatically Collected Information
          </h3>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>Browser type and version</li>
            <li>Device information</li>
            <li>Usage data (pages visited, features used)</li>
            <li>Error logs and performance metrics</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            How We Use Your Information
          </h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>To provide and improve our AI travel assistant service</li>
            <li>To process your travel queries using Google Gemini AI</li>
            <li>To translate content into your preferred language</li>
            <li>To remember your preferences and saved trips</li>
            <li>To monitor and improve service performance</li>
            <li>To respond to your feedback and support requests</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Data Storage
          </h2>
          <p className="text-gray-700 mb-4">
            <strong>Local Storage:</strong> Your saved trips, preferences, and
            chat history are stored locally in your browser. We do not store
            this data on our servers.
          </p>
          <p className="text-gray-700 mb-4">
            <strong>Server Logs:</strong> We temporarily store server logs for
            debugging and performance monitoring. These logs are automatically
            deleted after 30 days.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Third-Party Services
          </h2>
          <p className="text-gray-700 mb-4">
            We use the following third-party services:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>
              <strong>Google Gemini AI:</strong> Processes your chat queries
              (subject to Google's privacy policy)
            </li>
            <li>
              <strong>Google Cloud Translation API:</strong> Translates content
              into your preferred language
            </li>
            <li>
              <strong>Journey Service MCP:</strong> Provides real-time Swiss
              travel data
            </li>
            <li>
              <strong>Google Cloud Platform:</strong> Hosts our application
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Data Sharing
          </h2>
          <p className="text-gray-700 mb-4">
            We do not sell, rent, or share your personal information with third
            parties except:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>When required by law or legal process</li>
            <li>To protect our rights, property, or safety</li>
            <li>
              With service providers who help us operate our service (subject to
              confidentiality agreements)
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Your Rights
          </h2>
          <p className="text-gray-700 mb-4">You have the right to:</p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>
              Clear your locally stored data at any time (via browser settings)
            </li>
            <li>Request deletion of any data we store about you</li>
            <li>Opt out of data collection by not using our service</li>
            <li>Contact us with privacy concerns or questions</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Cookies</h2>
          <p className="text-gray-700 mb-4">
            We use minimal cookies and browser storage to:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Remember your language preference</li>
            <li>Store your saved trips and settings</li>
            <li>Maintain your chat history</li>
          </ul>
          <p className="text-gray-700 mt-4">
            You can disable cookies in your browser settings, but this may limit
            functionality.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Children's Privacy
          </h2>
          <p className="text-gray-700">
            Our service is not intended for children under 13. We do not
            knowingly collect information from children.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Changes to This Policy
          </h2>
          <p className="text-gray-700">
            We may update this Privacy Policy from time to time. We will notify
            you of any changes by updating the "Last updated" date.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Contact Us
          </h2>
          <p className="text-gray-700">
            If you have questions about this Privacy Policy, please use the
            feedback button in the app or contact us through our support
            channels.
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
