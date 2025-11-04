// cloudinary.ts
export async function uploadBgImage(file: File): Promise<string> {
    // Get Cloudinary credentials from environment variables
    const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;  // Make sure this is in your .env file
    const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UNSIGNED_PRESET; // Unsigned preset from Cloudinary

    // Ensure credentials are set
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
        throw new Error("Cloudinary credentials are missing in .env file.");
    }

    // Create FormData object to send to Cloudinary
    const form = new FormData();
    form.append("file", file);  // Attach the selected file
    form.append("upload_preset", UPLOAD_PRESET);  // Attach the preset to the request

    try {
        // Send the image to Cloudinary using POST
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
            method: "POST",
            body: form,  // Send the form data containing the file and preset
        });

        if (!res.ok) throw new Error("Cloudinary upload failed");

        // Parse response and extract the secure_url (public URL of the uploaded image)
        const json = await res.json();
        return json.secure_url;  // The public URL of the image
    } catch (err) {
        console.error("Error uploading to Cloudinary:", err);
        throw new Error("Failed to upload image to Cloudinary");
    }
}
