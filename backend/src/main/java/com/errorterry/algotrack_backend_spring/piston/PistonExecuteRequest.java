package com.errorterry.algotrack_backend_spring.piston;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PistonExecuteRequest {

    private String language;
    private String version;
    private List<File> files;
    private String stdin;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class File {
        private String name;
        private String content;
    }
}
