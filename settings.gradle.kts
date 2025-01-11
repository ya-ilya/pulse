rootProject.name = "pulse"

pluginManagement {
    val kotlinVersion: String by settings
    val springBootVersion: String by settings
    val springDMVersion: String by settings
    val nodeGradleVersion: String by settings

    repositories {
        mavenCentral()
        gradlePluginPortal()
    }

    plugins {
        kotlin("jvm") version kotlinVersion
        kotlin("plugin.jpa") version kotlinVersion
        kotlin("plugin.spring") version kotlinVersion
        id("org.springframework.boot") version springBootVersion
        id("io.spring.dependency-management") version springDMVersion
        id("com.github.node-gradle.node") version nodeGradleVersion
    }
}