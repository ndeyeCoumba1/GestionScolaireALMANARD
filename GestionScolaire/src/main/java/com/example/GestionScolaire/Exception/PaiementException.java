package com.example.GestionScolaire.Exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;

@Getter
public class PaiementException extends RuntimeException {

    private final HttpStatus status;
    private final LocalDateTime timestamp;

    public PaiementException(String message, HttpStatus status) {
        super(message);
        this.status = status;
        this.timestamp = LocalDateTime.now();
    }

    public static PaiementException notFound(String message) {
        return new PaiementException(message, HttpStatus.NOT_FOUND);
    }

    public static PaiementException badRequest(String message) {
        return new PaiementException(message, HttpStatus.BAD_REQUEST);
    }

    public static PaiementException conflict(String message) {
        return new PaiementException(message, HttpStatus.CONFLICT);
    }

    public static PaiementException forbidden(String message) {
        return new PaiementException(message, HttpStatus.FORBIDDEN);
    }
}