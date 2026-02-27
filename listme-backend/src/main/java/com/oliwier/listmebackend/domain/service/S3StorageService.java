package com.oliwier.listmebackend.domain.service;

import com.oliwier.listmebackend.api.dto.PresignResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetBucketLocationRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.time.Duration;
import java.util.UUID;

@Service
public class S3StorageService {

    @Value("${aws.region}")
    private String region;

    @Value("${aws.s3.bucket}")
    private String bucket;

    // Cached after first successful lookup — avoids extra API call on every presign
    private volatile String resolvedRegion;

    /**
     * Returns the bucket's actual AWS region.
     * Uses GetBucketLocation on first call, then caches the result.
     * This prevents 301 redirects (and the resulting PUT→GET conversion) caused
     * by a region mismatch between the configured value and the real bucket region.
     */
    private String getActualRegion() {
        if (resolvedRegion != null) return resolvedRegion;
        synchronized (this) {
            if (resolvedRegion != null) return resolvedRegion;
            try (S3Client s3 = S3Client.builder().region(Region.of(region)).build()) {
                String loc = s3.getBucketLocation(
                        GetBucketLocationRequest.builder().bucket(bucket).build()
                ).locationConstraintAsString();
                // us-east-1 buckets return an empty string from GetBucketLocation
                resolvedRegion = (loc == null || loc.isEmpty()) ? "us-east-1" : loc;
            }
        }
        return resolvedRegion;
    }

    public PresignResponse presign(String originalFilename) {
        String ext = originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf('.'))
                : "";
        String key = "items/" + UUID.randomUUID() + ext;

        String actualRegion = getActualRegion();

        try (S3Presigner presigner = S3Presigner.builder()
                .region(Region.of(actualRegion))
                .build()) {

            PutObjectRequest putRequest = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .build();

            PresignedPutObjectRequest presigned = presigner.presignPutObject(r -> r
                    .signatureDuration(Duration.ofMinutes(5))
                    .putObjectRequest(putRequest));

            String publicUrl = "https://" + bucket + ".s3." + actualRegion + ".amazonaws.com/" + key;
            return new PresignResponse(presigned.url().toString(), publicUrl);
        }
    }
}
