package com.errorterry.algotrack_backend_spring.piston;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class PistonExecuteRequest {

    private String language;
    private String version;
    private List<FilePart> files;
    private String stdin;

    @Getter
    @Setter
    public static class FilePart {
        private String name;
        private String content;

        public FilePart() {}

        public FilePart(String name, String content) {
            this.name = name;
            this.content = content;
        }
    }
}
