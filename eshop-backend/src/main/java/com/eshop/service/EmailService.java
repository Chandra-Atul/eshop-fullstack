package com.eshop.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    public void sendEmail(String to, String subject, String messageText) {
        if (mailSender == null) {
            System.out.println("Email mock sent to: " + to + " | Subject: " + subject);
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(messageText);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Email send failed: " + e.getMessage());
        }
    }
}
