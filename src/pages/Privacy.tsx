import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-6 py-12">
        <article className="bg-white rounded-2xl border border-gray-200 p-8 md:p-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-gray-500 mb-8">Last updated: January 25, 2025</p>

          <section className="prose prose-gray max-w-none">
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Introduction</h2>
            <p className="text-gray-600 mb-4">
              At SharePoint Image Studio, we take your privacy seriously. Please read this Privacy Policy to learn how we treat your personal data. By using or accessing our Services in any manner, you acknowledge that you accept the practices and policies outlined below, and you hereby consent that we will collect, use and disclose your information as described in this Privacy Policy.
            </p>
            <p className="text-gray-600 mb-4">
              Remember that your use of SharePoint Image Studio's Services is at all times subject to our Terms of Use, which incorporates this Privacy Policy.
            </p>
            <p className="text-gray-600 mb-4">
              As we continually work to improve our Services, we may need to change this Policy from time to time. We will alert you of material changes by placing a notice on our website or by sending you an email. If you use the Services after any changes to the Privacy Policy have been posted, that means you agree to all of the changes.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">What This Privacy Policy Covers</h2>
            <p className="text-gray-600 mb-4">
              This Privacy Policy covers how we treat Personal Data that we gather when you access or use our Services. "Personal Data" means any information that identifies or relates to a particular individual and also includes information referred to as "personally identifiable information" or "personal information" under applicable data privacy laws.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Personal Data We Collect</h2>
            <p className="text-gray-600 mb-4">We collect the following categories of Personal Data:</p>

            <div className="overflow-x-auto mb-6">
              <table className="min-w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Category</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-600">Profile or Contact Data (name, email from Microsoft 365 account)</td>
                    <td className="px-4 py-3 text-sm text-gray-600">Providing the Services, account management</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-600">Payment Data (via Stripe - card type, last 4 digits, billing address)</td>
                    <td className="px-4 py-3 text-sm text-gray-600">Processing subscriptions and payments</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-600">Usage Data (generation prompts, image preferences)</td>
                    <td className="px-4 py-3 text-sm text-gray-600">Providing and improving the Services</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-600">Device/IP Data (IP address, browser type, device info)</td>
                    <td className="px-4 py-3 text-sm text-gray-600">Security, analytics, and service optimization</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">How We Use Your Personal Data</h2>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li><strong>Providing the Services:</strong> Creating and managing your account, processing image generations, managing subscriptions</li>
              <li><strong>Improving the Services:</strong> Analyzing usage patterns, testing, and product development</li>
              <li><strong>Communicating with You:</strong> Responding to support requests, sending service-related notifications</li>
              <li><strong>Security:</strong> Detecting and preventing fraud, abuse, and security incidents</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">How We Disclose Your Personal Data</h2>
            <p className="text-gray-600 mb-4">We disclose your Personal Data to the following categories of service providers:</p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li><strong>Authentication Provider:</strong> Microsoft Azure AD for secure sign-in with your Microsoft 365 account</li>
              <li><strong>Payment Processor:</strong> Stripe, Inc. for subscription and payment processing. Please see Stripe's privacy policy for information on their data practices.</li>
              <li><strong>Cloud Infrastructure:</strong> Supabase for database and backend services</li>
              <li><strong>AI Image Generation:</strong> Third-party AI services to generate images based on your prompts</li>
              <li><strong>Hosting:</strong> Vercel for website hosting and delivery</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Data Security</h2>
            <p className="text-gray-600 mb-4">
              We seek to protect your Personal Data from unauthorized access, use and disclosure using appropriate physical, technical, organizational and administrative security measures. We use Microsoft Azure AD for authentication, ensuring enterprise-grade security for your login credentials. Payment information is handled securely by Stripe and is never stored on our servers.
            </p>
            <p className="text-gray-600 mb-4">
              Although we work to protect the security of your data, please be aware that no method of transmitting data over the internet or storing data is completely secure.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Data Retention</h2>
            <p className="text-gray-600 mb-4">
              We retain Personal Data for as long as necessary to provide you with our Services. Specifically:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li>Account information is retained while you have an active account</li>
              <li>Generated images are stored in your gallery until you delete them or close your account</li>
              <li>Payment records are retained as required for tax and legal compliance</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Personal Data of Children</h2>
            <p className="text-gray-600 mb-4">
              We do not knowingly collect or solicit Personal Data from children under 18 years of age. If you are under 18, please do not attempt to register for or use the Services. If we learn we have collected Personal Data from a child under 18, we will delete that information as quickly as possible. If you believe that a child under 18 may have provided Personal Data to us, please <Link to="/contact" className="text-blue-600 hover:text-blue-800 underline">contact us</Link>.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Your Privacy Rights</h2>
            <p className="text-gray-600 mb-4">
              Depending on your location, you may have certain rights regarding your Personal Data, including:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li><strong>Access:</strong> Request information about the Personal Data we hold about you</li>
              <li><strong>Correction:</strong> Request correction of inaccurate Personal Data</li>
              <li><strong>Deletion:</strong> Request deletion of your Personal Data</li>
              <li><strong>Portability:</strong> Request a copy of your Personal Data in a machine-readable format</li>
            </ul>
            <p className="text-gray-600 mb-4">
              To exercise any of these rights, please <Link to="/contact" className="text-blue-600 hover:text-blue-800 underline">contact us</Link>.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">California Residents</h2>
            <p className="text-gray-600 mb-4">
              If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA), including the right to know what Personal Data we collect, the right to delete your Personal Data, and the right to opt-out of the sale of your Personal Data. We do not sell your Personal Data.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">European Union and United Kingdom Residents</h2>
            <p className="text-gray-600 mb-4">
              If you are a resident of the EU or UK, you have additional rights under the General Data Protection Regulation (GDPR), including the rights described above as well as the right to withdraw consent and the right to lodge a complaint with a supervisory authority.
            </p>
            <p className="text-gray-600 mb-4">
              Our lawful bases for processing your Personal Data include: contractual necessity (to provide the Services), legitimate interests (to improve and secure the Services), and consent (where expressly provided).
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Cookies</h2>
            <p className="text-gray-600 mb-4">
              We use essential cookies to enable core functionality such as authentication and session management. We may also use analytics cookies to understand how users interact with our Services. You can control cookie settings through your browser preferences.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Changes to This Policy</h2>
            <p className="text-gray-600 mb-4">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Contact Us</h2>
            <p className="text-gray-600 mb-4">
              If you have any questions or comments about this Privacy Policy, please{' '}
              <Link to="/contact" className="text-blue-600 hover:text-blue-800 underline">
                contact us
              </Link>.
            </p>
          </section>
        </article>
      </main>

      <Footer />
    </div>
  )
}
