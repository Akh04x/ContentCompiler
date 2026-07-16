import { ValueObject } from '../shared/DomainBase';

export enum ContentPackageStatusEnum {
  Draft = 'Draft',
  Assembled = 'Assembled',
  Validated = 'Validated',
  Approved = 'Approved',
  Delivered = 'Delivered',
  Archived = 'Archived'
}

export class ContentPackageStatus extends ValueObject {
  constructor(public readonly status: ContentPackageStatusEnum) {
    super();
    if (!Object.values(ContentPackageStatusEnum).includes(status)) throw new Error(`Invalid ContentPackageStatus: ${status}`);
  }
  equals(other: ContentPackageStatus): boolean { return this.status === other.status; }
}
