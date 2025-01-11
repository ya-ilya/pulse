import com.github.gradle.node.npm.task.NpmTask

plugins {
	id("org.springframework.boot")
	id("io.spring.dependency-management")
	id("com.github.node-gradle.node")
	kotlin("plugin.jpa")
	kotlin("jvm")
	kotlin("plugin.spring")
}

group = "org.pulse"
version = "0.1"

java {
	toolchain {
		languageVersion = JavaLanguageVersion.of(21)
	}
}

repositories {
	mavenCentral()
}

dependencies {
	implementation("org.springframework.boot:spring-boot-starter-data-jpa")
	implementation("org.springframework.boot:spring-boot-starter-security")
	implementation("org.springframework.boot:spring-boot-starter-web")
	implementation("org.springframework.boot:spring-boot-starter-websocket")
	implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:2.4.0")
	implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
	implementation("com.fasterxml.jackson.datatype:jackson-datatype-jsr310")
	implementation("com.mysql:mysql-connector-j:9.1.0")
	implementation("org.jetbrains.kotlin:kotlin-reflect")
	implementation("io.jsonwebtoken:jjwt:0.12.5")
}

kotlin {
	compilerOptions {
		freeCompilerArgs.addAll("-Xjsr305=strict")
	}
}

tasks {
	withType<JavaCompile> {
		dependsOn("copyFrontend")
	}

	register<NpmTask>("buildFrontend") {
		workingDir = file("${project.projectDir}/src/main/frontend")
		args = listOf("run", "build")
	}

	register<Copy>("copyFrontend") {
		from("${project.projectDir}/src/main/frontend/dist/")
		into("${project.layout.buildDirectory.get()}/resources/main/static")
		dependsOn("buildFrontend")
	}
}