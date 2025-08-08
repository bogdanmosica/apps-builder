import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { ArrowLeft, Shield } from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to OCR Tool
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-blue-600" />
              <CardTitle className="text-2xl">Privacy Policy</CardTitle>
            </div>
            <p className="text-gray-600">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                This privacy policy explains how the Romanian ID OCR tool
                handles your personal data. We are committed to protecting your
                privacy and ensuring transparency in our data processing
                practices.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Data Collection</h2>
              <div className="space-y-2 text-gray-700">
                <p>We process the following types of data:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Images of Romanian identity documents that you upload</li>
                  <li>Text data extracted from these documents via OCR</li>
                  <li>No additional personal information is collected</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">
                3. How We Process Data
              </h2>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <h3 className="font-medium text-green-900 mb-2">
                  ✓ Privacy-First Design
                </h3>
                <ul className="text-green-800 text-sm space-y-1">
                  <li>• All OCR processing happens locally in your browser</li>
                  <li>• Images never leave your device</li>
                  <li>• No server-side processing or storage</li>
                  <li>• No data transmission to external services</li>
                </ul>
              </div>
              <p className="text-gray-700">
                The OCR (Optical Character Recognition) processing is performed
                entirely client-side using JavaScript libraries. This means your
                sensitive documents are never uploaded to any server.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Data Storage</h2>
              <div className="space-y-2 text-gray-700">
                <p>
                  <strong>No Persistent Storage:</strong> We do not store any of
                  your data on servers or databases.
                </p>
                <p>
                  <strong>Temporary Browser Storage:</strong> Data exists only
                  in your browser's memory while you use the application and is
                  automatically deleted when:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>You close the browser tab</li>
                  <li>You navigate away from the page</li>
                  <li>You refresh the page</li>
                  <li>Your browser session ends</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Data Sharing</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-900 font-medium">
                  We do not share, sell, or transfer your data to any third
                  parties. Period.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Your Rights</h2>
              <div className="space-y-2 text-gray-700">
                <p>Under GDPR, you have the following rights:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>
                    <strong>Right to withdraw consent:</strong> You can stop
                    using the service at any time
                  </li>
                  <li>
                    <strong>Right to access:</strong> All processing happens
                    locally, so you have full access to your data
                  </li>
                  <li>
                    <strong>Right to deletion:</strong> Simply close the browser
                    tab to delete all data
                  </li>
                  <li>
                    <strong>Right to portability:</strong> Export your extracted
                    data using the Excel download feature
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Security</h2>
              <div className="space-y-2 text-gray-700">
                <p>We implement the following security measures:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>HTTPS encryption for all web traffic</li>
                  <li>Client-side processing prevents data exposure</li>
                  <li>No server-side vulnerabilities (no server storage)</li>
                  <li>Modern browser security features</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">
                8. Cookies and Tracking
              </h2>
              <p className="text-gray-700">
                This application does not use cookies, analytics, or any
                tracking technologies. We respect your privacy completely.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Contact</h2>
              <div className="bg-gray-50 border rounded-lg p-4">
                <p className="text-gray-700">
                  For questions about this privacy policy or our data practices,
                  please contact us at:{" "}
                  <a
                    href="mailto:privacy@example.com"
                    className="text-blue-600 hover:underline"
                  >
                    privacy@example.com
                  </a>
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">
                10. Changes to This Policy
              </h2>
              <p className="text-gray-700">
                We may update this privacy policy from time to time. Any changes
                will be posted on this page with an updated "Last updated" date.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
