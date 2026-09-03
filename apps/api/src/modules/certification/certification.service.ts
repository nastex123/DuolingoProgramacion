import { Injectable, NotFoundException } from '@nestjs/common';
import type { Certificate, CertificateVerificationResponse } from '@koda/types';

@Injectable()
export class CertificationService {
  private readonly certificates: Certificate[] = [
    {
      id: 'cert_001',
      code: 'KODA-PY-000001',
      user_id: 'usr_001',
      language_id: 'lang_py_01',
      status: 'valid',
      issued_at: '2026-09-02T12:00:00Z',
      holder_name: 'Alex Developer',
      holder_document_masked: 'CC ***678',
      language_name: 'Python 3.12',
      qr_payload: 'https://koda.app/verificar/KODA-PY-000001',
      google_drive_file_id: '1aBcDeFgHiJkLmNoPqRsTuVwXyZ_example',
      pdf_sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    },
  ];

  verifyCertificate(code: string): CertificateVerificationResponse {
    const cert = this.certificates.find((c) => c.code === code);
    if (!cert) {
      throw new NotFoundException(`Certificado con código '${code}' no encontrado.`);
    }

    return {
      is_valid: cert.status === 'valid',
      code: cert.code,
      holder_name: cert.holder_name,
      holder_document_masked: cert.holder_document_masked,
      language_name: cert.language_name,
      issued_at: cert.issued_at,
      status: cert.status,
      verification_url: cert.qr_payload,
    };
  }

  getDownloadInfo(id: string): { code: string; drive_file_id: string; cached: boolean } {
    const cert = this.certificates.find((c) => c.id === id || c.code === id);
    if (!cert) {
      throw new NotFoundException(`Certificado '${id}' no encontrado.`);
    }

    return {
      code: cert.code,
      drive_file_id: cert.google_drive_file_id || 'mock_file_id',
      cached: !!cert.google_drive_file_id,
    };
  }
}
