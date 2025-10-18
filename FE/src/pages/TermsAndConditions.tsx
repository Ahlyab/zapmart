import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Shield,
  Users,
  CreditCard,
  Truck,
  AlertCircle,
} from "lucide-react";

const TermsAndConditions: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>

          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Terms and Conditions
            </h1>
          </div>

          <p className="text-gray-600">
            Last updated:{" "}
            {new Date().toLocaleDateString("en-GB", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="h-6 w-6 text-blue-600 mr-2" />
              1. Introduction
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed">
                Welcome to ZapMart ("we," "our," or "us"). These Terms and
                Conditions ("Terms") govern your use of our ecommerce platform,
                whether you are a consumer (B2C) or business customer (B2B). By
                accessing or using our website, you agree to be bound by these
                Terms.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                Our platform facilitates both business-to-business (B2B) and
                peer-to-peer (P2P) transactions, providing a comprehensive
                marketplace for various types of commerce.
              </p>
            </div>
          </section>

          {/* Definitions */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="h-6 w-6 text-blue-600 mr-2" />
              2. Definitions
            </h2>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">
                  B2B Customer:
                </h3>
                <p className="text-gray-700">
                  A business entity purchasing goods or services for commercial
                  purposes.
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">
                  P2P Customer:
                </h3>
                <p className="text-gray-700">
                  An individual consumer purchasing goods or services for
                  personal use.
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Platform:</h3>
                <p className="text-gray-700">
                  Our website, mobile application, and related services.
                </p>
              </div>
            </div>
          </section>

          {/* Account Registration */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              3. Account Registration
            </h2>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  B2B Accounts:
                </h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Must provide valid business registration details</li>
                  <li>VAT number required for EU businesses</li>
                  <li>Credit checks may be performed for large orders</li>
                  <li>Business contact information must be verified</li>
                </ul>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  P2P Accounts:
                </h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Personal information required for verification</li>
                  <li>Must be 18 years or older</li>
                  <li>Valid email address and phone number required</li>
                  <li>
                    Identity verification may be required for high-value
                    purchases
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Products and Services */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              4. Products and Services
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700">
                We offer a wide range of products and services through our
                platform. Product descriptions, images, and specifications are
                provided for informational purposes and may not always be
                completely accurate.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-yellow-800 mb-1">
                      Important Notice
                    </h3>
                    <p className="text-yellow-700 text-sm">
                      We reserve the right to modify product offerings, prices,
                      and availability without prior notice.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Pricing and Payment */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCard className="h-6 w-6 text-blue-600 mr-2" />
              5. Pricing and Payment
            </h2>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    B2B Pricing:
                  </h3>
                  <ul className="list-disc list-inside text-blue-800 space-y-1 text-sm">
                    <li>Volume discounts available</li>
                    <li>Net payment terms (30-90 days)</li>
                    <li>Credit account facilities</li>
                    <li>Custom pricing for large orders</li>
                    <li>VAT applicable where required</li>
                  </ul>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">
                    P2P Pricing:
                  </h3>
                  <ul className="list-disc list-inside text-green-800 space-y-1 text-sm">
                    <li>Standard retail pricing</li>
                    <li>Immediate payment required</li>
                    <li>Multiple payment methods accepted</li>
                    <li>Secure payment processing</li>
                    <li>All prices include applicable taxes</li>
                  </ul>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Payment Methods:
                </h3>
                <p className="text-gray-700 text-sm">
                  We accept major credit cards, debit cards, bank transfers, and
                  digital payment methods. All payments are processed securely
                  through our payment partners.
                </p>
              </div>
            </div>
          </section>

          {/* Shipping and Delivery */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <Truck className="h-6 w-6 text-blue-600 mr-2" />
              6. Shipping and Delivery
            </h2>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    B2B Delivery:
                  </h3>
                  <ul className="list-disc list-inside text-blue-800 space-y-1 text-sm">
                    <li>Bulk shipping arrangements</li>
                    <li>Custom delivery schedules</li>
                    <li>Freight forwarding services</li>
                    <li>Delivery to business addresses only</li>
                    <li>Tracking and insurance included</li>
                  </ul>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">
                    P2P Delivery:
                  </h3>
                  <ul className="list-disc list-inside text-green-800 space-y-1 text-sm">
                    <li>Standard and express delivery options</li>
                    <li>Home delivery available</li>
                    <li>Package tracking provided</li>
                    <li>Delivery confirmation required</li>
                    <li>UK-wide delivery coverage</li>
                  </ul>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 text-sm">
                  Delivery times are estimates and may vary due to factors
                  beyond our control. We are not liable for delays caused by
                  weather, customs, or other external factors.
                </p>
              </div>
            </div>
          </section>

          {/* Returns and Refunds */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              7. Returns and Refunds
            </h2>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">
                  General Return Policy:
                </h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>30-day return window for most items</li>
                  <li>Items must be in original condition</li>
                  <li>Original packaging and documentation required</li>
                  <li>Return shipping costs may apply</li>
                  <li>Refunds processed within 5-10 business days</li>
                </ul>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    B2B Returns:
                  </h3>
                  <ul className="list-disc list-inside text-blue-800 space-y-1 text-sm">
                    <li>Extended return periods for bulk orders</li>
                    <li>Custom return arrangements</li>
                    <li>Credit note options available</li>
                    <li>Quality inspection required</li>
                    <li>Return authorization needed</li>
                  </ul>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">
                    P2P Returns:
                  </h3>
                  <ul className="list-disc list-inside text-green-800 space-y-1 text-sm">
                    <li>Standard 30-day return policy</li>
                    <li>Free return shipping for defective items</li>
                    <li>Online return portal available</li>
                    <li>Instant refund processing</li>
                    <li>Exchange options available</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              8. Limitation of Liability
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700">
                To the maximum extent permitted by law, ZapMart shall not be
                liable for any indirect, incidental, special, consequential, or
                punitive damages, including but not limited to loss of profits,
                data, or business opportunities.
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-800 mb-2">
                  Important Limitations:
                </h3>
                <ul className="list-disc list-inside text-red-700 space-y-1 text-sm">
                  <li>
                    Our total liability shall not exceed the amount paid for the
                    specific product or service
                  </li>
                  <li>
                    We are not responsible for third-party actions or services
                  </li>
                  <li>Force majeure events are excluded from our liability</li>
                  <li>Business customers may have different liability terms</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              9. Intellectual Property
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700">
                All content on our platform, including text, graphics, logos,
                images, and software, is the property of ZapMart or its
                licensors and is protected by copyright and other intellectual
                property laws.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">
                  User-Generated Content:
                </h3>
                <p className="text-gray-700 text-sm">
                  By submitting content to our platform (reviews, images, etc.),
                  you grant us a non-exclusive, royalty-free license to use,
                  modify, and distribute such content.
                </p>
              </div>
            </div>
          </section>

          {/* Privacy and Data Protection */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              10. Privacy and Data Protection
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700">
                We are committed to protecting your privacy and personal data.
                Our collection, use, and protection of your information is
                governed by our Privacy Policy, which forms part of these Terms.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Data Protection Rights:
                </h3>
                <ul className="list-disc list-inside text-blue-800 space-y-1 text-sm">
                  <li>Right to access your personal data</li>
                  <li>Right to rectification of inaccurate data</li>
                  <li>Right to erasure ("right to be forgotten")</li>
                  <li>Right to data portability</li>
                  <li>Right to object to processing</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              11. Termination
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700">
                We reserve the right to terminate or suspend your account at any
                time for violation of these Terms or for any other reason at our
                sole discretion.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Termination Effects:
                </h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                  <li>Access to your account will be immediately suspended</li>
                  <li>
                    Outstanding orders will be processed according to these
                    Terms
                  </li>
                  <li>You remain liable for any outstanding payments</li>
                  <li>We may retain certain data as required by law</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              12. Governing Law and Disputes
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700">
                These Terms are governed by the laws of England and Wales. Any
                disputes arising from these Terms or your use of our platform
                shall be subject to the exclusive jurisdiction of the courts of
                England and Wales.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Dispute Resolution:
                </h3>
                <p className="text-gray-700 text-sm">
                  We encourage customers to contact us directly to resolve any
                  disputes. For B2B customers, alternative dispute resolution
                  mechanisms may be available.
                </p>
              </div>
            </div>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              13. Changes to Terms
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700">
                We reserve the right to modify these Terms at any time. Changes
                will be effective immediately upon posting on our website. Your
                continued use of our platform constitutes acceptance of the
                modified Terms.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-yellow-800 mb-1">
                      Notification of Changes
                    </h3>
                    <p className="text-yellow-700 text-sm">
                      We will notify users of significant changes via email or
                      through our platform. It is your responsibility to review
                      these Terms periodically.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              14. Contact Information
            </h2>
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-4">Get in Touch</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-blue-800 mb-2">
                    General Inquiries:
                  </h4>
                  <p className="text-blue-700 text-sm">
                    Email: support@zapmart.com
                  </p>
                  <p className="text-blue-700 text-sm">
                    Phone: +44 20 1234 5678
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-blue-800 mb-2">
                    Legal Matters:
                  </h4>
                  <p className="text-blue-700 text-sm">
                    Email: legal@zapmart.com
                  </p>
                  <p className="text-blue-700 text-sm">
                    Address: London, United Kingdom
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            By using our platform, you acknowledge that you have read,
            understood, and agree to be bound by these Terms and Conditions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
