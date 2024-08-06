import com.github.gradle.node.npm.task.NpmTask

plugins {
	id("org.springframework.boot") version "3.3.2"
	id("io.spring.dependency-management") version "1.1.6"
	id("com.github.node-gradle.node") version "7.0.2"
	kotlin("plugin.jpa") version "1.9.24"
	kotlin("jvm") version "1.9.24"
	kotlin("plugin.spring") version "1.9.24"
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
	implementation("org.jetbrains.kotlin:kotlin-reflect")
	implementation("com.h2database:h2")
	implementation("io.jsonwebtoken:jjwt:0.12.5")
	testImplementation("org.springframework.boot:spring-boot-starter-test")
	testImplementation("org.jetbrains.kotlin:kotlin-test-junit5")
	testRuntimeOnly("org.junit.platform:junit-platform-launcher")
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

tasks.withType<Test> {
	useJUnitPlatform()
}
