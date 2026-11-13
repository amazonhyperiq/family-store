import { createClient } from "@nhost/nhost-js";

const subdomain = import.meta.env.VITE_NHOST_SUBDOMAIN;
const region = import.meta.env.VITE_NHOST_REGION;

export const nhostConfigured =
  Boolean(subdomain && region) &&
  subdomain !== "YOUR_NHOST_SUBDOMAIN" &&
  region !== "YOUR_NHOST_REGION";

export const nhost = nhostConfigured
  ? createClient({ subdomain, region })
  : null;
