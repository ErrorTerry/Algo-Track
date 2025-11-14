package com.errorterry.algotrack_backend_spring.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RunRequest {
    private String language;
    private String code;
    private String stdin;
}
