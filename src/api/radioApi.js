export const fetchGlobalStations = async (query = '', tag = '', limit = 20, offset = 0) => {
    // Using Radio Browser API (Direct, no key required for basic use)
    let url = `https://de1.api.radio-browser.info/json/stations/search?limit=${limit}&offset=${offset}&hidebroken=true&order=clickcount&reverse=true`;

    if (query) {
        url += `&name=${encodeURIComponent(query)}`;
    }
    if (tag) {
        url += `&tag=${encodeURIComponent(tag)}`;
    }

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();

        // Map to a consistent format if needed, though Radio Browser has good fields
        return data.map((station) => ({
            stationid: station.stationuuid,
            name: station.name,
            country: station.countrycode,
            location: station.state || station.country,
            bitrate: station.bitrate?.toString() || '128',
            tags: station.tags,
            url_resolved: station.url_resolved || station.url,
            homepage: station.homepage,
            favicon: station.favicon
        }));
    } catch (error) {
        console.error('Failed to fetch stations:', error);
        throw error;
    }
};
