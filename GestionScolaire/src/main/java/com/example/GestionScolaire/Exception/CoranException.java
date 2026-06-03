package com.example.GestionScolaire.Exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;

@Getter
public class CoranException extends RuntimeException {

    private final HttpStatus status;
    private final LocalDateTime timestamp;

    public CoranException(String message, HttpStatus status) {
        super(message);
        this.status = status;
        this.timestamp = LocalDateTime.now();
    }

    public CoranException(String message, HttpStatus status, Throwable cause) {
        super(message, cause);
        this.status = status;
        this.timestamp = LocalDateTime.now();
    }

    // Factory methods
    public static CoranException notFound(String message) {
        return new CoranException(message, HttpStatus.NOT_FOUND);
    }

    public static CoranException badRequest(String message) {
        return new CoranException(message, HttpStatus.BAD_REQUEST);
    }

    public static CoranException conflict(String message) {
        return new CoranException(message, HttpStatus.CONFLICT);
    }

    public static CoranException internalError(String message) {
        return new CoranException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    public static CoranException unauthorized(String message) {
        return new CoranException(message, HttpStatus.UNAUTHORIZED);
    }

    public static CoranException forbidden(String message) {
        return new CoranException(message, HttpStatus.FORBIDDEN);
    }
}