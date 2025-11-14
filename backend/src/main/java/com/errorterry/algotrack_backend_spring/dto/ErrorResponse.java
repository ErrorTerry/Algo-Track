package com.errorterry.algotrack_backend_spring.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ErrorResponse {
    private String code;
    private String message;
}
