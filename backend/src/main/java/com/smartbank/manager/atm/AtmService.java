package com.smartbank.manager.atm;

import com.smartbank.manager.common.PageResponse;
import com.smartbank.manager.common.ResourceNotFoundException;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.type.TypeFactory;

@Service
public class AtmService {

    private static final Duration NEARBY_CACHE_TTL = Duration.ofSeconds(45);

    private final AtmRepository atmRepository;
    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    public AtmService(AtmRepository atmRepository, StringRedisTemplate redisTemplate, ObjectMapper objectMapper) {
        this.atmRepository = atmRepository;
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
    }

    public PageResponse<AtmNearbyResponse> findNearby(
            double lat, double lng, double radiusMeters, Boolean openNow, AtmServiceType service, int page, int pageSize) {
        List<AtmNearbyResponse> candidates = getNearbyCandidates(lat, lng, radiusMeters);

        List<AtmNearbyResponse> filtered = candidates.stream()
                .filter(a -> openNow == null || a.openNow() == openNow)
                .filter(a -> service == null || a.services().contains(service))
                .toList();

        return PageResponse.of(filtered, page, pageSize);
    }

    public NearbyCountResponse countNearby(double lat, double lng, double radiusMeters) {
        List<AtmNearbyResponse> candidates = getNearbyCandidates(lat, lng, radiusMeters);
        long availableCount = candidates.stream().filter(AtmNearbyResponse::availableForWithdrawal).count();
        return new NearbyCountResponse(availableCount, candidates.size());
    }

    @SuppressWarnings("unchecked")
    private List<AtmNearbyResponse> getNearbyCandidates(double lat, double lng, double radiusMeters) {
        String cacheKey = buildCacheKey(lat, lng, radiusMeters);
        String cached = redisTemplate.opsForValue().get(cacheKey);
        if (cached != null) {
            return objectMapper.readValue(
                    cached, TypeFactory.createDefaultInstance().constructCollectionType(List.class, AtmNearbyResponse.class));
        }

        List<AtmNearbyResponse> computed = computeNearby(lat, lng, radiusMeters);
        redisTemplate.opsForValue().set(cacheKey, objectMapper.writeValueAsString(computed), NEARBY_CACHE_TTL);
        return computed;
    }

    private String buildCacheKey(double lat, double lng, double radiusMeters) {
        double roundedLat = Math.round(lat * 1000.0) / 1000.0;
        double roundedLng = Math.round(lng * 1000.0) / 1000.0;
        long roundedRadius = Math.round(radiusMeters / 100.0) * 100;
        return "atm:nearby:%s:%s:%s".formatted(roundedLat, roundedLng, roundedRadius);
    }

    private List<AtmNearbyResponse> computeNearby(double lat, double lng, double radiusMeters) {
        GeoUtils.BoundingBox box = GeoUtils.boundingBox(lat, lng, radiusMeters);
        List<AtmNearbyRow> rows = atmRepository.findNearby(
                lat, lng, box.minLat(), box.maxLat(), box.minLng(), box.maxLng(), radiusMeters);

        Map<Long, Double> distanceByAtmId = new LinkedHashMap<>();
        rows.forEach(row -> distanceByAtmId.put(row.getAtmId(), row.getDistanceMeters()));

        List<Atm> atms = atmRepository.findAllById(distanceByAtmId.keySet());
        Instant now = Instant.now();
        LocalTime nowTime = LocalTime.now(ZoneId.systemDefault());

        return atms.stream()
                .map(atm -> toNearbyResponse(atm, distanceByAtmId.get(atm.getAtmId()), now, nowTime))
                .sorted(Comparator.comparingDouble(AtmNearbyResponse::distanceMeters))
                .toList();
    }

    private AtmNearbyResponse toNearbyResponse(Atm atm, double distanceMeters, Instant now, LocalTime nowTime) {
        boolean openNow = AtmAvailabilityCalculator.isOpenNow(atm, nowTime);
        boolean availableForWithdrawal = AtmAvailabilityCalculator.isAvailableForWithdrawal(atm, now, nowTime);
        return new AtmNearbyResponse(
                atm.getAtmId(),
                atm.getName(),
                atm.getCode(),
                atm.getAddress(),
                atm.getLatitude(),
                atm.getLongitude(),
                atm.getStatus(),
                atm.getCashStatus(),
                atm.isOpen24x7(),
                atm.getOpenTime(),
                atm.getCloseTime(),
                atm.getServices(),
                openNow,
                availableForWithdrawal,
                distanceMeters);
    }

    public AtmDetailResponse getById(Long atmId) {
        Atm atm = findAtmOrThrow(atmId);
        Instant now = Instant.now();
        LocalTime nowTime = LocalTime.now(ZoneId.systemDefault());
        return AtmDetailResponse.from(
                atm,
                AtmAvailabilityCalculator.isOpenNow(atm, nowTime),
                AtmAvailabilityCalculator.isAvailableForWithdrawal(atm, now, nowTime));
    }

    @Transactional
    public AtmDetailResponse updateStatus(Long atmId, AtmStatusUpdateRequest request) {
        Atm atm = findAtmOrThrow(atmId);
        atm.setStatus(request.status());
        atm.setCashStatus(request.cashStatus());
        atm.setUpdatedAt(Instant.now());
        atm = atmRepository.save(atm);
        return getById(atm.getAtmId());
    }

    @Transactional
    public void recordHeartbeat(Long atmId, AtmHeartbeatRequest request) {
        Atm atm = findAtmOrThrow(atmId);
        if (atm.getStatus() == AtmStatus.OFFLINE) {
            atm.setStatus(AtmStatus.ONLINE);
        }
        atm.setCashStatus(request.cashStatus());
        atm.setLastHeartbeatAt(Instant.now());
        atm.setUpdatedAt(Instant.now());
        atmRepository.save(atm);
    }

    private Atm findAtmOrThrow(Long atmId) {
        return atmRepository.findById(atmId)
                .orElseThrow(() -> new ResourceNotFoundException("ATM not found: " + atmId));
    }
}
