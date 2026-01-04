import { useEffect } from 'react'

export default function TermsOfServicePage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="container max-w-4xl py-10 px-4">
      <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
      <p className="text-sm text-gray-600 mb-8">
        Last updated: {new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}
      </p>

      <div className="prose prose-slate max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing and using PetCare Manager, you agree to be bound by these Terms of Service. 
            If you do not agree to these terms, please do not use our service.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
          <p>PetCare Manager is a web application that helps you:</p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>Track pet health records (vaccinations, vet visits, prescriptions)</li>
            <li>Receive reminders for upcoming health events</li>
            <li>Manage supply schedules</li>
            <li>Store vet contact information</li>
            <li>Export your pet data</li>
          </ul>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. User Responsibilities</h2>
          <p className="mb-4">You agree to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide accurate information about your pets and their health records</li>
            <li>Keep your account credentials secure</li>
            <li>Not share your account with others</li>
            <li>Use the service lawfully and respectfully</li>
            <li>Not attempt to hack, spam, or abuse the service</li>
          </ul>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Medical Disclaimer</h2>
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 my-4">
            <p className="font-semibold text-yellow-800">IMPORTANT:</p>
            <p className="mt-2 text-yellow-700">
              PetCare Manager is NOT a substitute for professional veterinary care. Always 
              consult your veterinarian for medical advice, diagnosis, or treatment. We are 
              not responsible for any health outcomes related to your pet.
            </p>
          </div>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Affiliate Disclosure</h2>
          <p>
            We participate in affiliate programs with Chewy, Amazon, and Petco. When you click 
            affiliate links and make a purchase, we may earn a commission at no extra cost to you. 
            This helps support our service.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Limitation of Liability</h2>
          <p>PetCare Manager is provided "as is" without warranties of any kind. We are not liable for:</p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>Loss of data (though we make reasonable efforts to prevent this)</li>
            <li>Missed reminders or notifications</li>
            <li>Health outcomes for your pets</li>
            <li>Errors or inaccuracies in the service</li>
          </ul>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Account Termination</h2>
          <p>
            You may delete your account at any time through Settings. We may terminate accounts 
            that violate these terms or engage in abusive behavior.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Changes to Terms</h2>
          <p>
            We may update these terms from time to time. Continued use of the service after 
            changes constitutes acceptance of the new terms.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Governing Law</h2>
          <p>
            These terms are governed by the laws of [Your Country/State]. Any disputes will be 
            resolved in [Your Jurisdiction] courts.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. Contact</h2>
          <p>Questions about these terms? Contact us at: legal@petcaremanager.com</p>
        </section>
      </div>
    </div>
  )
}
