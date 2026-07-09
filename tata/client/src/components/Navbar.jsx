import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/react";
import "./Navbar.css";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`navbar-base ${scrolled ? "navbar-scrolled" : "navbar-top"}`}>
      {/* Logo */}
      <Link
        to="/"
        className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
        style={{ fontFamily: "'Syne', 'Inter', sans-serif" }}
      >
        InsightBoard
      </Link>

      {/* Desktop Links */}
      <div className={`nav-links-wrap ${open ? "nav-links-open" : ""}`}>
        {["/", "/dashboard", "/services", "/about"].map((path, i) => {
          const labels = ["Home", "Dashboard", "Services", "About"];
          return (
            <Link
              key={path}
              to={path}
              className={`nav-link ${isActive(path) ? "nav-link-active" : ""}`}
            >
              {labels[i]}
            </Link>
          );
        })}

        <div className="hidden md:block w-px h-5 bg-white/8 mx-2" />

        <Show when="signed-out">
          <SignInButton mode="modal">
            <button className="nav-btn-login">Login</button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="nav-btn-signup">Sign Up</button>
          </SignUpButton>
        </Show>
        <Show when="signed-in">
          <UserButton />
        </Show>
      </div>

      {/* Hamburger */}
      <button
        className="md:hidden flex flex-col gap-[5px] p-2 rounded-lg hover:bg-white/5 transition-colors"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        <span className={`hamburger-bar ${open ? "rotate-45 translate-y-[7px]" : ""}`} />
        <span className={`hamburger-bar ${open ? "opacity-0 scale-x-0" : ""}`} />
        <span className={`hamburger-bar ${open ? "-rotate-45 -translate-y-[7px]" : ""}`} />
      </button>
    </nav>
  );
};

export default Navbar;
