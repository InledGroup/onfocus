export class ConcentrationLogic {
    static isUrlBlacklisted(currentUrl, blacklist) {
        try {
            const url = new URL(currentUrl);
            const host = url.hostname.replace('www.', '');
            return blacklist.find(site => {
                const siteHost = site.url.replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0];
                return host === siteHost || host.endsWith('.' + siteHost);
            }) || null;
        }
        catch (e) {
            return null;
        }
    }
}
