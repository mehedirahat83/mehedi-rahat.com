"use client";

import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useState,
} from "react";

export default function AdminSidebar({ active }: { active?: string }) {
  const [pathname, setPathname] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => setPathname(window.location.pathname), []);

  async function signOut() {
    try {
      await fetch("/api/admin/session", { method: "DELETE" });
    } finally {
      window.location.replace("/admin/login");
    }
  }

  const single = [
    ["▦", "Dashboard", "/admin", "overview"],
    ["▣", "Orders", "/admin/orders", "orders"],
    ["♟", "Customers", "/admin/customers", "customers"],
    ["✉", "Enquiries", "/admin/enquiries", "enquiries"],
  ];
  const after = [
    ["⚒", "Services", "/admin/services", "services"],
    ["◇", "My Projects", "/admin/projects", "projects"],
    ["★", "Reviews / Testimonials", "/admin/reviews", "reviews"],
    ["▰", "Support Tickets", "/admin/support-tickets", "tickets"],
    ["⚙", "Activation Requests", "#activations", "activations"],
    ["⌁", "License Management", "#licenses", "licenses"],
    ["%", "Coupons", "#coupons", "coupons"],
    ["▤", "Reports", "#reports", "reports"],
  ];

  return (
    <aside
      className={`admin-sidebar cms-sidebar ${
        mobileOpen ? "mobile-open" : ""
      }`}
    >
      <a className="admin-brand" href="/admin">
        <span>MR</span>
        <div>
          <b>MEHEDI RAHAT</b>
          <small>ADMIN PANEL</small>
        </div>
      </a>
      <button
        className="admin-mobile-toggle"
        type="button"
        aria-expanded={mobileOpen}
        aria-label={mobileOpen ? "Close admin menu" : "Open admin menu"}
        onClick={() => setMobileOpen((value) => !value)}
      >
        {mobileOpen ? "×" : "☰"}
      </button>
      <div className="admin-sidebar-content">
        <div className="admin-owner">
          <span>M</span>
          <div>
            <b>Mehedi Rahat</b>
            <small>Super Admin</small>
          </div>
        </div>
        <nav>
          {single.map((item) => (
            <a
              className={active === item[3] ? "active" : ""}
              href={item[2]}
              key={item[1]}
            >
              <i>{item[0]}</i>
              <span>{item[1]}</span>
            </a>
          ))}
        </nav>
        <CmsGroup
          icon="◇"
          label="Products"
          active={active === "products"}
          pathname={pathname}
        >
          <a href="/admin/products">All Products</a>
          <a href="/admin/products/new">Add Product</a>
          <a href="/admin/products/categories">Categories</a>
          <a href="/admin/products/variations">Variations</a>
          <a href="/admin/products/faq">Product FAQ</a>
        </CmsGroup>
        <CmsGroup
          icon="▣"
          label="Ready Themes"
          active={active === "themes"}
          pathname={pathname}
        >
          <a href="/admin/themes">All Themes</a>
          <a href="/admin/themes/new">Add Theme</a>
          <a href="/admin/themes/categories">Categories</a>
          <a href="/admin/themes/package-features">Package Features</a>
          <a href="/admin/themes/faq">Theme FAQ</a>
        </CmsGroup>
        <nav className="cms-plain-links">
          {after.slice(0, 3).map((item) => (
            <a
              className={active === item[3] ? "active" : ""}
              href={item[2]}
              key={item[1]}
            >
              <i>{item[0]}</i>
              <span>{item[1]}</span>
            </a>
          ))}
        </nav>
        <CmsGroup
          icon="▤"
          label="Pages"
          active={active === "pages"}
          pathname={pathname}
        >
          <a href="/admin/pages/homepage">Homepage</a>
          <a href="/admin/pages/services">Services</a>
          <a href="/admin/pages/client-projects">Client Projects</a>
          <a href="/admin/pages/mr-commerce-pro">MR Commerce Pro</a>
          <a href="#about">About</a>
          <a href="/admin/pages/contact">Contact</a>
          <a href="#other-pages">Other pages</a>
        </CmsGroup>
        <nav className="cms-plain-links">
          {after.slice(3).map((item) => (
            <a href={item[2]} key={item[1]}>
              <i>{item[0]}</i>
              <span>{item[1]}</span>
            </a>
          ))}
        </nav>
        <CmsGroup icon="⚙" label="Website Settings" pathname={pathname}>
          <a href="#header">Header</a>
          <a href="#footer">Footer</a>
          <a href="#contact-info">Contact information</a>
          <a href="#payment-settings">Payment methods</a>
          <a href="/admin/membership-tiers">Membership rules</a>
          <a href="#seo-settings">SEO settings</a>
          <a href="#admin-users">Admin users</a>
          <a href="/admin/smtp-settings">Email / SMTP settings</a>
        </CmsGroup>
        <div className="admin-sidebar-foot">
          <a href="/">View website ↗</a>
          <button type="button" onClick={signOut}>
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}

function CmsGroup({
  icon,
  label,
  active,
  pathname,
  children,
}: {
  icon: string;
  label: string;
  active?: boolean;
  pathname: string;
  children: React.ReactNode;
}) {
  const links = Children.map(children, (child) => {
    if (!isValidElement<{ href?: string; className?: string }>(child)) {
      return child;
    }
    const current = Boolean(
      child.props.href?.startsWith("/") && pathname === child.props.href,
    );
    return cloneElement(child, {
      className: `${child.props.className || ""}${
        current ? " current" : ""
      }`.trim(),
      "aria-current": current ? "page" : undefined,
    } as React.HTMLAttributes<HTMLElement>);
  });

  return (
    <details className={`cms-menu-group ${active ? "active" : ""}`} open>
      <summary>
        <i>{icon}</i>
        <span>{label}</span>
        <b>⌄</b>
      </summary>
      <div>{links}</div>
    </details>
  );
}
