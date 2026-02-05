package com.lifeevent.lid.common.exception;

import com.lifeevent.lid.auth.dto.ForgotPasswordRequest;
import jakarta.validation.Valid;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class GlobalExceptionHandlerTest {

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        LocalValidatorFactoryBean validator = new LocalValidatorFactoryBean();
        validator.afterPropertiesSet();

        this.mockMvc = MockMvcBuilders
                .standaloneSetup(new TestController())
                .setControllerAdvice(new GlobalExceptionHandler())
                .setMessageConverters(new MappingJackson2HttpMessageConverter())
                .setValidator(validator)
                .build();
    }

    @Test
    void invalidRequestBodyValidation_returns400() throws Exception {
        mockMvc.perform(
                        post("/test/forgot")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"email\":\"not-an-email\"}")
                )
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorCode").value("BAD_REQUEST"));
    }

    @Test
    void malformedJson_returns400() throws Exception {
        mockMvc.perform(
                        post("/test/forgot")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"email\":\"john@demo.com\"")
                )
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorCode").value("BAD_REQUEST"));
    }

    @Test
    void illegalArgumentException_returns400() throws Exception {
        mockMvc.perform(post("/test/illegal"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorCode").value("BAD_REQUEST"))
                .andExpect(jsonPath("$.errorMessage").value("Code invalide"));
    }

    @RestController
    @RequestMapping("/test")
    static class TestController {

        @PostMapping("/forgot")
        void forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        }

        @PostMapping("/illegal")
        void illegal() {
            throw new IllegalArgumentException("Code invalide");
        }
    }
}

