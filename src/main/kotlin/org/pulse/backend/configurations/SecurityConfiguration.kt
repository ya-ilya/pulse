package org.pulse.backend.configurations

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.pulse.backend.services.AuthenticationService
import org.pulse.backend.services.UserService
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.authentication.AuthenticationProvider
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.annotation.web.configurers.CorsConfigurer
import org.springframework.security.config.annotation.web.configurers.CsrfConfigurer
import org.springframework.security.config.annotation.web.configurers.SessionManagementConfigurer
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.filter.OncePerRequestFilter


@Configuration
@EnableWebSecurity
@EnableMethodSecurity(jsr250Enabled = true)
class SecurityConfiguration(
    private val userService: UserService,
    private val authenticationService: AuthenticationService,
    private val authenticationProvider: AuthenticationProvider
) {
    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain? {
        http.csrf { obj: CsrfConfigurer<HttpSecurity> -> obj.disable() }
            .cors { cors: CorsConfigurer<HttpSecurity?> ->
                cors.configurationSource {
                    val corsConfiguration = CorsConfiguration()
                    corsConfiguration.setAllowedOriginPatterns(listOf("*"))
                    corsConfiguration.allowedMethods = listOf(
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE",
                        "OPTIONS"
                    )
                    corsConfiguration.allowedHeaders = listOf("*")
                    corsConfiguration.allowCredentials = true
                    corsConfiguration
                }
            }
            .authorizeHttpRequests { request ->
                request
                    .requestMatchers("/api/**").authenticated()
                    .anyRequest().permitAll()
            }
            .sessionManagement { manager: SessionManagementConfigurer<HttpSecurity?> ->
                manager.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            }
            .authenticationProvider(authenticationProvider)
            .addFilterBefore(object : OncePerRequestFilter() {
                override fun doFilterInternal(
                    request: HttpServletRequest,
                    response: HttpServletResponse,
                    filterChain: FilterChain
                ) {
                    val authHeader = request.getHeader(HEADER_NAME)
                    if (authHeader == null || authHeader.isEmpty() || !authHeader.startsWith(BEARER_PREFIX)) {
                        filterChain.doFilter(request, response)
                        return
                    }

                    val jwt = authHeader.substring(BEARER_PREFIX.length)
                    val email = try {
                        authenticationService.extractEmail(jwt)
                    } catch (ex: Exception) {
                        ""
                    }
                    if (email.isNotEmpty() && SecurityContextHolder.getContext().authentication == null) {
                        val user = userService.findUserByEmail(email).get()

                        if (authenticationService.isAccessTokenValid(jwt, user)) {
                            val context = SecurityContextHolder.createEmptyContext()
                            val authToken = UsernamePasswordAuthenticationToken(
                                user,
                                user.password,
                                user.authorities
                            )
                            authToken.details = WebAuthenticationDetailsSource().buildDetails(request)
                            context.authentication = authToken
                            SecurityContextHolder.setContext(context)
                        }
                    }

                    filterChain.doFilter(request, response)
                }
            }, UsernamePasswordAuthenticationFilter::class.java)
        return http.build()
    }

    private companion object {
        const val BEARER_PREFIX = "Bearer "
        const val HEADER_NAME = "Authorization"
    }
}