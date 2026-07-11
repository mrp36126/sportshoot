/**
 * GitHub Image Storage Service
 * 
 * Manages uploading, overwriting, and retrieving shooting target images
 * from a GitHub repository. Only stores the latest Before and After images
 * per user to minimise storage usage.
 * 
 * The folder structure is:
 *   shooting-images/user-{userId}/before.jpg
 *   shooting-images/user-{userId}/after.jpg
 */

const GITHUB_API = 'https://api.github.com';
const GITHUB_RAW = 'https://raw.githubusercontent.com';

export interface GitHubImageUrls {
  beforeUrl: string;
  afterUrl: string;
}

/**
 * Upload an image to GitHub. If an image already exists at the path,
 * it will be overwritten.
 */
async function uploadImage(
  userId: string,
  imageType: 'before' | 'after',
  imageBase64: string
): Promise<string> {
  const token = process.env.GITHUB_TOKEN;
  const repoOwner = process.env.GITHUB_REPO_OWNER;
  const repoName = process.env.GITHUB_REPO_NAME;

  if (!token || !repoOwner || !repoName) {
    throw new Error(
      'Missing GitHub configuration. Set GITHUB_TOKEN, GITHUB_REPO_OWNER, ' +
      'and GITHUB_REPO_NAME in environment variables.'
    );
  }

  const path = `shooting-images/user-${userId}/${imageType}.jpg`;
  const url = `${GITHUB_API}/repos/${repoOwner}/${repoName}/contents/${path}`;

  // Check if file already exists to get its SHA (required for overwrite)
  let sha: string | undefined;
  try {
    const checkResponse = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
    if (checkResponse.ok) {
      const existing = await checkResponse.json();
      sha = existing.sha;
    }
  } catch {
    // File doesn't exist yet, that's fine
  }

  // Upload or overwrite the file
  const body: Record<string, string> = {
    message: `Update ${imageType} image for user ${userId}`,
    content: imageBase64,
    branch: process.env.GITHUB_BRANCH || 'main',
  };

  if (sha) {
    body.sha = sha;
  }

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `GitHub upload failed (${response.status}): ${errorText}`
    );
  }

  // Return the raw GitHub URL for the image
  return `${GITHUB_RAW}/${repoOwner}/${repoName}/${process.env.GITHUB_BRANCH || 'main'}/${path}`;
}

/**
 * Validate that a base64 string is a valid JPEG image.
 */
function isValidJpeg(base64: string): boolean {
  // Check for JPEG magic bytes (FF D8 FF)
  try {
    const decoded = atob(base64.substring(0, 4));
    return decoded.charCodeAt(0) === 0xFF &&
           decoded.charCodeAt(1) === 0xD8 &&
           decoded.charCodeAt(2) === 0xFF;
  } catch {
    return false;
  }
}

/**
 * Upload both Before and After images for a shooting session.
 * 
 * @param userId - The user's unique ID
 * @param beforeImageBase64 - Base64-encoded JPEG of the clean target
 * @param afterImageBase64 - Base64-encoded JPEG of the shot target
 * @returns URLs to the uploaded images
 */
export async function uploadSessionImages(
  userId: string,
  beforeImageBase64: string,
  afterImageBase64: string
): Promise<GitHubImageUrls> {
  // Validate image data
  if (!beforeImageBase64 || !afterImageBase64) {
    throw new Error('Both before and after images are required');
  }

  // Strip data URL prefix if present
  const cleanBefore = beforeImageBase64.replace(/^data:image\/jpeg;base64,/, '');
  const cleanAfter = afterImageBase64.replace(/^data:image\/jpeg;base64,/, '');

  if (!isValidJpeg(cleanBefore)) {
    throw new Error('Before image is not a valid JPEG');
  }
  if (!isValidJpeg(cleanAfter)) {
    throw new Error('After image is not a valid JPEG');
  }

  // Upload both images in parallel
  const [beforeUrl, afterUrl] = await Promise.all([
    uploadImage(userId, 'before', cleanBefore),
    uploadImage(userId, 'after', cleanAfter),
  ]);

  return { beforeUrl, afterUrl };
}

/**
 * Delete a user's images from GitHub.
 * Called when a user deletes their account.
 */
export async function deleteUserImages(userId: string): Promise<void> {
  const token = process.env.GITHUB_TOKEN;
  const repoOwner = process.env.GITHUB_REPO_OWNER;
  const repoName = process.env.GITHUB_REPO_NAME;

  if (!token || !repoOwner || !repoName) return;

  const deleteFile = async (type: 'before' | 'after') => {
    const path = `shooting-images/user-${userId}/${type}.jpg`;
    const url = `${GITHUB_API}/repos/${repoOwner}/${repoName}/contents/${path}`;

    try {
      const checkResponse = await fetch(url, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' },
      });

      if (checkResponse.ok) {
        const existing = await checkResponse.json();
        await fetch(url, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: `Delete ${type} image for user ${userId}`,
            sha: existing.sha,
            branch: process.env.GITHUB_BRANCH || 'main',
          }),
        });
      }
    } catch {
      // File doesn't exist, nothing to delete
    }
  };

  await Promise.all([deleteFile('before'), deleteFile('after')]);
}

/**
 * Get the GitHub raw URLs for a user's images.
 * Returns null URLs if the images don't exist yet.
 */
export async function getUserImageUrls(
  userId: string
): Promise<GitHubImageUrls> {
  const repoOwner = process.env.GITHUB_REPO_OWNER;
  const repoName = process.env.GITHUB_REPO_NAME;
  const branch = process.env.GITHUB_BRANCH || 'main';

  const baseUrl = `${GITHUB_RAW}/${repoOwner}/${repoName}/${branch}/shooting-images/user-${userId}`;

  return {
    beforeUrl: `${baseUrl}/before.jpg`,
    afterUrl: `${baseUrl}/after.jpg`,
  };
}