package com.smartbank.manager.atm;

public final class GeoUtils {

    private static final double EARTH_RADIUS_METERS = 6_371_000.0;
    private static final double METERS_PER_DEGREE_LATITUDE = 111_320.0;

    private GeoUtils() {
    }

    public static double haversineMeters(double lat1, double lng1, double lat2, double lng2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        double c = 2 * Math.asin(Math.sqrt(a));
        return EARTH_RADIUS_METERS * c;
    }

    /** Latitude/longitude degree deltas that safely bound a circle of the given radius. */
    public static BoundingBox boundingBox(double lat, double lng, double radiusMeters) {
        double latDelta = radiusMeters / METERS_PER_DEGREE_LATITUDE;
        double lngDivisor = METERS_PER_DEGREE_LATITUDE * Math.cos(Math.toRadians(lat));
        double lngDelta = radiusMeters / Math.max(Math.abs(lngDivisor), 1.0);

        return new BoundingBox(
                clampLat(lat - latDelta),
                clampLat(lat + latDelta),
                clampLng(lng - lngDelta),
                clampLng(lng + lngDelta));
    }

    private static double clampLat(double lat) {
        return Math.max(-90.0, Math.min(90.0, lat));
    }

    private static double clampLng(double lng) {
        return Math.max(-180.0, Math.min(180.0, lng));
    }

    public record BoundingBox(double minLat, double maxLat, double minLng, double maxLng) {
    }
}
