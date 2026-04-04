export class ChromeStorageAdapter {
    async get(key) {
        const result = await chrome.storage.local.get(key);
        return result[key] || null;
    }
    async set(key, value) {
        await chrome.storage.local.set({ [key]: value });
    }
    onChanged(callback) {
        chrome.storage.onChanged.addListener((changes, namespace) => {
            if (namespace === 'local') {
                const mappedChanges = {};
                for (const [key, change] of Object.entries(changes)) {
                    mappedChanges[key] = change.newValue;
                }
                callback(mappedChanges);
            }
        });
    }
}
