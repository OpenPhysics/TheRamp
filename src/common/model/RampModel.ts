/**
 * RampModel.ts
 *
 * Axon façade over RampPhysicsEngine. Owns record/playback and mirrors physics state
 * into Properties for the view layer.
 */
import {
  BooleanProperty,
  DerivedProperty,
  Emitter,
  NumberProperty,
  Property,
  StringUnionProperty,
} from "scenerystack/axon";
import { Vector2 } from "scenerystack/dot";
import type { RampPreferencesModel } from "../../preferences/RampPreferencesModel.js";
import rampQueryParameters from "../../preferences/rampQueryParameters.js";
import {
  ANGLE_RANGE,
  APPLIED_FORCE_RANGE,
  GROUND_LENGTH,
  INITIAL_POSITION_IN_SURFACE,
  MAX_DT,
  POSITION_RANGE,
  RAMP_LENGTH,
} from "../RampConstants.js";
import { RAMP_OBJECTS, type RampObjectDescription } from "./RampObjectDescription.js";
import {
  type CollisionInfo,
  clearHeat as clearHeatState,
  createInitialState,
  getBlockLocation,
  getGlobalPosition,
  getKineticEnergy,
  getPotentialEnergy,
  getTotalEnergy,
  getTotalWork,
  type RampPhysicsState,
  type SurfaceId,
  setupForces,
  stepPhysics,
  withGlobalPosition,
} from "./RampPhysicsEngine.js";
import { type TimeSeriesClient, TimeSeriesModel } from "./TimeSeriesModel.js";
import { VectorVisibilityModel } from "./VectorVisibilityModel.js";

function getDefaultObject(): RampObjectDescription {
  const [obj] = RAMP_OBJECTS;
  if (!obj) {
    throw new Error("RAMP_OBJECTS empty");
  }
  return obj;
}

const defaultObject = getDefaultObject();
const initialState = createInitialState();

/** Degrees → radians; the public rampAngle query parameter is in degrees. */
const DEG_TO_RAD = Math.PI / 180;

export class RampModel implements TimeSeriesClient {
  // --- inputs (user-writable) ---
  public readonly rampAngleProperty = new NumberProperty(rampQueryParameters.rampAngle * DEG_TO_RAD, {
    range: ANGLE_RANGE,
  });
  public readonly appliedForceProperty = new NumberProperty(rampQueryParameters.appliedForce, {
    range: APPLIED_FORCE_RANGE,
  });
  public readonly selectedObjectProperty = new Property<RampObjectDescription>(defaultObject);
  public readonly massProperty = new NumberProperty(rampQueryParameters.mass);
  public readonly staticFrictionProperty = new NumberProperty(
    rampQueryParameters.frictionless ? 0 : rampQueryParameters.staticFriction,
  );
  public readonly kineticFrictionProperty = new NumberProperty(
    rampQueryParameters.frictionless ? 0 : rampQueryParameters.kineticFriction,
  );
  public readonly frictionlessProperty = new BooleanProperty(rampQueryParameters.frictionless);
  public readonly zeroPointYProperty = new NumberProperty(0);
  public readonly globalPositionProperty = new NumberProperty(INITIAL_POSITION_IN_SURFACE + GROUND_LENGTH, {
    range: POSITION_RANGE,
  });
  public readonly soundEnabledProperty = new BooleanProperty(rampQueryParameters.soundEnabled);

  // --- state mirrors + outputs ---
  public readonly surfaceProperty = new StringUnionProperty<SurfaceId>(initialState.surface, {
    validValues: ["ground", "ramp"],
  });
  public readonly positionInSurfaceProperty = new NumberProperty(initialState.positionInSurface);
  public readonly velocityProperty = new NumberProperty(initialState.velocity);
  public readonly accelerationProperty = new NumberProperty(initialState.acceleration);

  public readonly appliedParallelProperty = new NumberProperty(initialState.appliedParallel);
  public readonly gravityParallelProperty = new NumberProperty(initialState.gravityParallel);
  public readonly frictionParallelProperty = new NumberProperty(initialState.frictionParallel);
  public readonly wallParallelProperty = new NumberProperty(initialState.wallParallel);
  public readonly netParallelProperty = new NumberProperty(initialState.netParallel);
  public readonly normalPerpendicularProperty = new NumberProperty(initialState.normalPerpendicular);

  public readonly kineticEnergyProperty = new NumberProperty(getKineticEnergy(initialState));
  public readonly potentialEnergyProperty = new NumberProperty(getPotentialEnergy(initialState));
  public readonly thermalEnergyProperty = new NumberProperty(initialState.thermalEnergy);
  public readonly totalEnergyProperty = new NumberProperty(getTotalEnergy(initialState));
  public readonly appliedWorkProperty = new NumberProperty(initialState.appliedWork);
  public readonly gravityWorkProperty = new NumberProperty(initialState.gravityWork);
  public readonly frictiveWorkProperty = new NumberProperty(initialState.frictiveWork);
  public readonly totalWorkProperty = new NumberProperty(getTotalWork(initialState));

  public readonly blockLocationProperty = new DerivedProperty(
    [this.surfaceProperty, this.positionInSurfaceProperty, this.rampAngleProperty],
    (surface, positionInSurface, rampAngle) => {
      const loc = getBlockLocation({
        ...initialState,
        surface,
        positionInSurface,
        rampAngle,
      });
      return new Vector2(loc.x, loc.y);
    },
  );

  public readonly speedProperty = new DerivedProperty([this.velocityProperty], (velocity) => Math.abs(velocity));

  public readonly rampHeightProperty = new DerivedProperty(
    [this.rampAngleProperty],
    (rampAngle) => RAMP_LENGTH * Math.sin(rampAngle),
  );

  public readonly collisionEmitter = new Emitter<[CollisionInfo]>({
    parameters: [{ valueType: Object }],
  });

  public readonly stepCompleteEmitter = new Emitter();

  public readonly timeSeriesModel = new TimeSeriesModel(this);
  public readonly vectorVisibility = new VectorVisibilityModel();

  private lastEndState: RampPhysicsState = createInitialState();
  private isWritingState = false;
  private savedStaticFriction = rampQueryParameters.staticFriction;
  private savedKineticFriction = rampQueryParameters.kineticFriction;

  private readonly preferences: RampPreferencesModel;

  public constructor(preferences: RampPreferencesModel) {
    this.preferences = preferences;
    this.writeStateToProperties(this.lastEndState);
    this.setupInputListeners();
    this.applyPreferences();
    this.setupForcesOnly();
  }

  /**
   * Applies the simulation preferences (Preferences → Simulation) to the model.
   * Called on construction and Reset All so that changes to the preference
   * defaults take effect. Each preference's own initial value comes from a
   * query parameter (see rampQueryParameters).
   */
  private applyPreferences(): void {
    this.rampAngleProperty.value = this.preferences.initialRampAngleProperty.value * DEG_TO_RAD;
    this.soundEnabledProperty.value = this.preferences.soundEnabledProperty.value;
    // Setting frictionlessProperty triggers its listener, which swaps the
    // friction coefficients using the saved values.
    this.frictionlessProperty.value = this.preferences.frictionlessProperty.value;

    const showComponents = this.preferences.showComponentsProperty.value;
    this.vectorVisibility.entireVectorsProperty.value = !showComponents;
    this.vectorVisibility.parallelComponentsProperty.value = showComponents;
  }

  public step(dt: number): void {
    this.timeSeriesModel.step(Math.min(dt, MAX_DT));
  }

  public advancePhysics(dt: number): void {
    const current = this.buildCurrentState();
    const result = stepPhysics(current, this.lastEndState, dt);
    this.lastEndState = result.state;
    this.writeStateToProperties(result.state);
    if (result.collision !== null) {
      this.collisionEmitter.emit(result.collision);
    }
    this.stepCompleteEmitter.emit();
  }

  public setupForcesOnly(): void {
    const s = setupForces(this.buildCurrentState());
    this.isWritingState = true;
    try {
      this.appliedParallelProperty.value = s.appliedParallel;
      this.gravityParallelProperty.value = s.gravityParallel;
      this.frictionParallelProperty.value = s.frictionParallel;
      this.wallParallelProperty.value = s.wallParallel;
      this.netParallelProperty.value = s.netParallel;
      this.normalPerpendicularProperty.value = s.normalPerpendicular;
      this.accelerationProperty.value = s.acceleration;
      this.kineticEnergyProperty.value = getKineticEnergy(s);
      this.potentialEnergyProperty.value = getPotentialEnergy(s);
      this.totalEnergyProperty.value = getTotalEnergy(s);
    } finally {
      this.isWritingState = false;
    }
  }

  public getStateSnapshot(): RampPhysicsState {
    return this.lastEndState;
  }

  public setStateSnapshot(state: RampPhysicsState): void {
    this.lastEndState = state;
    this.isWritingState = true;
    try {
      this.writeStateToProperties(state);
      this.rampAngleProperty.value = state.rampAngle;
      this.appliedForceProperty.value = state.appliedForce;
      this.massProperty.value = state.mass;
      this.staticFrictionProperty.value = state.staticFriction;
      this.kineticFrictionProperty.value = state.kineticFriction;
      this.zeroPointYProperty.value = state.zeroPointY;
    } finally {
      this.isWritingState = false;
    }
  }

  public clearHeat(): void {
    this.lastEndState = clearHeatState(this.buildCurrentState());
    this.writeStateToProperties(this.lastEndState);
  }

  public reset(): void {
    this.timeSeriesModel.reset();
    this.rampAngleProperty.reset();
    this.appliedForceProperty.reset();
    this.selectedObjectProperty.reset();
    this.massProperty.reset();
    this.staticFrictionProperty.reset();
    this.kineticFrictionProperty.reset();
    this.frictionlessProperty.reset();
    this.zeroPointYProperty.reset();
    this.globalPositionProperty.reset();
    this.soundEnabledProperty.reset();
    this.savedStaticFriction = rampQueryParameters.staticFriction;
    this.savedKineticFriction = rampQueryParameters.kineticFriction;
    this.lastEndState = createInitialState();
    this.writeStateToProperties(this.lastEndState);
    this.vectorVisibility.reset();
    this.applyPreferences();
    this.setupForcesOnly();
  }

  private buildCurrentState(): RampPhysicsState {
    return {
      ...this.lastEndState,
      surface: this.surfaceProperty.value,
      positionInSurface: this.positionInSurfaceProperty.value,
      velocity: this.velocityProperty.value,
      mass: this.massProperty.value,
      staticFriction: this.staticFrictionProperty.value,
      kineticFriction: this.kineticFrictionProperty.value,
      rampAngle: this.rampAngleProperty.value,
      appliedForce: this.appliedForceProperty.value,
      zeroPointY: this.zeroPointYProperty.value,
    };
  }

  private writeStateToProperties(state: RampPhysicsState): void {
    this.isWritingState = true;
    try {
      this.surfaceProperty.value = state.surface;
      this.positionInSurfaceProperty.value = state.positionInSurface;
      this.velocityProperty.value = state.velocity;
      this.accelerationProperty.value = state.acceleration;
      this.globalPositionProperty.value = getGlobalPosition(state);
      this.appliedParallelProperty.value = state.appliedParallel;
      this.gravityParallelProperty.value = state.gravityParallel;
      this.frictionParallelProperty.value = state.frictionParallel;
      this.wallParallelProperty.value = state.wallParallel;
      this.netParallelProperty.value = state.netParallel;
      this.normalPerpendicularProperty.value = state.normalPerpendicular;
      this.kineticEnergyProperty.value = getKineticEnergy(state);
      this.potentialEnergyProperty.value = getPotentialEnergy(state);
      this.thermalEnergyProperty.value = state.thermalEnergy;
      this.totalEnergyProperty.value = getTotalEnergy(state);
      this.appliedWorkProperty.value = state.appliedWork;
      this.gravityWorkProperty.value = state.gravityWork;
      this.frictiveWorkProperty.value = state.frictiveWork;
      this.totalWorkProperty.value = getTotalWork(state);
    } finally {
      this.isWritingState = false;
    }
  }

  private setupInputListeners(): void {
    this.setupForceParameterListeners();
    this.setupPositionListener();
    this.setupObjectSelectionListener();
    this.setupFrictionlessListener();
  }

  /** Angle, applied force, mass, frictions, and zero-point all re-derive forces immediately. */
  private setupForceParameterListeners(): void {
    const onForcesOnly = (): void => {
      if (!this.isWritingState) {
        this.setupForcesOnly();
      }
    };
    this.rampAngleProperty.lazyLink(onForcesOnly);
    this.appliedForceProperty.lazyLink(onForcesOnly);
    this.massProperty.lazyLink(onForcesOnly);
    this.staticFrictionProperty.lazyLink(onForcesOnly);
    this.kineticFrictionProperty.lazyLink(onForcesOnly);
    this.zeroPointYProperty.lazyLink(onForcesOnly);
  }

  /** Position slider: translate 1D arc-length → surface + positionInSurface. */
  private setupPositionListener(): void {
    this.globalPositionProperty.lazyLink((value) => {
      if (this.isWritingState) {
        return;
      }
      const placed = withGlobalPosition(this.buildCurrentState(), value);
      this.isWritingState = true;
      try {
        this.surfaceProperty.value = placed.surface;
        this.positionInSurfaceProperty.value = placed.positionInSurface;
      } finally {
        this.isWritingState = false;
      }
      this.setupForcesOnly();
    });
  }

  /** Object picker: propagate the selected object's mass and friction coefficients. */
  private setupObjectSelectionListener(): void {
    this.selectedObjectProperty.lazyLink((obj) => {
      if (this.isWritingState) {
        return;
      }
      this.massProperty.value = obj.mass;
      if (this.frictionlessProperty.value) {
        // Keep the saved coefficients in sync so restoring friction picks up the new object's values.
        this.savedStaticFriction = obj.staticFriction;
        this.savedKineticFriction = obj.kineticFriction;
      } else {
        this.staticFrictionProperty.value = obj.staticFriction;
        this.kineticFrictionProperty.value = obj.kineticFriction;
      }
    });
  }

  /** Frictionless toggle: swap coefficients to/from zero, preserving the originals. */
  private setupFrictionlessListener(): void {
    this.frictionlessProperty.lazyLink((frictionless) => {
      if (this.isWritingState) {
        return;
      }
      if (frictionless) {
        this.savedStaticFriction = this.staticFrictionProperty.value;
        this.savedKineticFriction = this.kineticFrictionProperty.value;
        this.staticFrictionProperty.value = 0;
        this.kineticFrictionProperty.value = 0;
      } else {
        this.staticFrictionProperty.value = this.savedStaticFriction;
        this.kineticFrictionProperty.value = this.savedKineticFriction;
      }
      this.setupForcesOnly();
    });
  }
}
