import fs from "node:fs";
import path from "node:path";
import { createSign } from "node:crypto";

const DRIVE_API_BASE_URL = "https://www.googleapis.com/drive/v3";
const GOOGLE_OAUTH_TOKEN_URL = "https://oauth2.googleapis.com/token";
const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.readonly";
const TARGET_ROOT = path.resolve("content");

const SOURCES = [
  {
    envName: "DRIVE_GALLERIES_FOLDER_ID",
    label: "galleries",
    outputDir: path.join(TARGET_ROOT, "galleries")
  },
  {
    envName: "DRIVE_PARTNERS_FOLDER_ID",
    label: "partners",
    outputDir: path.join(TARGET_ROOT, "partners")
  },
  {
    envName: "DRIVE_STAFF_FOLDER_ID",
    label: "staff",
    outputDir: path.join(TARGET_ROOT, "staff")
  },
  {
    envName: "DRIVE_SCIENTIFIC_COMMITTEE_FOLDER_ID",
    label: "scientific-committee",
    outputDir: path.join(TARGET_ROOT, "scientific_committee")
  },
  {
    envName: "DRIVE_SCHEDULE_FOLDER_ID",
    label: "schedule",
    outputDir: path.join(TARGET_ROOT, "schedule")
  }
];

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function cleanDir(dirPath) {
  fs.rmSync(dirPath, { recursive: true, force: true });
  ensureDir(dirPath);
}

function base64UrlEncode(value) {
  const buffer = Buffer.isBuffer(value) ? value : Buffer.from(value);
  return buffer.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function buildJwt(serviceAccount) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: serviceAccount.client_email,
    scope: DRIVE_SCOPE,
    aud: GOOGLE_OAUTH_TOKEN_URL,
    exp: now + 3600,
    iat: now
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const signer = createSign("RSA-SHA256");
  signer.update(signingInput);
  signer.end();

  const signature = signer.sign(serviceAccount.private_key);
  return `${signingInput}.${base64UrlEncode(signature)}`;
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Request failed (${response.status}) for ${url}: ${text}`);
  }

  return response.json();
}

async function getAccessToken(serviceAccount) {
  const assertion = buildJwt(serviceAccount);
  const body = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion
  });

  const response = await fetch(GOOGLE_OAUTH_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Unable to retrieve Google OAuth token (${response.status}): ${text}`);
  }

  const payload = await response.json();

  if (!payload.access_token) {
    throw new Error("Google OAuth token response has no access_token");
  }

  return payload.access_token;
}

async function driveRequest(pathname, token, query = {}) {
  const url = new URL(`${DRIVE_API_BASE_URL}${pathname}`);

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  return fetchJson(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

async function listFolderChildren(folderId, token) {
  const files = [];
  let pageToken;

  do {
    const payload = await driveRequest("/files", token, {
      q: `'${folderId}' in parents and trashed=false`,
      fields: "nextPageToken,files(id,name,mimeType,shortcutDetails)",
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      pageSize: 1000,
      pageToken
    });

    files.push(...(payload.files ?? []));
    pageToken = payload.nextPageToken;
  } while (pageToken);

  return files;
}

async function getDriveFileMetadata(fileId, token) {
  return driveRequest(`/files/${fileId}`, token, {
    fields: "id,name,mimeType,shortcutDetails",
    supportsAllDrives: true
  });
}

async function downloadBinaryFile(fileId, token, destinationPath) {
  const url = new URL(`${DRIVE_API_BASE_URL}/files/${fileId}`);
  url.searchParams.set("alt", "media");
  url.searchParams.set("supportsAllDrives", "true");

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Unable to download file ${fileId} (${response.status}): ${text}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  ensureDir(path.dirname(destinationPath));
  fs.writeFileSync(destinationPath, buffer);
}

async function exportGoogleSheetAsCsv(fileId, token, destinationPath) {
  const url = new URL(`${DRIVE_API_BASE_URL}/files/${fileId}/export`);
  url.searchParams.set("mimeType", "text/csv");
  url.searchParams.set("supportsAllDrives", "true");

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Unable to export Google Sheet ${fileId} (${response.status}): ${text}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  ensureDir(path.dirname(destinationPath));
  fs.writeFileSync(destinationPath, buffer);
}

async function downloadDriveEntry(entry, token, destinationPath) {
  const folderMimeType = "application/vnd.google-apps.folder";
  const shortcutMimeType = "application/vnd.google-apps.shortcut";
  const sheetMimeType = "application/vnd.google-apps.spreadsheet";

  if (entry.mimeType === folderMimeType) {
    ensureDir(destinationPath);
    await syncFolderContents(entry.id, token, destinationPath);
    return;
  }

  if (entry.mimeType === shortcutMimeType && entry.shortcutDetails?.targetId) {
    const target = await getDriveFileMetadata(entry.shortcutDetails.targetId, token);
    const targetWithName = {
      ...target,
      name: entry.name
    };
    await downloadDriveEntry(targetWithName, token, destinationPath);
    return;
  }

  if (entry.mimeType === sheetMimeType) {
    const withCsvExtension = destinationPath.toLowerCase().endsWith(".csv")
      ? destinationPath
      : `${destinationPath}.csv`;
    await exportGoogleSheetAsCsv(entry.id, token, withCsvExtension);
    return;
  }

  if (entry.mimeType.startsWith("application/vnd.google-apps.")) {
    console.warn(`Skipping Google Workspace file not supported for direct download: ${entry.name} (${entry.mimeType})`);
    return;
  }

  await downloadBinaryFile(entry.id, token, destinationPath);
}

async function syncFolderContents(folderId, token, targetDir) {
  ensureDir(targetDir);
  const children = await listFolderChildren(folderId, token);

  for (const child of children) {
    const safeName = child.name.replace(/[\\/]/g, "-");
    const childPath = path.join(targetDir, safeName);
    await downloadDriveEntry(child, token, childPath);
  }
}

function getServiceAccountCredentials() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

  if (!raw || raw.trim().length === 0) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);

    if (!parsed.client_email || !parsed.private_key) {
      throw new Error("Missing client_email or private_key");
    }

    return parsed;
  } catch (error) {
    throw new Error(`Invalid GOOGLE_SERVICE_ACCOUNT_JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function main() {
  ensureDir(TARGET_ROOT);

  const serviceAccount = getServiceAccountCredentials();

  if (!serviceAccount) {
    console.log("Skipping Google Drive sync: GOOGLE_SERVICE_ACCOUNT_JSON not set.");
    return;
  }

  const token = await getAccessToken(serviceAccount);
  let syncedCount = 0;

  for (const source of SOURCES) {
    const folderId = process.env[source.envName];

    if (!folderId || folderId.trim().length === 0) {
      console.log(`Skipping ${source.label}: env ${source.envName} not set.`);
      continue;
    }

    console.log(`Syncing ${source.label} from Google Drive folder ${source.envName}...`);
    cleanDir(source.outputDir);
    await syncFolderContents(folderId.trim(), token, source.outputDir);
    syncedCount += 1;
  }

  if (syncedCount === 0) {
    console.log("No Google Drive folder source provided. Using repository content/ as-is.");
  } else {
    console.log(`Google Drive content synced for ${syncedCount} source(s).`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
