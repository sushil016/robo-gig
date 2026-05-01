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
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[1.2fr_repeat(4,minmax(0,1fr))]">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground font-bold">
                R
              </div>
              <span className="font-bold text-xl">RoboRoot</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your one-stop destination for robotics components and DIY projects. 
              Empowering students and makers to build innovative solutions.
            </p>
            <div className="text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">roboroot.in</p>
              <p>Making robotics accessible for everyone</p>
            </div>
          </div>

          {footerGroups.map((group) => (
            <div key={group.title}>
              <h3 className="font-semibold mb-4">{group.title}</h3>
              <ul className="space-y-2">
                {group.links.map(([label, href]) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Social Media */}
          <div className="md:col-start-5">
              <h4 className="font-semibold mb-3">Connect With Us</h4>
              <div className="flex space-x-3">
                <a
                  href="https://twitter.com/roboroot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-md bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="h-4 w-4" />
                </a>
                <a
                  href="https://github.com/roboroot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-md bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
                  aria-label="GitHub"
                >
                  <Github className="h-4 w-4" />
                </a>
                <a
                  href="https://linkedin.com/company/roboroot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-md bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
                <a
                  href="mailto:support@roboroot.in"
                  className="p-2 rounded-md bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
                  aria-label="Email"
                >
                  <Mail className="h-4 w-4" />
                </a>
              </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-muted-foreground">
              © {currentYear} RoboRoot. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground">
              Built with ❤️ for makers and innovators
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
