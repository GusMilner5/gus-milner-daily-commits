import { describe, it, expect, beforeEach } from "vitest";
import { Driver, DriverProps, DriverAvailability, DriverStatus } from "./driver";
import { DriverId } from "../../../shared/driver/value-objects/driver-id";
import { TenantId } from "../../../shared/tenant/value-objects/tenant-id";
import { VehicleId } from "../../../shared/vehicle/value-objects/vehicle-id";

// Scenario: A new driver is created
describe("Driver Value Object", () => {
  let driverProps: DriverProps;
  let driver: Driver;

  beforeEach(() => {
    driverProps = {
      driverId: DriverId.new(),
      tenantId: TenantId.new(),
      fullName: "John Doe",
      status: "Inactive",
      skills: ["sedan", "truck"],
      createdAt: new Date("2023-01-01T00:00:00Z"),
      updatedAt: new Date("2023-01-01T00:00:00Z"),
    };
    driver = new Driver(driverProps);
  });

  // Given a new driver
  // When the driver is created
  // Then the driver status should be "Inactive"
  it("should have status 'Inactive' when created", () => {
    expect(driver.status).toBe("Inactive");
  });

  // Scenario: Driver activation
  // Given a driver with status "Inactive"
  // When the activate method is called
  // Then the driver status should be set to "Active"
  // And the updatedAt timestamp should change
  it("should activate an inactive driver and update updatedAt", () => {
    const prevUpdatedAt = driver.toSnapshot().updatedAt;
    driver.activate();
    expect(driver.status).toBe("Active");
    expect(driver.toSnapshot().updatedAt.getTime()).toBeGreaterThan(prevUpdatedAt.getTime());
  });

  // Scenario: Driver activation on already active driver
  // Given a driver with status "Active"
  // When the activate method is called
  // Then the status and updatedAt should not change
  it("should not update updatedAt if driver is already active", () => {
    driver.activate();
    const prevUpdatedAt = driver.toSnapshot().updatedAt;
    driver.activate();
    expect(driver.status).toBe("Active");
    expect(driver.toSnapshot().updatedAt.getTime()).toBe(prevUpdatedAt.getTime());
  });

  // Scenario: Driver deactivation
  // Given a driver with status "Active"
  // When the deactivate method is called
  // Then the driver status should be set to "Inactive"
  // And the updatedAt timestamp should change
  it("should deactivate an active driver and update updatedAt", async () => {
    driver.activate();
    const prevUpdatedAt = driver.toSnapshot().updatedAt;
    // Wait to guarantee a different timestamp, since JS Date has ms precision
    await new Promise((resolve) => setTimeout(resolve, 2));
    driver.deactivate();
    expect(driver.status).toBe("Inactive");
    expect(driver.toSnapshot().updatedAt.getTime()).toBeGreaterThan(prevUpdatedAt.getTime());
  });

  // Scenario: Driver deactivation on already inactive driver
  // Given a driver with status "Inactive"
  // When the deactivate method is called
  // Then the status and updatedAt should not change
  it("should not update updatedAt if driver is already inactive", () => {
    const prevUpdatedAt = driver.toSnapshot().updatedAt;
    driver.deactivate();
    expect(driver.status).toBe("Inactive");
    expect(driver.toSnapshot().updatedAt.getTime()).toBe(prevUpdatedAt.getTime());
  });

  // Scenario: Assign a vehicle to the driver
  // Given a driver
  // When a vehicle is assigned
  // Then the driver's primaryVehicleId should be set
  // And the updatedAt timestamp should change
  it("should assign a vehicle and update updatedAt", async () => {
    const vehicleId = VehicleId.new();
    driver.activate();
    const prevUpdatedAt = driver.toSnapshot().updatedAt;
    // Wait to guarantee a different timestamp, since JS Date has ms precision
    await new Promise((resolve) => setTimeout(resolve, 2));
    driver.assignVehicle(vehicleId);
    expect(driver.toSnapshot().primaryVehicleId?.toString()).toBe(vehicleId.toString());
    expect(driver.toSnapshot().updatedAt.getTime()).toBeGreaterThan(prevUpdatedAt.getTime());
  });

  // Scenario: Update driver availability
  // Given a driver
  // When their availability is updated
  // Then the currentAvailability should match input
  // And updatedAt should change
  it("should update availability and set updatedAt", () => {
    const availability: DriverAvailability = {
      availableFrom: new Date("2023-04-01T08:00:00Z"),
      availableTo: new Date("2023-04-01T16:00:00Z"),
    };
    const prevUpdatedAt = driver.toSnapshot().updatedAt;
    driver.updateAvailability(availability);
    expect(driver.toSnapshot().currentAvailability).toEqual(availability);
    expect(driver.toSnapshot().updatedAt.getTime()).toBeGreaterThan(prevUpdatedAt.getTime());
  });

  // Scenario: toSnapshot returns driver properties
  // Given a driver
  // When toSnapshot is called
  // Then the returned object should match the current driver state
  it("should return a snapshot of the driver's state", () => {
    const snapshot = driver.toSnapshot();
    expect(snapshot.driverId).toBe(driverProps.driverId);
    expect(snapshot.tenantId).toBe(driverProps.tenantId);
    expect(snapshot.fullName).toBe(driverProps.fullName);
    expect(snapshot.status).toBe("Inactive");
    expect(snapshot.skills).toEqual(driverProps.skills);
    expect(snapshot.createdAt).toBe(driverProps.createdAt);
    expect(snapshot.updatedAt).toBe(driverProps.updatedAt);
  });
});
