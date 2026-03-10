/**
 * @file slugUtils.js
 * @description Bulletproof slug resolution for multi-tenant API calls.
 *
 * Priority chain (highest → lowest):
 *  1. Explicit slug argument passed by the caller
 *  2. React Router URL param  (/:slug/...)  — position [1] of pathname
 *  3. localStorage cached slug  (set on login / barberia selection)
 *  4. Throws an error so the bug is surfaced immediately instead of
 *     silently calling /api/barberos without a tenant.
 */

const SLUG_CACHE_KEY = 'currentBarberiaSlug';

/**
 * Returns the slug stored in localStorage (if any).
 */
export function getCachedSlug() {
    return localStorage.getItem(SLUG_CACHE_KEY) || null;
}

/**
 * Persist the active slug so service calls work even when the router
 * hasn't mounted yet (e.g., hard refresh, redirect mid-navigation).
 */
export function setCachedSlug(slug) {
    if (slug && slug.length > 0 && slug !== 'admin' && slug !== 'superadmin') {
        localStorage.setItem(SLUG_CACHE_KEY, slug);
    }
}

/**
 * Resolve the active barbería slug using the priority chain above.
 *
 * @param {string} [override] – Explicit slug from the caller (highest priority)
 * @returns {string} – The resolved slug
 * @throws {Error}  – If no slug can be determined
 */
export function getSlug(override) {
    // 1. Caller-provided override
    if (override && override.trim().length > 0) {
        setCachedSlug(override.trim());
        return override.trim();
    }

    // 2. URL-based: expect /:slug/...
    const parts = window.location.pathname.split('/');
    const fromUrl = parts[1]; // e.g. "ilovebarbero"

    // Guard: skip known non-slug top-level paths
    const RESERVED = new Set(['admin', 'superadmin', 'login', 'signup', 'auth',
        'pricing', 'precios', 'terminos', 'privacidad', 'reset-password',
        'forgot-password', '']);

    if (fromUrl && !RESERVED.has(fromUrl)) {
        setCachedSlug(fromUrl);
        return fromUrl;
    }

    // 3. localStorage fallback
    const cached = getCachedSlug();
    if (cached) return cached;

    // 4. Cannot determine slug — fail loud so developers notice immediately
    const err = new Error(
        `[slugUtils] Cannot determine barbería slug.\n` +
        `URL: ${window.location.pathname}\n` +
        `Make sure you are on a /:slug/* route or pass the slug explicitly.`
    );
    console.error(err);
    throw err;
}

export default getSlug;
