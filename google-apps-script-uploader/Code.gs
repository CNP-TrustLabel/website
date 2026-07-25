const DESTINATION_FOLDER_ID = '1r2FPf_pm34vjTzBjuZQpJu59oDS3C6Cf';
const MAX_FILES = 12;
const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8 MB per file for the MVP portal
const ACCESS_CODE = ''; // Optional private code shared only with invited brands.
const PRIVACY_NOTICE_VERSION = '2026-07-v1';

function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('CNP Secure Product Upload')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function startSubmission(metadata) {
  validateMetadata_(metadata);
  const root = DriveApp.getFolderById(DESTINATION_FOLDER_ID);
  assertDestinationRestricted_(root);

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const now = new Date();
    const timestamp = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd_HH-mm-ss');
    const receiptCode = `CNP-${Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss')}-${randomToken_(4)}`;
    const safeBrand = safeName_(metadata.brand || 'Unknown brand');
    const safeProduct = safeName_(metadata.product || 'Unknown product');
    const folder = root.createFolder(`${receiptCode}__${safeBrand}__${safeProduct}`);
    secureFolder_(folder);
    folder.setDescription(`Private CNP product submission. Receipt: ${receiptCode}. Created automatically by the CNP secure upload portal.`);

    const record = {
      receiptCode,
      receivedAt: now.toISOString(),
      brand: metadata.brand || '',
      product: metadata.product || '',
      email: metadata.email || '',
      plan: metadata.plan || '',
      notes: metadata.notes || '',
      authorizationConfirmed: Boolean(metadata.authorizationConfirmed),
      privacyNoticeAccepted: Boolean(metadata.privacyNoticeAccepted),
      privacyNoticeVersion: metadata.privacyNoticeVersion || PRIVACY_NOTICE_VERSION,
      status: 'uploading',
      uploadedFiles: []
    };

    const details = folder.createFile('00_submission-details.json', JSON.stringify(record, null, 2), MimeType.PLAIN_TEXT);
    secureFile_(details);
    return {submissionId: folder.getId(), folderName: folder.getName(), receiptCode};
  } finally {
    lock.releaseLock();
  }
}

function uploadSubmissionFile(submissionId, file) {
  const folder = getSubmissionFolder_(submissionId);
  if (!file || !file.data || !file.name) throw new Error('Invalid file payload.');
  const existingCount = countFiles_(folder) - 1; // Excludes metadata file.
  if (existingCount >= MAX_FILES) throw new Error(`Maximum ${MAX_FILES} uploaded files per submission.`);

  const bytes = Utilities.base64Decode(file.data);
  if (bytes.length > MAX_FILE_BYTES) throw new Error(`${file.name} exceeds the 8 MB file limit.`);
  const blob = Utilities.newBlob(bytes, file.mimeType || 'application/octet-stream', safeName_(file.name));
  const saved = folder.createFile(blob);
  secureFile_(saved);
  return {name: saved.getName(), id: saved.getId(), mimeType: saved.getMimeType(), size: bytes.length};
}

function finishSubmission(submissionId, uploadedFiles) {
  const folder = getSubmissionFolder_(submissionId);
  const existing = folder.getFilesByName('00_submission-details.json');
  if (!existing.hasNext()) throw new Error('Submission metadata could not be found.');

  const details = existing.next();
  const record = JSON.parse(details.getBlob().getDataAsString() || '{}');
  record.status = 'complete';
  record.completedAt = new Date().toISOString();
  record.uploadedFiles = uploadedFiles || [];
  details.setContent(JSON.stringify(record, null, 2));
  secureFile_(details);

  const receipt = folder.createFile(
    '00_submission-receipt.txt',
    [
      'CNP SECURE PRODUCT SUBMISSION',
      `Receipt: ${record.receiptCode || ''}`,
      `Brand: ${record.brand || ''}`,
      `Product: ${record.product || ''}`,
      `Plan: ${record.plan || ''}`,
      `Completed: ${record.completedAt}`,
      `Files received: ${(uploadedFiles || []).length}`
    ].join('\n'),
    MimeType.PLAIN_TEXT
  );
  secureFile_(receipt);
  return {ok: true, receiptCode: record.receiptCode || '', fileCount: (uploadedFiles || []).length};
}

function validateMetadata_(metadata) {
  if (!metadata) throw new Error('Missing submission data.');
  if (ACCESS_CODE && metadata.accessCode !== ACCESS_CODE) throw new Error('Invalid access code.');
  if (!metadata.brand || !metadata.product || !metadata.email) throw new Error('Brand, product and email are required.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(metadata.email))) throw new Error('Enter a valid contact email.');
  if (!metadata.authorizationConfirmed) throw new Error('You must confirm that you are authorised to share the files.');
  if (!metadata.privacyNoticeAccepted) throw new Error('You must acknowledge the Data Protection Notice before uploading.');
}

function assertDestinationRestricted_(root) {
  const access = root.getSharingAccess();
  if (access !== DriveApp.Access.PRIVATE) {
    throw new Error('The destination Drive folder is not restricted. Set its General access to Restricted before accepting submissions.');
  }
}

function secureFolder_(folder) {
  folder.setShareableByEditors(false);
  // Remove general public/link access. Explicit CNP reviewers on the restricted parent remain authorised.
  try { folder.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.NONE); } catch (error) {}
  try { folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.NONE); } catch (error) {}
}

function secureFile_(file) {
  file.setShareableByEditors(false);
  try { file.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.NONE); } catch (error) {}
  try { file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.NONE); } catch (error) {}
}

function getSubmissionFolder_(submissionId) {
  if (!submissionId) throw new Error('Missing submission ID.');
  const folder = DriveApp.getFolderById(submissionId);
  const parents = folder.getParents();
  let validParent = false;
  while (parents.hasNext()) {
    if (parents.next().getId() === DESTINATION_FOLDER_ID) {
      validParent = true;
      break;
    }
  }
  if (!validParent) throw new Error('Invalid submission destination.');
  return folder;
}

function countFiles_(folder) {
  const files = folder.getFiles();
  let count = 0;
  while (files.hasNext()) { files.next(); count++; }
  return count;
}

function safeName_(value) {
  return String(value)
    .replace(/[\\/:*?"<>|#%{}~&]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120) || 'untitled';
}

function randomToken_(length) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let token = '';
  for (let i = 0; i < length; i++) token += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  return token;
}
