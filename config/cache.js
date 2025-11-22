// ========================================================
// CACHE — YUNO IA 10.3
// Pequeno cache interno de alta performance
// ========================================================

const cacheStore = new Map();

export const Cache = {
    set(key, value, ttl = 30000) {
        cacheStore.set(key, {
            value,
            expiry: Date.now() + ttl
        });
    },

    get(key) {
        const item = cacheStore.get(key);
        if (!item) return null;

        if (Date.now() > item.expiry) {
            cacheStore.delete(key);
            return null;
        }

        return item.value;
    },

    remove(key) {
        cacheStore.delete(key);
    },

    clear() {
        cacheStore.clear();
    }
};
