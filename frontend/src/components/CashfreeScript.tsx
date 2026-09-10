"use client";

import Script from "next/script";

export default function CashfreeScript() {
  return (
    <Script
      id="cashfree-checkout"
      src="https://sdk.cashfree.com/js/v3/cashfree.js"
      strategy="lazyOnload"
    />
  );
}
