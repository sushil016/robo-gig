/**
 * Footer Component
 * Site-wide footer with links, info, and social media
 */

import Link from 'next/link';
import { Github, Linkedin, Twitter, Mail } from 'lucide-react';

const footerGroups = [
  {
    title: "Quick Links",
    links: [
      ["Browse Components", "/components"],
      ["Browse Categories", "/categories"],
      ["Featured Projects", "/projects"],
      ["Robomaniac Store", "/robomaniac-store"],
      ["About Us", "/about"],
      ["Contact", "/contact"],
    ],
  },
  {
    title: "Account",
    links: [
      ["My Orders", "/orders"],
      ["Wishlist", "/wishlist"],
      ["Cart", "/cart"],
      ["Settings", "/settings"],
      ["Profile", "/profile"],
    ],
  },
  {
    title: "Support",
    links: [
      ["Help Center", "/help"],
      ["Shipping Info", "/shipping"],
      ["Returns & Refunds", "/returns"],
      ["FAQs", "/faq"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["Privacy Policy", "/privacy"],
      ["Terms of Service", "/terms"],
      ["Refund Policy", "/refund-policy"],
    ],
  },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[#D8D8C4] bg-zinc-950">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[1.2fr_repeat(4,minmax(0,1fr))]">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1CA2D1] font-bold text-white">R</div>
              <span className="text-xl font-bold text-[#FAFAED]">RoboRoot</span>
            </div>
            <p className="text-sm text-zinc-400">
              Your one-stop destination for robotics components and DIY projects.
              Empowering students and makers to build innovative solutions.
            </p>
            <div className="text-sm text-zinc-400">
              <p className="font-semibold text-[#FAFAED]">roboroot.in</p>
              <p>Making robotics accessible for everyone</p>
            </div>
          </div>

          {footerGroups.map((group) => (
            <div key={group.title}>
              <h3 className="mb-4 font-semibold text-[#FAFAED]">{group.title}</h3>
              <ul className="space-y-2">
                {group.links.map(([label, href]) => (
                  <li key={href}>
                    <Link href={href} className="footer-link-underline pb-0.5 text-sm text-zinc-400 hover:text-[#FAFAED] transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="md:col-start-5">
            <h4 className="mb-3 font-semibold text-[#FAFAED]">Connect With Us</h4>
            <div className="flex space-x-3">
              <a href="https://twitter.com/roboroot" target="_blank" rel="noopener noreferrer"
                className="rounded-md border border-zinc-800 p-2 text-zinc-400 hover:border-[#1CA2D1] hover:text-[#1CA2D1] transition-colors" aria-label="Twitter">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="https://github.com/roboroot" target="_blank" rel="noopener noreferrer"
                className="rounded-md border border-zinc-800 p-2 text-zinc-400 hover:border-[#1CA2D1] hover:text-[#1CA2D1] transition-colors" aria-label="GitHub">
                <Github className="h-4 w-4" />
              </a>
              <a href="https://linkedin.com/company/roboroot" target="_blank" rel="noopener noreferrer"
                className="rounded-md border border-zinc-800 p-2 text-zinc-400 hover:border-[#1CA2D1] hover:text-[#1CA2D1] transition-colors" aria-label="LinkedIn">
                <Linkedin className="h-4 w-4" />
              </a>
              <a href="mailto:support@roboroot.in"
                className="rounded-md border border-zinc-800 p-2 text-zinc-400 hover:border-[#1CA2D1] hover:text-[#1CA2D1] transition-colors" aria-label="Email">
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-zinc-800 pt-8">
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <p className="text-sm text-zinc-500">© {currentYear} RoboRoot. All rights reserved.</p>
            <p className="text-sm text-zinc-500">Built with ❤️ for makers and innovators</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
