import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Shield,
  Eye,
  Lock,
  Database,
  Users,
  Mail,
  Phone,
  Globe,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";

const PrivacyPolicy: React.FC = () => {
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
            <div className="p-2 bg-green-100 rounded-lg">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
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
              <Eye className="h-6 w-6 text-green-600 mr-2" />
              1. Introduction
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed">
                At ZapMart, we are committed to protecting your privacy and
                personal data. This Privacy Policy explains how we collect, use,
                store, and protect your information when you use our ecommerce
                platform.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                This policy applies to all users of our platform, including both
                business (B2B) and consumer (P2P) customers. By using our
                services, you agree to the collection and use of information in
                accordance with this policy.
              </p>
            </div>
          </section>

          {/* Data Controller */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <Database className="h-6 w-6 text-green-600 mr-2" />
              2. Data Controller
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">
                ZapMart Limited
              </h3>
              <div className="space-y-2 text-gray-700">
                <p>Registered Office: London, United Kingdom</p>
                <p>Company Registration Number: 12345678</p>
                <p>VAT Number: GB123456789</p>
                <p>Data Protection Officer: privacy@zapmart.com</p>
              </div>
            </div>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="h-6 w-6 text-green-600 mr-2" />
              3. Information We Collect
            </h2>
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                    <Mail className="h-5 w-5 mr-2" />
                    Personal Information
                  </h3>
                  <ul className="list-disc list-inside text-blue-800 space-y-1 text-sm">
                    <li>Name and contact details</li>
                    <li>Email address and phone number</li>
                    <li>Billing and shipping addresses</li>
                    <li>Date of birth (for age verification)</li>
                    <li>Payment information (encrypted)</li>
                    <li>Account preferences and settings</li>
                  </ul>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-3 flex items-center">
                    <Globe className="h-5 w-5 mr-2" />
                    Technical Information
                  </h3>
                  <ul className="list-disc list-inside text-green-800 space-y-1 text-sm">
                    <li>IP address and device information</li>
                    <li>Browser type and version</li>
                    <li>Operating system details</li>
                    <li>Website usage patterns</li>
                    <li>Cookies and tracking data</li>
                    <li>Location data (with consent)</li>
                  </ul>
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-yellow-800 mb-1">
                      Business Customer Data
                    </h3>
                    <p className="text-yellow-700 text-sm">
                      For B2B customers, we may also collect business
                      registration details, VAT numbers, and corporate contact
                      information as required for business transactions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <Settings className="h-6 w-6 text-green-600 mr-2" />
              4. How We Use Your Information
            </h2>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Service Provision
                    </h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                      <li>Process orders and payments</li>
                      <li>Manage your account</li>
                      <li>Provide customer support</li>
                      <li>Send order confirmations</li>
                      <li>Handle returns and refunds</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Communication
                    </h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                      <li>Send marketing communications</li>
                      <li>Provide product updates</li>
                      <li>Share promotional offers</li>
                      <li>Send service notifications</li>
                      <li>Respond to inquiries</li>
                    </ul>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Platform Improvement
                    </h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                      <li>Analyze usage patterns</li>
                      <li>Improve user experience</li>
                      <li>Develop new features</li>
                      <li>Conduct research and analytics</li>
                      <li>Prevent fraud and abuse</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Legal Compliance
                    </h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                      <li>Comply with legal obligations</li>
                      <li>Protect our rights and interests</li>
                      <li>Enforce our terms of service</li>
                      <li>Respond to legal requests</li>
                      <li>Maintain security</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Legal Basis for Processing */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
              5. Legal Basis for Processing (GDPR)
            </h2>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Contract Performance
                  </h3>
                  <p className="text-blue-800 text-sm">
                    Processing necessary to fulfill our contract with you,
                    including order processing, payment handling, and customer
                    service.
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">
                    Legitimate Interest
                  </h3>
                  <p className="text-green-800 text-sm">
                    Processing for our legitimate business interests, such as
                    fraud prevention, security, and platform improvement.
                  </p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-yellow-900 mb-2">
                    Consent
                  </h3>
                  <p className="text-yellow-800 text-sm">
                    Processing based on your explicit consent, such as marketing
                    communications and non-essential cookies.
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-900 mb-2">
                    Legal Obligation
                  </h3>
                  <p className="text-purple-800 text-sm">
                    Processing required to comply with legal obligations, such
                    as tax reporting and regulatory requirements.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Data Sharing */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="h-6 w-6 text-green-600 mr-2" />
              6. Data Sharing and Third Parties
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700">
                We may share your information with trusted third parties in the
                following circumstances:
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Service Providers
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                    <li>Payment processors (Stripe, PayPal)</li>
                    <li>Shipping and logistics partners</li>
                    <li>Email marketing services</li>
                    <li>Analytics providers (Google Analytics)</li>
                    <li>Customer support platforms</li>
                    <li>Cloud hosting providers</li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Legal Requirements
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                    <li>Law enforcement agencies</li>
                    <li>Regulatory authorities</li>
                    <li>Courts and legal proceedings</li>
                    <li>Tax authorities</li>
                    <li>Fraud prevention agencies</li>
                    <li>Emergency services</li>
                  </ul>
                </div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-red-800 mb-1">
                      Data Protection
                    </h3>
                    <p className="text-red-700 text-sm">
                      We never sell your personal data to third parties for
                      marketing purposes. All data sharing is conducted under
                      strict data protection agreements.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <Lock className="h-6 w-6 text-green-600 mr-2" />
              7. Data Security
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700">
                We implement comprehensive security measures to protect your
                personal data:
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">
                    Technical Safeguards
                  </h3>
                  <ul className="list-disc list-inside text-green-800 space-y-1 text-sm">
                    <li>SSL/TLS encryption for data transmission</li>
                    <li>AES-256 encryption for data at rest</li>
                    <li>Secure payment processing (PCI DSS)</li>
                    <li>Regular security audits and testing</li>
                    <li>Access controls and authentication</li>
                    <li>Firewall and intrusion detection</li>
                  </ul>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Organizational Measures
                  </h3>
                  <ul className="list-disc list-inside text-blue-800 space-y-1 text-sm">
                    <li>Staff training on data protection</li>
                    <li>Confidentiality agreements</li>
                    <li>Regular policy reviews</li>
                    <li>Incident response procedures</li>
                    <li>Data minimization practices</li>
                    <li>Regular backup and recovery testing</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Cookies and Tracking */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <Globe className="h-6 w-6 text-green-600 mr-2" />
              8. Cookies and Tracking Technologies
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700">
                We use cookies and similar technologies to enhance your
                experience on our platform:
              </p>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Essential Cookies
                  </h3>
                  <p className="text-gray-700 text-sm mb-2">
                    Required for basic platform functionality:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                    <li>Session management and authentication</li>
                    <li>Shopping cart functionality</li>
                    <li>Security and fraud prevention</li>
                    <li>Load balancing and performance</li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Analytics Cookies
                  </h3>
                  <p className="text-gray-700 text-sm mb-2">
                    Help us understand how you use our platform:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                    <li>Google Analytics for usage statistics</li>
                    <li>Heat mapping and user behavior analysis</li>
                    <li>Performance monitoring and optimization</li>
                    <li>A/B testing and feature improvements</li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Marketing Cookies
                  </h3>
                  <p className="text-gray-700 text-sm mb-2">
                    Used for personalized advertising (with consent):
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                    <li>Retargeting and remarketing campaigns</li>
                    <li>Social media advertising</li>
                    <li>Personalized product recommendations</li>
                    <li>Email marketing optimization</li>
                  </ul>
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-yellow-800 mb-1">
                      Cookie Consent
                    </h3>
                    <p className="text-yellow-700 text-sm">
                      You can manage your cookie preferences through our cookie
                      banner or browser settings. Note that disabling certain
                      cookies may affect platform functionality.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="h-6 w-6 text-green-600 mr-2" />
              9. Data Retention
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700">
                We retain your personal data only for as long as necessary for
                the purposes outlined in this policy:
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Account Data
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                    <li>Active accounts: Until account closure</li>
                    <li>Inactive accounts: 3 years after last activity</li>
                    <li>Order history: 7 years (legal requirement)</li>
                    <li>Payment data: As required by law</li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Marketing Data
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                    <li>Marketing preferences: Until withdrawn</li>
                    <li>Email engagement: 2 years after last open</li>
                    <li>Analytics data: 26 months (Google Analytics)</li>
                    <li>Cookie data: As per cookie policy</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="h-6 w-6 text-green-600 mr-2" />
              10. Your Data Protection Rights
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700">
                Under GDPR and other applicable data protection laws, you have
                the following rights:
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">
                      Right of Access
                    </h3>
                    <p className="text-blue-800 text-sm">
                      Request a copy of the personal data we hold about you.
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-900 mb-2">
                      Right to Rectification
                    </h3>
                    <p className="text-green-800 text-sm">
                      Request correction of inaccurate or incomplete data.
                    </p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-red-900 mb-2">
                      Right to Erasure
                    </h3>
                    <p className="text-red-800 text-sm">
                      Request deletion of your personal data ("right to be
                      forgotten").
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-purple-900 mb-2">
                      Right to Portability
                    </h3>
                    <p className="text-purple-800 text-sm">
                      Request transfer of your data to another service provider.
                    </p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-yellow-900 mb-2">
                      Right to Object
                    </h3>
                    <p className="text-yellow-800 text-sm">
                      Object to processing based on legitimate interests or for
                      marketing purposes.
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Right to Restrict
                    </h3>
                    <p className="text-gray-700 text-sm">
                      Request restriction of processing in certain
                      circumstances.
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">
                  How to Exercise Your Rights
                </h3>
                <p className="text-blue-800 text-sm mb-2">
                  To exercise any of these rights, please contact us at:
                </p>
                <div className="space-y-1 text-blue-700 text-sm">
                  <p>Email: privacy@zapmart.com</p>
                  <p>Phone: +44 20 1234 5678</p>
                  <p>
                    Address: Data Protection Officer, ZapMart Limited, London
                  </p>
                </div>
                <p className="text-blue-800 text-sm mt-2">
                  We will respond to your request within 30 days. You also have
                  the right to lodge a complaint with the Information
                  Commissioner's Office (ICO) if you believe your rights have
                  been violated.
                </p>
              </div>
            </div>
          </section>

          {/* International Transfers */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <Globe className="h-6 w-6 text-green-600 mr-2" />
              11. International Data Transfers
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700">
                Some of our service providers may be located outside the UK/EEA.
                When we transfer your data internationally, we ensure adequate
                protection through:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>
                    Standard Contractual Clauses (SCCs) approved by the European
                    Commission
                  </li>
                  <li>
                    Adequacy decisions by the European Commission for certain
                    countries
                  </li>
                  <li>
                    Binding Corporate Rules for multinational service providers
                  </li>
                  <li>
                    Certification schemes such as Privacy Shield (where
                    applicable)
                  </li>
                  <li>
                    Explicit consent for transfers to countries without adequate
                    protection
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="h-6 w-6 text-green-600 mr-2" />
              12. Children's Privacy
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700">
                Our platform is not intended for children under 16 years of age.
                We do not knowingly collect personal information from children
                under 16.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-yellow-800 mb-1">
                      Parental Consent
                    </h3>
                    <p className="text-yellow-700 text-sm">
                      If you are a parent or guardian and believe your child has
                      provided us with personal information, please contact us
                      immediately. We will take steps to remove such information
                      from our systems.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Changes to Privacy Policy */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <Settings className="h-6 w-6 text-green-600 mr-2" />
              13. Changes to This Privacy Policy
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700">
                We may update this Privacy Policy from time to time to reflect
                changes in our practices or legal requirements. We will notify
                you of any material changes by:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Posting the updated policy on our website</li>
                  <li>Sending email notifications to registered users</li>
                  <li>Displaying prominent notices on our platform</li>
                  <li>
                    Updating the "Last updated" date at the top of this policy
                  </li>
                </ul>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Continued Use
                </h3>
                <p className="text-blue-800 text-sm">
                  Your continued use of our platform after any changes to this
                  Privacy Policy constitutes acceptance of the updated policy.
                  We encourage you to review this policy periodically.
                </p>
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <Phone className="h-6 w-6 text-green-600 mr-2" />
              14. Contact Us
            </h2>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-4">
                Privacy Inquiries
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-green-800 mb-2">
                    Data Protection Officer:
                  </h4>
                  <p className="text-green-700 text-sm">
                    Email: privacy@zapmart.com
                  </p>
                  <p className="text-green-700 text-sm">
                    Phone: +44 20 1234 5678
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-green-800 mb-2">
                    General Privacy Questions:
                  </h4>
                  <p className="text-green-700 text-sm">
                    Email: support@zapmart.com
                  </p>
                  <p className="text-green-700 text-sm">
                    Address: ZapMart Limited, London, United Kingdom
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-green-200">
                <h4 className="font-medium text-green-800 mb-2">
                  Supervisory Authority:
                </h4>
                <p className="text-green-700 text-sm">
                  Information Commissioner's Office (ICO)
                </p>
                <p className="text-green-700 text-sm">
                  Website: ico.org.uk | Phone: 0303 123 1113
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            This Privacy Policy is effective as of the date listed above and
            governs our collection and use of your personal information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
