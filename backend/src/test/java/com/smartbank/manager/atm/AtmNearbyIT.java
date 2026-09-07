package com.smartbank.manager.atm;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.assertj.MockMvcTester.create;

import java.time.Instant;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.assertj.MockMvcTester;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

@Testcontainers
@SpringBootTest
@AutoConfigureMockMvc
class AtmNearbyIT {


    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16-alpine");

    @Container
    static final GenericContainer<?> REDIS =
            new GenericContainer<>(DockerImageName.parse("redis:7-alpine")).withExposedPorts(6379);

    @DynamicPropertySource
    static void redisProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.data.redis.host", REDIS::getHost);
        registry.add("spring.data.redis.port", () -> REDIS.getMappedPort(6379));
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AtmRepository atmRepository;

    private MockMvcTester mvcTester;

    @BeforeEach
    void setUp() {
        mvcTester = create(mockMvc);
        atmRepository.deleteAll();

        // Center point, plus atms at increasing distance, so ordering is unambiguous.
        seedAtm("NEAR-1", 12.9716, 77.6046, true, AtmStatus.ONLINE, CashStatus.AVAILABLE);
        seedAtm("NEAR-2", 12.9720, 77.6050, true, AtmStatus.ONLINE, CashStatus.AVAILABLE);
        seedAtm("MID-1", 12.9800, 77.6150, true, AtmStatus.ONLINE, CashStatus.AVAILABLE);
        seedAtm("FAR-1", 13.0500, 77.7000, true, AtmStatus.ONLINE, CashStatus.AVAILABLE);
        seedAtm("CLOSED-1", 12.9717, 77.6047, false, AtmStatus.OFFLINE, CashStatus.OUT_OF_CASH);
    }

    private void seedAtm(String code, double lat, double lng, boolean open24x7, AtmStatus status, CashStatus cashStatus) {
        Atm atm = new Atm();
        atm.setName(code);
        atm.setCode(code);
        atm.setAddress("Test Address");
        atm.setLatitude(lat);
        atm.setLongitude(lng);
        atm.setOpen24x7(open24x7);
        atm.setStatus(status);
        atm.setCashStatus(cashStatus);
        atm.setLastHeartbeatAt(Instant.now());
        atm.setServices(java.util.Set.of(AtmServiceType.WITHDRAWAL));
        atmRepository.save(atm);
    }

    @Test
    @WithMockUser(authorities = "ROLE_CUSTOMER")
    void nearby_returnsResultsSortedByDistanceAscending() {
        var result = mvcTester.get()
                .uri("/atms/nearby?lat=12.9716&lng=77.6046&radiusMeters=20000")
                .exchange();

        assertThat(result).hasStatusOk();
        String body = new String(result.getResponse().getContentAsByteArray());
        assertThat(body).contains("\"NEAR-1\"");
        int nearIndex = body.indexOf("NEAR-1");
        int midIndex = body.indexOf("MID-1");
        int farIndex = body.indexOf("FAR-1");
        assertThat(nearIndex).isLessThan(midIndex);
        assertThat(midIndex).isLessThan(farIndex);
    }

    @Test
    @WithMockUser(authorities = "ROLE_CUSTOMER")
    void nearby_smallRadius_excludesFarAtms() {
        var result = mvcTester.get()
                .uri("/atms/nearby?lat=12.9716&lng=77.6046&radiusMeters=500")
                .exchange();

        assertThat(result).hasStatusOk();
        String body = new String(result.getResponse().getContentAsByteArray());
        assertThat(body).contains("NEAR-1");
        assertThat(body).doesNotContain("MID-1");
        assertThat(body).doesNotContain("FAR-1");
    }

    @Test
    @WithMockUser(authorities = "ROLE_CUSTOMER")
    void nearby_openNowFilter_excludesClosedAtms() {
        var result = mvcTester.get()
                .uri("/atms/nearby?lat=12.9716&lng=77.6046&radiusMeters=20000&openNow=true")
                .exchange();

        assertThat(result).hasStatusOk();
        String body = new String(result.getResponse().getContentAsByteArray());
        assertThat(body).doesNotContain("CLOSED-1");
    }

    @Test
    @WithMockUser(authorities = "ROLE_CUSTOMER")
    void nearby_invalidLatitude_returnsBadRequest() {
        var result = mvcTester.get().uri("/atms/nearby?lat=999&lng=77.6046").exchange();
        assertThat(result).hasStatus(org.springframework.http.HttpStatus.BAD_REQUEST);
    }

    @Test
    @WithMockUser(authorities = "ROLE_CUSTOMER")
    void nearbyCount_reportsAvailableAndTotal() {
        var result = mvcTester.get()
                .uri("/atms/nearby/count?lat=12.9716&lng=77.6046&radiusMeters=20000")
                .exchange();

        assertThat(result).hasStatusOk();
        String body = new String(result.getResponse().getContentAsByteArray());
        assertThat(body).contains("availableCount");
        assertThat(body).contains("totalNearby");
    }
}
