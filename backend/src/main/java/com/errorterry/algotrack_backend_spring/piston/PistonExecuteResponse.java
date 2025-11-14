package com.errorterry.algotrack_backend_spring.piston;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PistonExecuteResponse {
    private RunResult run;
    private String language;
    private String version;

    @Getter
    @Setter
    public static class RunResult {
        private String stdout;
        private String stderr;
        private Integer code;
        private String output;
    }
}
