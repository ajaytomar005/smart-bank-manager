package com.smartbank.manager.dispute;

import jakarta.validation.constraints.NotNull;

public record DisputeResolutionRequest(
        @NotNull DisputeStatus status,
        String resolutionNotes
) {
}
