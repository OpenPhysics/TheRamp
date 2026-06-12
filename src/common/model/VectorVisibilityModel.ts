/**
 * VectorVisibilityModel.ts
 *
 * BooleanProperties controlling force-vector and FBD visibility.
 */
import { BooleanProperty } from "scenerystack/axon";

export class VectorVisibilityModel {
  public readonly appliedVisibleProperty = new BooleanProperty(true);
  public readonly gravityVisibleProperty = new BooleanProperty(true);
  public readonly normalVisibleProperty = new BooleanProperty(true);
  public readonly frictionVisibleProperty = new BooleanProperty(true);
  public readonly wallVisibleProperty = new BooleanProperty(true);
  public readonly totalVisibleProperty = new BooleanProperty(true);

  public readonly entireVectorsProperty = new BooleanProperty(true);
  public readonly parallelComponentsProperty = new BooleanProperty(false);
  public readonly perpendicularComponentsProperty = new BooleanProperty(false);
  public readonly xComponentsProperty = new BooleanProperty(false);
  public readonly yComponentsProperty = new BooleanProperty(false);

  public readonly fbdVisibleProperty = new BooleanProperty(true);

  public reset(): void {
    this.appliedVisibleProperty.reset();
    this.gravityVisibleProperty.reset();
    this.normalVisibleProperty.reset();
    this.frictionVisibleProperty.reset();
    this.wallVisibleProperty.reset();
    this.totalVisibleProperty.reset();
    this.entireVectorsProperty.reset();
    this.parallelComponentsProperty.reset();
    this.perpendicularComponentsProperty.reset();
    this.xComponentsProperty.reset();
    this.yComponentsProperty.reset();
    this.fbdVisibleProperty.reset();
  }
}
