package com.smartbank.manager.atm;

/** Projection for the bounding-box + Haversine nearby query. */
public interface AtmNearbyRow {
    Long getAtmId();

    double getDistanceMeters();
}
