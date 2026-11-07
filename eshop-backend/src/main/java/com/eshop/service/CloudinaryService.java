package com.eshop.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.eshop.model.Avatar;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryService(
            @Value("${cloudinary.cloud-name:test}") String name,
            @Value("${cloudinary.api-key:test}") String key,
            @Value("${cloudinary.api-secret:test}") String secret) {
        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", name,
                "api_key", key,
                "api_secret", secret));
    }

    public Avatar uploadImage(String base64Image, String folder) throws IOException {
        if (base64Image == null || !base64Image.startsWith("data:image")) {
            return Avatar.builder().public_id("sample_id").url(base64Image != null ? base64Image : "https://via.placeholder.com/150").build();
        }
        Map uploadResult = cloudinary.uploader().upload(base64Image, ObjectUtils.asMap("folder", folder));
        return Avatar.builder()
                .public_id(uploadResult.get("public_id").toString())
                .url(uploadResult.get("secure_url").toString())
                .build();
    }

    public void deleteImage(String publicId) throws IOException {
        if (publicId != null && !publicId.equals("sample_id")) {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        }
    }
}
