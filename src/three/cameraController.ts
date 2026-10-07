/**
 * QuantumCameraController
 * Reusable cinematic 3D camera controller for smooth transitions, focus,
 * orbit, and zooming in scientific / fintech quantum visualizations.
 * Guarantees smooth easing with zero abrupt teleports.
 */

import * as THREE from 'three';

export interface CameraLimits {
  minDistance: number;
  maxDistance: number;
  minPolarAngle: number;
  maxPolarAngle: number;
}

export class QuantumCameraController {
  private camera: THREE.PerspectiveCamera;
  private domElement: HTMLElement;

  // Current transform
  private currentPosition = new THREE.Vector3();
  private currentLookAt = new THREE.Vector3();

  // Target transform (for cinematic lerp)
  private targetPosition = new THREE.Vector3();
  private targetLookAt = new THREE.Vector3();

  // Initial home transform
  private defaultPosition = new THREE.Vector3(0, 2, 22);
  private defaultLookAt = new THREE.Vector3(0, 0, 0);

  // Spherical orbit controls
  private spherical = new THREE.Spherical();
  private targetSpherical = new THREE.Spherical();

  // Animation parameters
  private dampingFactor = 4.5;
  private isTransitioning = false;
  private transitionProgress = 1.0;
  private transitionDuration = 0.8; // seconds

  // Limits
  private limits: CameraLimits = {
    minDistance: 7,
    maxDistance: 45,
    minPolarAngle: 0.2,
    maxPolarAngle: Math.PI - 0.2,
  };

  constructor(
    camera: THREE.PerspectiveCamera,
    domElement: HTMLElement,
    initialPos?: THREE.Vector3,
    initialLookAt?: THREE.Vector3
  ) {
    this.camera = camera;
    this.domElement = domElement;

    if (initialPos) this.defaultPosition.copy(initialPos);
    if (initialLookAt) this.defaultLookAt.copy(initialLookAt);

    this.currentPosition.copy(this.defaultPosition);
    this.currentLookAt.copy(this.defaultLookAt);
    this.targetPosition.copy(this.defaultPosition);
    this.targetLookAt.copy(this.defaultLookAt);

    this.camera.position.copy(this.currentPosition);
    this.camera.lookAt(this.currentLookAt);

    this.updateSphericalFromCurrent();
  }

  private updateSphericalFromCurrent(): void {
    const offset = new THREE.Vector3().subVectors(this.targetPosition, this.targetLookAt);
    this.spherical.setFromVector3(offset);
    this.spherical.radius = THREE.MathUtils.clamp(
      this.spherical.radius,
      this.limits.minDistance,
      this.limits.maxDistance
    );
    this.targetSpherical.copy(this.spherical);
  }

  /**
   * Smoothly focus on an object in 3D space
   */
  public focusObject(
    targetPos: THREE.Vector3,
    preferredDistance = 9.5,
    elevationOffset = 0.5
  ): void {
    // Determine view vector direction relative to center
    const dir = new THREE.Vector3().subVectors(this.camera.position, targetPos).normalize();
    if (dir.lengthSq() < 0.001) dir.set(0, 0.4, 1).normalize();

    const destPos = new THREE.Vector3()
      .copy(targetPos)
      .addScaledVector(dir, preferredDistance);
    destPos.y += elevationOffset;

    this.transitionTo(destPos, targetPos, 0.85);
  }

  /**
   * Reset camera to default home framing
   */
  public resetCamera(): void {
    this.transitionTo(this.defaultPosition, this.defaultLookAt, 0.9);
  }

  /**
   * Zoom in smoothly toward the target
   */
  public zoomIn(delta = 2.5): void {
    const offset = new THREE.Vector3().subVectors(this.targetPosition, this.targetLookAt);
    const currentDist = offset.length();
    const newDist = Math.max(this.limits.minDistance, currentDist - delta);
    offset.setLength(newDist);
    this.targetPosition.addVectors(this.targetLookAt, offset);
  }

  /**
   * Zoom out smoothly away from the target
   */
  public zoomOut(delta = 2.5): void {
    const offset = new THREE.Vector3().subVectors(this.targetPosition, this.targetLookAt);
    const currentDist = offset.length();
    const newDist = Math.min(this.limits.maxDistance, currentDist + delta);
    offset.setLength(newDist);
    this.targetPosition.addVectors(this.targetLookAt, offset);
  }

  /**
   * Orbit camera around the current lookAt point
   */
  public orbitAround(deltaTheta: number, deltaPhi: number): void {
    const offset = new THREE.Vector3().subVectors(this.targetPosition, this.targetLookAt);
    this.targetSpherical.setFromVector3(offset);
    this.targetSpherical.theta += deltaTheta;
    this.targetSpherical.phi = THREE.MathUtils.clamp(
      this.targetSpherical.phi + deltaPhi,
      this.limits.minPolarAngle,
      this.limits.maxPolarAngle
    );
    this.targetSpherical.makeSafe();

    offset.setFromSpherical(this.targetSpherical);
    this.targetPosition.addVectors(this.targetLookAt, offset);
  }

  /**
   * Cinematic transition between any two points
   */
  public transitionTo(
    destPosition: THREE.Vector3,
    destLookAt: THREE.Vector3,
    durationSeconds = 0.85
  ): void {
    this.targetPosition.copy(destPosition);
    this.targetLookAt.copy(destLookAt);
    this.transitionDuration = Math.max(0.2, durationSeconds);
    this.transitionProgress = 0;
    this.isTransitioning = true;
  }

  /**
   * Called every frame from requestAnimationFrame loop
   */
  public update(deltaTime: number): void {
    const delta = Math.min(deltaTime, 0.1);

    if (this.isTransitioning) {
      this.transitionProgress += delta / this.transitionDuration;
      if (this.transitionProgress >= 1.0) {
        this.transitionProgress = 1.0;
        this.isTransitioning = false;
      }
    }

    // Smooth cinematic cubic lerping
    const factor = 1 - Math.exp(-this.dampingFactor * delta);
    this.currentPosition.lerp(this.targetPosition, factor);
    this.currentLookAt.lerp(this.targetLookAt, factor);

    this.camera.position.copy(this.currentPosition);
    this.camera.lookAt(this.currentLookAt);
  }

  public getTargetPosition(): THREE.Vector3 {
    return this.targetPosition;
  }

  public getTargetLookAt(): THREE.Vector3 {
    return this.targetLookAt;
  }

  public isBusy(): boolean {
    return this.isTransitioning;
  }
}
