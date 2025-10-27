export default function Terms() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 text-gray-200 leading-relaxed">
      <h1 className="text-4xl font-bold text-pink-400 mb-6 text-center">
        Terms &amp; Conditions
      </h1>

      <p className="mb-4">
        Welcome to <strong>Your Crayon Story</strong>! By using our website,
        creating personalized stories, or purchasing products from us, you agree
        to the following terms. Please read them carefully.
      </p>

      <h2 className="text-xl font-semibold text-white mt-8 mb-3">
        1. Use of Our Services
      </h2>
      <p className="mb-4">
        Our stories are created for personal, non-commercial use. You may print
        and share the digital files you purchase for your family’s enjoyment but
        not resell, distribute, or reproduce them for profit.
      </p>

      <h2 className="text-xl font-semibold text-white mt-8 mb-3">
        2. Payments &amp; Orders
      </h2>
      <p className="mb-4">
        Payments are securely processed through Stripe. Once a purchase is
        completed, you’ll receive a confirmation email and a link to download
        your personalized storybook.
      </p>

      <h2 className="text-xl font-semibold text-white mt-8 mb-3">
        3. Refunds
      </h2>
      <p className="mb-4">
        Because each book is uniquely generated for your child, refunds are
        generally not available. However, if there’s a problem with your order,
        please contact us at{" "}
        <a
          href="mailto:hello@yourcrayonstory.com"
          className="text-pink-400 hover:text-pink-300"
        >
          hello@yourcrayonstory.com
        </a>
        , and we’ll do our best to help.
      </p>

      <h2 className="text-xl font-semibold text-white mt-8 mb-3">
        4. Intellectual Property
      </h2>
      <p className="mb-4">
        All artwork, text, and designs on this site are owned by Your Crayon Story
        and protected by copyright law. Please respect our creative work.
      </p>

      <h2 className="text-xl font-semibold text-white mt-8 mb-3">
        5. Updates
      </h2>
      <p className="mb-4">
        We may update these Terms from time to time. Continued use of the site
        after changes means you accept the revised version.
      </p>

      <p className="text-center italic mt-10 text-gray-400">
        Last updated: October 2025
      </p>
    </main>
  )
}