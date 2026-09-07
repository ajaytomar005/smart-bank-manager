package com.smartbank.manager.atm;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AtmRepository extends JpaRepository<Atm, Long> {

    /**
     * Bounding-box pre-filter (uses the lat/lng index), then exact Haversine distance
     * computed and filtered/sorted in SQL. Returns only atm_id + distance so the full
     * entity (including the services collection) can be loaded normally afterwards.
     */
    @Query(value = """
            SELECT atm_id AS atmId, distance_meters AS distanceMeters
            FROM (
                SELECT a.atm_id,
                       6371000 * 2 * asin(sqrt(
                           power(sin(radians(:lat - a.latitude) / 2), 2)
                           + cos(radians(:lat)) * cos(radians(a.latitude))
                             * power(sin(radians(:lng - a.longitude) / 2), 2)
                       )) AS distance_meters
                FROM atms a
                WHERE a.latitude BETWEEN :minLat AND :maxLat
                  AND a.longitude BETWEEN :minLng AND :maxLng
            ) AS candidates
            WHERE distance_meters <= :radiusMeters
            ORDER BY distance_meters ASC
            """, nativeQuery = true)
    List<AtmNearbyRow> findNearby(
            @Param("lat") double lat,
            @Param("lng") double lng,
            @Param("minLat") double minLat,
            @Param("maxLat") double maxLat,
            @Param("minLng") double minLng,
            @Param("maxLng") double maxLng,
            @Param("radiusMeters") double radiusMeters);

    Optional<Atm> findByCode(String code);

    List<Atm> findByStatusAndLastHeartbeatAtBefore(AtmStatus status, java.time.Instant threshold);
}
