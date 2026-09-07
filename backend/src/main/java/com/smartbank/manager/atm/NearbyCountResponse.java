package com.smartbank.manager.atm;

import java.io.Serializable;

public record NearbyCountResponse(long availableCount, long totalNearby) implements Serializable {
}
