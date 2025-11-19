package com.errorterry.algotrack_backend_spring.domain;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class GoalPeriodConverter implements AttributeConverter<GoalPeriod, String> {

    @Override
    public String convertToDatabaseColumn(GoalPeriod attribute) {
        return attribute == null ? null : attribute.name().toLowerCase();
    }

    @Override
    public GoalPeriod convertToEntityAttribute(String dbData) {
        return dbData == null ? null : GoalPeriod.valueOf(dbData.toUpperCase());
    }

}
