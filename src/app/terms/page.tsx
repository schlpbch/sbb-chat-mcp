import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - Swiss Travel Companion',
  description: 'Terms of service for Swiss Travel Companion',
};

import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 transition-colors duration-300">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 transition-colors">
          Terms of Service
        </h1>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-8 transition-colors">
          Last updated: December 31, 2024
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 transition-colors">
            Acceptance of Terms
          </h2>
          <p className="text-gray-700 dark:text-gray-300 transition-colors">
            By accessing and using Swiss Travel Companion, you accept and agree
            to be bound by these Terms of Service. If you do not agree to these
            terms, please do not use our service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 transition-colors">
            Description of Service
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4 transition-colors">
            Swiss Travel Companion is an AI-powered travel assistant that
            provides:
          </p>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 transition-colors">
            <li>Real-time Swiss public transport information</li>
            <li>Journey planning and route suggestions</li>
            <li>Weather and ski condition reports</li>
            <li>Tourist attraction information</li>
            <li>Multi-language support</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 transition-colors">
            Use of Service
          </h2>

          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3 transition-colors">
            Acceptable Use
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4 transition-colors">
            You agree to use our service only for lawful purposes. You must not:
          </p>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2 transition-colors">
            <li>
              Use the service in any way that violates applicable laws or
              regulations
            </li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Interfere with or disrupt the service or servers</li>
            <li>Use automated systems to access the service excessively</li>
            <li>Impersonate others or provide false information</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3 transition-colors">
            API Usage Limits
          </h3>
          <p className="text-gray-700 dark:text-gray-300 transition-colors">
            We reserve the right to limit the number of requests you can make to
            our service to ensure fair usage for all users.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 transition-colors">
            Information Accuracy
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4 transition-colors">
            <strong>Important Disclaimer:</strong> While we strive to provide
            accurate and up-to-date information, we cannot guarantee:
          </p>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 transition-colors">
            <li>The accuracy of travel schedules, prices, or availability</li>
            <li>Real-time accuracy of weather or ski conditions</li>
            <li>The completeness of attraction information</li>
          </ul>
          <p className="text-gray-700 dark:text-gray-300 mt-4 transition-colors">
            <strong>Always verify critical travel information</strong> with
            official sources (SBB, MeteoSwiss, etc.) before making travel
            decisions.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 transition-colors">
            AI-Generated Content
          </h2>
          <p className="text-gray-700 dark:text-gray-300 transition-colors">
            Our service uses AI (Google Gemini) to generate responses.
            AI-generated content may occasionally be inaccurate, incomplete, or
            inappropriate. We are not responsible for decisions made based on
            AI-generated content.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 transition-colors">
            Intellectual Property
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4 transition-colors">
            The service, including its design, features, and content, is owned
            by us and protected by copyright and other intellectual property
            laws.
          </p>
          <p className="text-gray-700 dark:text-gray-300 transition-colors">
            Travel data is provided by third parties (SBB, MeteoSwiss, etc.) and
            remains their property.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 transition-colors">
            Limitation of Liability
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4 transition-colors">
            <strong>To the maximum extent permitted by law:</strong>
          </p>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 transition-colors">
            <li>
              We provide the service &quot;as is&quot; without warranties of any kind
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
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 transition-colors">
            Service Availability
          </h2>
          <p className="text-gray-700 dark:text-gray-300 transition-colors">
            We strive to keep the service available 24/7, but we do not
            guarantee uninterrupted access. We may suspend or terminate the
            service at any time for maintenance, updates, or other reasons.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 transition-colors">
            Third-Party Services
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4 transition-colors">
            Our service integrates with third-party services:
          </p>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 transition-colors">
            <li>Google Gemini AI (subject to Google's terms)</li>
            <li>Journey Service MCP (SBB data)</li>
            <li>Google Cloud Translation API</li>
          </ul>
          <p className="text-gray-700 dark:text-gray-300 mt-4 transition-colors">
            Your use of these services is subject to their respective terms and
            conditions.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 transition-colors">Privacy</h2>
          <p className="text-gray-700 dark:text-gray-300 transition-colors">
            Your use of the service is also governed by our{' '}
            <Link
              href="/privacy"
              className="text-sbb-red hover:text-red-700 dark:hover:text-red-400 font-medium"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 transition-colors">
            Changes to Terms
          </h2>
          <p className="text-gray-700 dark:text-gray-300 transition-colors">
            We reserve the right to modify these terms at any time. Continued
            use of the service after changes constitutes acceptance of the new
            terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 transition-colors">
            Termination
          </h2>
          <p className="text-gray-700 dark:text-gray-300 transition-colors">
            We may terminate or suspend your access to the service immediately,
            without prior notice, for any reason, including violation of these
            terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 transition-colors">
            Governing Law
          </h2>
          <p className="text-gray-700 dark:text-gray-300 transition-colors">
            These terms are governed by the laws of Switzerland. Any disputes
            shall be resolved in Swiss courts.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 transition-colors">Contact</h2>
          <p className="text-gray-700 dark:text-gray-300 transition-colors">
            For questions about these Terms of Service, please use the feedback
            button in the app.
          </p>
        </section>

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 transition-colors">
          <Link href="/" className="text-sbb-red dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
