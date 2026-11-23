const STORAGE_KEY = 'tungChung.driveSaved.v1';
const TEACHER_PASSWORD = 'patpat';

export type DriveSaveType = 'story' | 'video';

export const ALREADY_SAVED_MESSAGE =
  'This was already saved to Google Drive. Ask your teacher if you need to save again.';

export const WRONG_PASSWORD_MESSAGE =
  'That password is not correct. Ask your teacher if you need to save again.';

export const MISSING_NAME_CLASS_MESSAGE =
  'Please type your Name and Class on the cover page before saving to Google Drive.';

function normalizePart(value: string): string {
  return (value || '').replace(/\s+/g, ' ').trim().toLowerCase();
}

export function driveSaveKey(
  studentName: string,
  studentClass: string,
  type: DriveSaveType
): string {
  return `${type}:${normalizePart(studentName)}|${normalizePart(studentClass)}`;
}

function readMap(): Record<string, true> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, true>) : {};
  } catch {
    return {};
  }
}

export function hasDriveSave(
  studentName: string,
  studentClass: string,
  type: DriveSaveType
): boolean {
  return !!readMap()[driveSaveKey(studentName, studentClass, type)];
}

export function markDriveSave(
  studentName: string,
  studentClass: string,
  type: DriveSaveType
): void {
  try {
    const map = readMap();
    map[driveSaveKey(studentName, studentClass, type)] = true;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Private mode or full storage: the in-page gate still works for this visit,
    // and the Apps Script can also reject a repeat save once it is updated.
  }
}

export function isTeacherOverridePassword(value: string): boolean {
  return (value || '') === TEACHER_PASSWORD;
}
