import { DriverId } from "../../../shared/driver/value-objects/driver-id";
import { TenantId } from "../../../shared/tenant/value-objects/tenant-id";
import { VehicleId } from "../../../shared/vehicle/value-objects/vehicle-id";


export type DriverStatus = "Active" | "Inactive" | "Suspended";

export interface DriverAvailability {
  availableFrom: Date;
  availableTo: Date;
}

export interface DriverProps {
  driverId: DriverId;
  tenantId: TenantId;
  fullName: string;
  status: DriverStatus;
  primaryVehicleId?: VehicleId;
  homeRegion?: string;
  skills: string[];
  currentAvailability?: DriverAvailability;
  createdAt: Date;
  updatedAt: Date;
}

export class Driver {
  private props: DriverProps;

  constructor(props: DriverProps) {
    this.props = props;
  }

  get id() {
    return this.props.driverId;
  }

  get status() {
    return this.props.status;
  }

  activate() {
    if (this.props.status === "Active") return;
    this.props.status = "Active";
    this.props.updatedAt = new Date();
  }

  deactivate() {
    if (this.props.status === "Inactive") return;
    this.props.status = "Inactive";
    this.props.updatedAt = new Date();
  }

  assignVehicle(vehicleId: VehicleId) {
    this.props.primaryVehicleId = vehicleId;
    this.props.updatedAt = new Date();
  }

  updateAvailability(availability: DriverAvailability) {
    this.props.currentAvailability = availability;
    this.props.updatedAt = new Date();
  }

  toSnapshot() {
    return { ...this.props };
  }
}
