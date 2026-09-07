package com.smartbank.manager.atm;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class GeoUtilsTest {

    @Test
    void haversineMeters_sameCoordinate_isZero() {
        double distance = GeoUtils.haversineMeters(12.9716, 77.6046, 12.9716, 77.6046);
        assertThat(distance).isCloseTo(0.0, org.assertj.core.data.Offset.offset(0.001));
    }

    @Test
    void haversineMeters_knownDistance_isAccurateWithinTolerance() {
        // MG Road to Koramangala, Bengaluru — roughly 4.6 km apart.
        double distance = GeoUtils.haversineMeters(12.9716, 77.6046, 12.9352, 77.6245);
        assertThat(distance).isBetween(4_000.0, 5_200.0);
    }

    @Test
    void boundingBox_containsCenterPoint() {
        GeoUtils.BoundingBox box = GeoUtils.boundingBox(12.9716, 77.6046, 2000);
        assertThat(box.minLat()).isLessThan(12.9716);
        assertThat(box.maxLat()).isGreaterThan(12.9716);
        assertThat(box.minLng()).isLessThan(77.6046);
        assertThat(box.maxLng()).isGreaterThan(77.6046);
    }

    @Test
    void boundingBox_clampsAtPoles() {
        GeoUtils.BoundingBox box = GeoUtils.boundingBox(89.999, 0, 20000);
        assertThat(box.maxLat()).isLessThanOrEqualTo(90.0);
    }
}
