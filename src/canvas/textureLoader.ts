// Simple cache for loaded texture images
const textureCache = new Map<string, HTMLImageElement>();
// Map to track ongoing image load promises
const imageLoadPromises = new Map<string, Promise<HTMLImageElement>>();

/**
 * Loads an image from the given source URL.
 * Returns a promise that resolves with the HTMLImageElement.
 * Handles caching and prevents redundant load requests.
 * @param src The source URL of the image.
 * @returns A promise that resolves with the loaded image element.
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
    // Return cached image if available
    if (textureCache.has(src)) {
        return Promise.resolve(textureCache.get(src)!);
    }
    // Return existing promise if image is already loading
    if (imageLoadPromises.has(src)) {
        return imageLoadPromises.get(src)!;
    }

    // Create a new promise for loading the image
    const promise = new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            textureCache.set(src, img); // Cache the loaded image
            imageLoadPromises.delete(src); // Remove promise from tracking map
            resolve(img); // Resolve the promise with the image
        };
        img.onerror = (err) => {
            console.error(`Failed to load image: ${src}`, err);
            imageLoadPromises.delete(src); // Remove promise on error
            reject(err); // Reject the promise
        };
        img.src = src; // Set the source to start loading
    });

    // Store the promise in the tracking map
    imageLoadPromises.set(src, promise);
    return promise;
}

/**
 * Retrieves a loaded image directly from the cache.
 * Does not trigger loading if the image is not cached.
 * @param src The source URL of the image.
 * @returns The cached HTMLImageElement or undefined if not cached.
 */
export function getCachedImage(src: string): HTMLImageElement | undefined {
    return textureCache.get(src);
}
