FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

COPY . .

RUN mvn clean package -Dmaven.test.skip=true -pl eureka-server -am

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

COPY --from=build /app/eureka-server/target/*.jar app.jar

ENV SERVER_PORT=8761

EXPOSE $SERVER_PORT
ENTRYPOINT ["java", "-jar", "app.jar"]