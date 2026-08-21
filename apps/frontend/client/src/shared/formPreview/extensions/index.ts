/**
 * extensions/index.ts
 *
 * Registry of all per-service preview extensions.
 * Add new service extensions here — both wizard and My Application pick them up automatically.
 */

import { PreviewExtension, ServiceIdentifier } from '../core/formPreviewTypes';
import { DeviceRegistrationPreview } from './DeviceRegistrationPreview';
import { TvroRegistrationPreview } from './TvroRegistrationPreview';
import { VasProviderPreview } from './VasProviderPreview';
import { RadioCertPreview } from './RadioCertPreview';
import { AmateurLicensePreview } from './AmateurLicensePreview';
import { LifetimeAmateurPreview } from './LifetimeAmateurPreview';
import { CopyOfCertPreview } from './CopyOfCertPreview';
import { PermitPreview } from './PermitPreview';

const EXTENSIONS: PreviewExtension[] = [
  DeviceRegistrationPreview,
  TvroRegistrationPreview,
  VasProviderPreview,
  RadioCertPreview,
  AmateurLicensePreview,
  LifetimeAmateurPreview,
  CopyOfCertPreview,
  PermitPreview,
];

/**
 * Returns the matching PreviewExtension for the given service, or null
 * if no extension applies (default layout is used).
 */
export function getPreviewExtension(service: ServiceIdentifier): PreviewExtension | null {
  return EXTENSIONS.find((ext) => ext.matchService(service)) ?? null;
}
