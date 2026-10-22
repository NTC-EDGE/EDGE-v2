"use client";

import { useEffect } from "react";
import { toast } from "sonner";

interface ForbiddenEventDetail {
  url?: string;
  method?: string;
  detail?: string;
}

export function ForbiddenAccessToast() {
  useEffect(() => {
    const handleForbidden = (evt: Event) => {
      const customEvt = evt as CustomEvent<ForbiddenEventDetail>;
      const detail = customEvt.detail?.detail;
      const url = customEvt.detail?.url;
      const method = customEvt.detail?.method;

      let msg = "You don't have permission to perform this action.";
      if (typeof detail === "string" && detail.trim().length > 0) {
        msg = detail.trim();
      } else if (typeof url === "string" && url.length > 0) {
        const cleanPath = url.split("?")[0].replace(/^\/api\/v\d+\//, "");
        const actionVerb =
          typeof method === "string"
            ? method.toUpperCase() === "POST" ? "perform create operation on"
              : method.toUpperCase() === "PUT" || method.toUpperCase() === "PATCH" ? "perform update operation on"
              : method.toUpperCase() === "DELETE" ? "perform delete operation on"
              : "access"
            : "access";
        msg = `You don't have permission to ${actionVerb} resource (${cleanPath}).`;
      }

      toast.error(msg);
    };

    window.addEventListener("forbidden-access", handleForbidden);
    return () => {
      window.removeEventListener("forbidden-access", handleForbidden);
    };
  }, []);

  return null;
}
