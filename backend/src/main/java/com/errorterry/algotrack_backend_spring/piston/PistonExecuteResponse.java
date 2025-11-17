package com.errorterry.algotrack_backend_spring.piston;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PistonExecuteResponse {

    private String language;
    private String version;
    private Run run;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Run {
        private String stdout;
        private String stderr;
        private String output;
        private Integer code;
        private String signal;
    }
}
