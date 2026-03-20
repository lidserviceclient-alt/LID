package com.lifeevent.lid.common.exception;

public class ResourceNotFoundException extends RuntimeException{
    public ResourceNotFoundException(String resource, String field, String value){
        super(
                String.format("Resource %s not found, field %s equals to %s ", resource, field, value)
        );
    }
}
