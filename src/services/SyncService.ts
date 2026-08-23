import { Medication, DoseRecord } from '../types/medication';

export interface CabinetExportData {
  version: number;
  exportedAt: string;
  medications: Medication[];
  doseRecords?: DoseRecord[];
}

export class SyncService {
  /**
   * Export all medication and history data from localStorage into a structured export object
   */
  static exportCabinetData(): CabinetExportData {
    let medications: Medication[] = [];
    let doseRecords: DoseRecord[] = [];

    try {
      const rawMeds = localStorage.getItem('medtracker_medications_v1') || localStorage.getItem('medications');
      if (rawMeds) {
        medications = JSON.parse(rawMeds);
      }
    } catch (e) {
      console.error('Failed to read medications from storage:', e);
    }

    try {
      const rawDoses = localStorage.getItem('medtracker_dose_records_v1') || localStorage.getItem('dose_records');
      if (rawDoses) {
        doseRecords = JSON.parse(rawDoses);
      }
    } catch (e) {
      console.error('Failed to read dose records from storage:', e);
    }

    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      medications,
      doseRecords
    };
  }

  /**
   * Generates a stringified / lightweight QR-friendly payload
   */
  static generateSyncCode(): string {
    const data = this.exportCabinetData();
    return JSON.stringify(data);
  }

  /**
   * Parse and validate sync payload string
   */
  static parseSyncPayload(payloadStr: string): CabinetExportData | null {
    try {
      const parsed = JSON.parse(payloadStr.trim());
      if (parsed && Array.isArray(parsed.medications)) {
        return parsed as CabinetExportData;
      }
      // If it's directly an array of medications
      if (Array.isArray(parsed)) {
        return {
          version: 1,
          exportedAt: new Date().toISOString(),
          medications: parsed
        };
      }
      return null;
    } catch (e) {
      console.error('Invalid sync payload JSON:', e);
      return null;
    }
  }

  /**
   * Import data into local storage (Merge or Replace)
   */
  static importCabinetData(incoming: CabinetExportData, mode: 'replace' | 'merge' = 'replace'): boolean {
    try {
      let finalMeds: Medication[] = [];

      if (mode === 'replace') {
        finalMeds = incoming.medications;
      } else {
        // Merge: keep existing and add or update by id
        const current = this.exportCabinetData().medications;
        const map = new Map<string, Medication>();
        current.forEach((m) => map.set(m.id, m));
        incoming.medications.forEach((m) => map.set(m.id, m));
        finalMeds = Array.from(map.values());
      }

      // Save to primary storage keys
      localStorage.setItem('medtracker_medications_v1', JSON.stringify(finalMeds));
      localStorage.setItem('medications', JSON.stringify(finalMeds));

      if (incoming.doseRecords && incoming.doseRecords.length > 0) {
        let finalDoses = incoming.doseRecords;
        if (mode === 'merge') {
          const currentDoses = this.exportCabinetData().doseRecords || [];
          const doseMap = new Map<string, DoseRecord>();
          currentDoses.forEach((d) => doseMap.set(d.id, d));
          incoming.doseRecords.forEach((d) => doseMap.set(d.id, d));
          finalDoses = Array.from(doseMap.values());
        }
        localStorage.setItem('medtracker_dose_records_v1', JSON.stringify(finalDoses));
        localStorage.setItem('dose_records', JSON.stringify(finalDoses));
      }

      return true;
    } catch (e) {
      console.error('Failed to import cabinet data:', e);
      return false;
    }
  }

  /**
   * Download a backup .json file to user's device
   */
  static downloadBackupFile(): void {
    const data = this.exportCabinetData();
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().split('T')[0];
    const a = document.createElement('a');
    a.href = url;
    a.download = `medtrack-backup-${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
