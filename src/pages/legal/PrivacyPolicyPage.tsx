import { useEffect } from 'react'

export default function PrivacyPolicyPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="container max-w-4xl py-10 px-4">
      <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
      <p className="text-sm text-gray-600 mb-8">
        Last updated: {new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}
      </p>

      <div className="prose prose-slate max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
          <p className="mb-4">We collect information you provide directly:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Account information:</strong> Email address, full name</li>
            <li><strong>Pet profiles:</strong> Pet name, species, breed, date of birth, weight, microchip number, photos</li>
            <li><strong>Health records:</strong> Vaccinations, vet visits, prescriptions, medical procedures</li>
            <li><strong>Supply schedules:</strong> Product names, purchase dates, reminder preferences</li>
            <li><strong>Vet directory:</strong> Veterinarian contact information you save</li>
          </ul>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
          <p className="mb-4">We use your information to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide pet care tracking services</li>
            <li>Send health and supply reminders (push notifications and email)</li>
            <li>Store and sync your pet data across devices</li>
            <li>Improve our services based on usage patterns</li>
          </ul>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Data Sharing and Third Parties</h2>
          <p className="mb-4">We use these third-party services:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Supabase:</strong> Database hosting and authentication (data stored in US-East-1)</li>
            <li><strong>Resend:</strong> Email notifications (transactional emails only)</li>
            <li><strong>Plausible Analytics:</strong> Privacy-first analytics (no cookies, no personal data collected)</li>
            <li><strong>Affiliate Partners:</strong> We display affiliate links (Chewy, Amazon, Petco) but do not share your personal data</li>
          </ul>
          <p className="mt-4">We do NOT sell your personal data to third parties.</p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Your Rights (GDPR & CCPA)</h2>
          <p className="mb-4">You have the right to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Access:</strong> Export all your data via Settings → Data Export</li>
            <li><strong>Delete:</strong> Delete your account and all data via Settings</li>
            <li><strong>Opt-out:</strong> Disable push notifications and email reminders via Settings</li>
            <li><strong>Correct:</strong> Edit any pet or health record information</li>
            <li><strong>Portability:</strong> Download your data in CSV format</li>
          </ul>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
          <p>We use industry-standard security measures including:</p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>Encrypted connections (HTTPS/TLS)</li>
            <li>Secure authentication (Supabase Auth)</li>
            <li>Row Level Security (RLS) policies on database</li>
            <li>Regular security updates</li>
          </ul>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Cookies and Tracking</h2>
          <p>We use minimal cookies:</p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li><strong>Authentication:</strong> Supabase session cookie (required for login)</li>
            <li><strong>Analytics:</strong> Plausible (privacy-first, no personal data, GDPR compliant)</li>
          </ul>
          <p className="mt-4">We do NOT use advertising cookies or tracking pixels.</p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Children's Privacy</h2>
          <p>
            PetCare Manager is not intended for children under 13. We do not knowingly collect 
            personal information from children under 13.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Changes to This Policy</h2>
          <p>
            We may update this privacy policy from time to time. We will notify you of any 
            changes by updating the "Last updated" date at the top of this policy.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
          <p>
            If you have questions about this privacy policy or your data, contact us at:
          </p>
          <p className="mt-4">
            <strong>Email:</strong> privacy@petcaremanager.com
          </p>
        </section>
      </div>
    </div>
  )
}
