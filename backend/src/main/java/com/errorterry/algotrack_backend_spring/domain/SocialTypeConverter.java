package com.errorterry.algotrack_backend_spring.domain;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class SocialTypeConverter implements AttributeConverter<SocialType, String> {

    @Override
    public String convertToDatabaseColumn(SocialType attribute) {
        return attribute == null ? null : attribute.name().toLowerCase();
    }

    @Override
    public SocialType convertToEntityAttribute(String dbData) {
        return dbData == null ? null : SocialType.valueOf(dbData.toUpperCase());
    }

}
