import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import ThemeToggle from "./ThemeToggle";
import logo from "../assets/DevSocLogo.png";
import devtestblack from "../assets/DevTextBlack.png";
import devtestwhite from "../assets/DevTextWhite.png";

const Header = ({ offsetTop = false }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme } = useTheme();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Projects", href: "/projects" },
    { name: "Team & Verticals", href: "/team" },
    { name: "Gallery", href: "/gallery" },
    { name: "Inductees", href: "/inductees", highlight: true },
  ];

  const newBadge = (
    <span className="relative flex w-1.5 h-1.5">
      <span className="absolute inset-0 rounded-full bg-teal-500 dark:bg-teal-400 animate-ping" />
      <span className="relative w-1.5 h-1.5 rounded-full bg-teal-500 dark:bg-teal-400" />
    </span>
  );

  const handleNavClick = (href) => {
    setIsMenuOpen(false);

    if (href.startsWith("/#")) {
      if (location.pathname !== "/") {
        window.location.href = href;
      } else {
        const element = document.querySelector(href.substring(1));
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  };

  const isActive = (href) => {
    if (href === "/") {
      return location.pathname === "/";
    }
    if (href.startsWith("/#")) {
      return location.pathname === "/" && location.hash === href.substring(1);
    }
    return location.pathname === href;
  };

  return (
    <header
      className={`fixed left-0 right-0 z-50 transition-all duration-300 ${
        offsetTop ? "top-9" : "top-0"
      } ${
        isScrolled
          ? "backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 z-10">
            <img src={logo} alt="DevSoc Logo" className="w-10 h-8" />
            {theme === "dark" ? (
              <img
                src={devtestwhite}
                alt="DevSoc Logo Light"
                className="w-15 h-8"
              />
            ) : (
              <img
                src={devtestblack}
                alt="DevSoc Logo Dark"
                className="w-15 h-8"
              />
            )}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) =>
              item.href.startsWith("/#") ? (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item.href)}
                  className={`transition-colors duration-200 text-sm font-medium ${
                    isActive(item.href)
                      ? "text-teal-600 dark:text-teal-400"
                      : "text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400"
                  }`}
                >
                  {item.name}
                </button>
              ) : (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`inline-flex items-center gap-1.5 transition-colors duration-200 text-sm font-medium ${
                    isActive(item.href)
                      ? "text-teal-600 dark:text-teal-400"
                      : "text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400"
                  }`}
                >
                  {item.name}
                  {item.highlight && newBadge}
                </Link>
              )
            )}
            <ThemeToggle />
          </div>

          {/* Mobile Menu Button and Theme Toggle */}
          <div className="lg:hidden flex items-center space-x-3 z-10">
            <ThemeToggle />
            <button
              className="p-2 rounded-md text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`lg:hidden transition-all duration-300 ease-in-out ${
            isMenuOpen
              ? "max-h-96 opacity-100 mt-4 py-4 border-t border-slate-200 dark:border-slate-800"
              : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          <div className="space-y-1">
            {navItems.map((item) =>
              item.href.startsWith("/#") ? (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item.href)}
                  className={`block w-full text-left py-3 px-2 rounded-md transition-colors duration-200 text-sm font-medium ${
                    isActive(item.href)
                      ? "text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20"
                      : "text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  {item.name}
                </button>
              ) : (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-1.5 py-3 px-2 rounded-md transition-colors duration-200 text-sm font-medium ${
                    isActive(item.href)
                      ? "text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20"
                      : "text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  {item.name}
                  {item.highlight && newBadge}
                </Link>
              )
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
