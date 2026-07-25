const DESTINATION_FOLDER_ID = '1r2FPf_pm34vjTzBjuZQpJu59oDS3C6Cf';
const MAX_FILES = 12;
const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8 MB per file for the MVP portal
// Optional: set a private code and share it only with invited brands.
const ACCESS_CODE = '';

function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('CNP Secure Product Upload')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function startSubmission(metadata) {
  validateMetadata_(metadata);
  const root = DriveApp.getFolderById(DESTINATION_FOLDER_ID);
  const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd_HH-mm-ss');
  const safeBrand = safeName_(metadata.brand || 'Unknown brand');
  const safeProduct = safeName_(metadata.product || 'Unknown product');
  const folder = root.createFolder(`${timestamp}__${safeBrand}__${safeProduct}`);

  const record = {
    receivedAt: new Date().toISOString(),
    brand: metadata.brand || '',
    product: metadata.product || '',
    email: metadata.email || '',
    plan: metadata.plan || '',
    notes: metadata.notes || '',
    authorizationConfirmed: Boolean(metadata.authorizationConfirmed),
    privacyNoticeAccepted: Boolean(metadata.privacyNoticeAccepted),
    privacyNoticeVersion: metadata.privacyNoticeVersion || '',
    status: 'uploading',
    uploadedFiles: []
  };
  folder.createFile('submission-details.json', JSON.stringify(record, null, 2), MimeType.PLAIN_TEXT);
  return {submissionId: folder.getId(), folderName: folder.getName()};
}

function uploadSubmissionFile(submissionId, file) {
  const folder = getSubmissionFolder_(submissionId);
  if (!file || !file.data || !file.name) throw new Error('Invalid file payload.');
  const bytes = Utilities.base64Decode(file.data);
  if (bytes.length > MAX_FILE_BYTES) throw new Error(`${file.name} exceeds the 8 MB file limit.`);
  const blob = Utilities.newBlob(bytes, file.mimeType || 'application/octet-stream', safeName_(file.name));
  const saved = folder.createFile(blob);
  return {name:saved.getName(), id:saved.getId(), mimeType:saved.getMimeType(), size:bytes.length};
}

function finishSubmission(submissionId, uploadedFiles) {
  const folder = getSubmissionFolder_(submissionId);
  const existing = folder.getFilesByName('submission-details.json');
  let record = {};
  if (existing.hasNext()) {
    const file = existing.next();
    record = JSON.parse(file.getBlob().getDataAsString() || '{}');
    record.status = 'complete';
    record.completedAt = new Date().toISOString();
    record.uploadedFiles = uploadedFiles || [];
    file.setContent(JSON.stringify(record, null, 2));
  }
  return {ok:true, folderName:folder.getName(), fileCount:(uploadedFiles || []).length};
}

function validateMetadata_(metadata) {
  if (!metadata) throw new Error('Missing submission data.');
  if (ACCESS_CODE && metadata.accessCode !== ACCESS_CODE) throw new Error('Invalid access code.');
  if (!metadata.brand || !metadata.product || !metadata.email) throw new Error('Brand, product and email are required.');
  if (!metadata.authorizationConfirmed) throw new Error('You must confirm that you are authorised to share the files.');
  if (!metadata.privacyNoticeAccepted) throw new Error('You must acknowledge the Data Protection Notice before uploading.');
}

function getSubmissionFolder_(submissionId) {
  if (!submissionId) throw new Error('Missing submission ID.');
  const folder = DriveApp.getFolderById(submissionId);
  const parents = folder.getParents();
  if (!parents.hasNext() || parents.next().getId() !== DESTINATION_FOLDER_ID) {
    throw new Error('Invalid submission destination.');
  }
  return folder;
}

function safeName_(value) {
  return String(value)
    .replace(/[\\/:*?"<>|#%{}~&]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120) || 'untitled';
}
