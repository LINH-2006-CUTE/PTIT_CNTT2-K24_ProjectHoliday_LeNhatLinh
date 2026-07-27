package com.example.restaurant.util;

import java.security.SecureRandom;

public class OtpUtils {
    private static final SecureRandom random = new SecureRandom();

    public static String generateOtp() {
        int number = random.nextInt(900000) + 100000; // Generates number between 100000 and 999999
        return String.valueOf(number);
    }
}
