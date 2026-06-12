/**
 * RampNamespace.ts
 *
 * The SceneryStack Namespace for this simulation. It is used as the first
 * argument to ProfileColorProperty (so color names are scoped to this sim)
 * and optionally for registering objects with the PhET-iO API.
 *
 * The string argument matches the kebab-case identifier used in package.json
 * and src/init.ts.
 */
import { Namespace } from "scenerystack/phet-core";

const RampNamespace = new Namespace("the-ramp");

export default RampNamespace;
