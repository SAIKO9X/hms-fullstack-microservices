FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY . .
RUN mvn clean install -Dmaven.test.skip=true -pl common-lib -am
RUN mvn clean package -Dmaven.test.skip=true -pl media -am

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

COPY --from=build /app/media/target/*.jar app.jar
ENV SERVER_PORT=8085

EXPOSE $SERVER_PORT
ENTRYPOINT ["java", "-jar", "app.jar"]