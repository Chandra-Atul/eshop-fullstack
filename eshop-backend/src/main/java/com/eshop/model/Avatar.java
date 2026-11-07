package com.eshop.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Avatar {
    @Column(name = "avatar_public_id")
    private String public_id;

    @Column(name = "avatar_url")
    private String url;
}