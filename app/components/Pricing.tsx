import { CheckCircle } from "lucide-react";
import React from "react";

const tiers = [
  {
    name: "Basic",
    id: "tier-basic",
    href: "/login",
    priceMonthly: "$20 ", // Updated price
    description:
      "An ideal plan for small businesses to manage stock and invoices.",
    features: [
      "Generate up to 100 invoices/month",

      "50 products inventory tracking",
      "Email reminders for payments",
    ],
    featured: false,
  },
  {
    name: "Pro",
    id: "tier-pro",
    href: "#",
    priceMonthly: "$40", // Updated price
    description:
      "Advanced features for medium-sized businesses to optimize invoicing and inventory.",
    features: [
      "Generate unlimited invoices",
      "Automated email campaigns for payments",
      "Detailed stock inventory tracking",
      "Customizable invoice templates",
      "Priority customer support",
    ],
    featured: true,
  },
  {
    name: "Enterprise",
    id: "tier-enterprise",
    href: "#",
    priceMonthly: "$250", // New price
    description:
      "Complete solution for large businesses with advanced features and full control over stock and invoicing.",
    features: [
      "Unlimited invoice generation",
      "Advanced reporting and analytics",
      "Customizable payment reminders",
      "Dedicated account manager",
      "Priority customer support and onboarding",
      "Multi-location inventory management",
    ],
    featured: false,
  },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

const InvoicingPlans: React.FC = () => {
  return (
    <div className="relative isolate bg-gradient-to-r from-white via-green-100 to-white px-6 py-24 sm:py-32 lg:px-8">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 -top-3 -z-10 transform-gpu overflow-hidden px-36 blur-3xl"
      >
        <div
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
          className="mx-auto aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-green-300 to-green-400 opacity-30"
        />
      </div>
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-base/7 font-semibold text-green-600">
          Invoicing Plans
        </h2>
        <p className="mt-2 text-balance text-5xl font-semibold tracking-tight text-gray-900 sm:text-6xl">
          Manage your invoices and inventory with ease
        </p>
      </div>
      <p className="mx-auto mt-6 max-w-2xl text-pretty text-center text-lg font-medium text-gray-600 sm:text-xl/8">
        Choose the plan that suits your business needs for managing invoices,
        tracking inventory, and keeping clients up to date.
      </p>
      <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 gap-y-6 sm:mt-20 sm:grid-cols-1 lg:max-w-7xl lg:grid-cols-3 lg:gap-x-6">
        {tiers.map((tier, tierIdx) => (
          <div
            key={tier.id}
            className={classNames(
              tier.featured
                ? "relative bg-black shadow-2xl"
                : "bg-white/60 sm:mx-8 lg:mx-0",
              tier.featured
                ? ""
                : tierIdx === 0
                  ? "rounded-t-3xl sm:rounded-b-none lg:rounded-bl-3xl lg:rounded-tr-none"
                  : "sm:rounded-t-none lg:rounded-bl-none lg:rounded-tr-3xl",
              "rounded-3xl p-6 ring-1 ring-gray-900/10 sm:p-8 flex flex-col", // Reduced padding here
            )}
          >
            <h3
              id={tier.id}
              className={classNames(
                tier.featured ? "text-green-400" : "text-green-600",
                "text-base/7 font-semibold",
              )}
            >
              {tier.name}
            </h3>
            <p className="mt-4 flex items-baseline gap-x-2">
              <span
                className={classNames(
                  tier.featured ? "text-white" : "text-gray-900",
                  "text-5xl font-semibold tracking-tight",
                )}
              >
                {tier.priceMonthly}
              </span>
              <span
                className={classNames(
                  tier.featured ? "text-gray-400" : "text-gray-500",
                  "text-base",
                )}
              >
                /month
              </span>
            </p>
            <p
              className={classNames(
                tier.featured ? "text-gray-300" : "text-gray-600",
                "mt-4 text-base/7",
              )}
            >
              {" "}
              {/* Reduced margin */}
              {tier.description}
            </p>
            <ul
              role="list"
              className={classNames(
                tier.featured ? "text-gray-300" : "text-gray-600",
                "mt-6 space-y-3 text-sm/6 sm:mt-8 flex-grow", // Reduced margin
              )}
            >
              {tier.features.map((feature) => (
                <li key={feature} className="flex gap-x-3">
                  <CheckCircle
                    aria-hidden="true"
                    className={classNames(
                      tier.featured ? "text-green-400" : "text-green-600",
                      "h-6 w-5 flex-none",
                    )}
                  />
                  {feature}
                </li>
              ))}
            </ul>
            <div className="mt-auto flex justify-center">
              <a
                href={tier.href}
                aria-describedby={tier.id}
                className={classNames(
                  tier.featured
                    ? "bg-green-500 text-white shadow-sm hover:bg-green-400 focus-visible:outline-green-500"
                    : "text-green-600 ring-1 ring-inset ring-green-200 hover:ring-green-300 focus-visible:outline-green-600",
                  "rounded-md px-3.5 py-2.5 text-center text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:mt-8", // Reduced margin
                )}
              >
                Get started today
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InvoicingPlans;
