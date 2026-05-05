import { supabase } from "./supabase.js";

let authToken = null;

// Initialize auth token
supabase.auth.getSession().then(({ data: { session } }) => {
  if (session) {
    authToken = session.access_token;
    console.log("✅ Auth token initialized for proxy");
  }
});

// Listen for auth changes
supabase.auth.onAuthStateChange((event, session) => {
  if (session) {
    authToken = session.access_token;
    console.log("✅ Auth token updated via state change");
  } else {
    authToken = null;
  }
});

/**
 * Fetches a resource through the proxy and returns a blob URL for use with epub readers
 * Token is sent via Authorization header (secure, not in URL)
 * @param originalUrl The original URL to be proxied
 * @returns Promise<string> A blob URL that can be used with react-reader
 */
export async function getProxiedBlob(originalUrl) {
  if (!originalUrl) {
    return null;
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) {
    console.warn("VITE_SUPABASE_URL not configured");
    return null;
  }

  // Wait for token if not available
  if (!authToken) {
    console.log("⏳ Waiting for auth token...");
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) {
      authToken = session.access_token;
    }
  }

  if (!authToken) {
    console.error("❌ No auth token available");
    throw new Error("User not authenticated");
  }

  const proxyUrl = `${supabaseUrl}/functions/v1/fetch-epub`

  console.log("📥 Fetching resource through proxy:", originalUrl);

  try {
    // Send token in Authorization header (secure!)
    const response = await fetch(proxyUrl, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "X-Target-Url": originalUrl
      },
    });

    if (!response.ok) {
      throw new Error(
        `Proxy returned ${response.status}: ${response.statusText}`,
      );
    }

    const blob = (await response.blob());

    return blob;
  } catch (error) {
    console.error("❌ Error fetching through proxy:", error);
    throw error;
  }
}
