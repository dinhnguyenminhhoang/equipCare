import { XMarkIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

const AlertBanner = ({ type, icon: Icon, title, message, action }) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const typeStyles = {
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    error: "bg-red-50 border-red-200 text-red-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
    success: "bg-green-50 border-green-200 text-green-800",
  };

  const iconStyles = {
    warning: "text-yellow-400",
    error: "text-red-400",
    info: "text-blue-400",
    success: "text-green-400",
  };

  return (
    <div className={`border-l-4 p-4 ${typeStyles[type]}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${iconStyles[type]}`} aria-hidden="true" />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">{title}</p>
          <p className="mt-1 text-sm">{message}</p>
          {action && (
            <div className="mt-2">
              <a
                href={action.href}
                className="text-sm font-medium underline hover:no-underline"
              >
                {action.text}
              </a>
            </div>
          )}
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2"
            >
              <span className="sr-only">Dismiss</span>
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AlertBanner;
