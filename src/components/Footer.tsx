import { Mail, Instagram, Facebook } from "lucide-react"

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-gray-950 text-gray-300 border-t border-gray-800 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">

        {/* About Section */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">About</h3>
          <p className="text-sm leading-relaxed text-gray-400">
            <strong>Your Crayon Story</strong> turns imagination into colorful adventures
            with personalized storybooks where every child becomes the hero of their own tale.
          </p>
        </div>

        {/* Contact Section */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Contact</h3>
          <p className="text-sm text-gray-400">
            Have a question or idea?<br />
            We’d love to hear from you!
          </p>
          <a
            href="mailto:hello@yourcrayonstory.com"
            className="mt-3 inline-flex items-center text-pink-400 hover:text-pink-300 text-sm"
          >
            <Mail className="w-4 h-4 mr-2" /> hello@yourcrayonstory.com
          </a>
        </div>

        {/* Social Media Section */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Follow Us</h3>
          <ul className="flex gap-4">
            <li>
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-pink-400 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </li>
            <li>
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-pink-400 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </li>
          </ul>
        </div>

        {/* Legal Section */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Legal</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>
              <a href="/terms" className="hover:text-pink-400 transition-colors">
                Terms &amp; Conditions
              </a>
            </li>
            <li>
              <a href="/privacy" className="hover:text-pink-400 transition-colors">
                Privacy Policy
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Line */}
      <div className="border-t border-gray-800 py-6 text-center text-xs text-gray-500">
        © {year} Your Crayon Story. All rights reserved.
      </div>
    </footer>
  )
}