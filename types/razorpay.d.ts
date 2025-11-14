declare global {
  interface RazorpayPrefill {
    email?: string;
    name?: string;
    contact?: string;
  }

  interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name?: string;
    description?: string;
    order_id: string;
    prefill?: RazorpayPrefill;
    notes?: Record<string, unknown>;
    handler?: (response: unknown) => void;
  }

  interface RazorpayCheckout {
    open: () => void;
  }

  interface RazorpayConstructor {
    new (options: RazorpayOptions): RazorpayCheckout;
  }

  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

export {};
