export default function Privacy() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 text-gray-200 leading-relaxed">
      <h1 className="text-4xl font-bold text-pink-400 mb-6 text-center">
        Privacy Policy
      </h1>

      <p className="mb-4">
        Your privacy matters to us. This policy explains how{" "}
        <strong>Your Crayon Story</strong> collects, uses, and protects your
        information.
      </p>

      <h2 className="text-xl font-semibold text-white mt-8 mb-3">
        1. Information We Collect
      </h2>
      <p className="mb-4">
        When you create an account, personalize a story, or make a purchase, we
        collect basic details such as your name, email address, and child’s
        first name for personalization. We do not store any payment details —
        all transactions are securely handled by Stripe.
      </p>

      <h2 className="text-xl font-semibold text-white mt-8 mb-3">
        2. How We Use Your Information
      </h2>
      <p className="mb-4">
        We use your information to create your personalized books, send order
        updates, and improve our services. We never sell or share your data with
        third parties except as necessary to complete your order.
      </p>

      <h2 className="text-xl font-semibold text-white mt-8 mb-3">
        3. Cookies
      </h2>
      <p className="mb-4">
        We use cookies to keep your session active and enhance your experience.
        You can disable cookies in your browser settings, but some features may
        not function correctly.
      </p>

      <h2 className="text-xl font-semibold text-white mt-8 mb-3">
        4. Children’s Data
      </h2>
      <p className="mb-4">
        Child information is used solely for personalization. We do not contact
        children directly or share their data. Parents may request deletion of
        stored child profiles at any time.
      </p>

      <h2 className="text-xl font-semibold text-white mt-8 mb-3">
        5. Security
      </h2>
      <p className="mb-4">
        We follow industry standards to protect your data. However, please note
        that no online service is completely risk-free.
      </p>

      <h2 className="text-xl font-semibold text-white mt-8 mb-3">
        6. Contact
      </h2>
      <p className="mb-4">
        For privacy-related questions or data requests, email us at{" "}
        <a
          href="mailto:hello@yourcrayonstory.com"
          className="text-pink-400 hover:text-pink-300"
        >
          hello@yourcrayonstory.com
        </a>
        .
      </p>

      <p className="text-center italic mt-10 text-gray-400">
        Last updated: October 2025
      </p>
    </main>
  )
}