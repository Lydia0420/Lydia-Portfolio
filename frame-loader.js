(function (root) {
    async function loadFrames({ count, images, concurrency = 4, load, progress = () => {} }) {
        let cursor = 0;
        let completed = images.filter(Boolean).length;
        const failed = [];
        progress(completed);
        async function worker() {
            while (cursor < count) {
                const index = cursor++;
                if (images[index]) continue;
                try {
                    images[index] = await load(index);
                    progress(++completed, index);
                } catch (error) {
                    failed.push(index);
                }
            }
        }
        await Promise.all(Array.from({ length: concurrency }, worker));
        if (failed.length) throw new Error(`${failed.length} frame(s) unavailable`);
        return images;
    }
    if (typeof module !== 'undefined') module.exports = { loadFrames };
    else root.loadFrames = loadFrames;
})(typeof window !== 'undefined' ? window : globalThis);
