package de.equipli.test;

import io.quarkus.test.common.QuarkusTestResourceLifecycleManager;
import org.testcontainers.containers.GenericContainer;
import java.util.Map;

public class SMTP4DevTestResource implements QuarkusTestResourceLifecycleManager {

    private static final String IMAGE = "rnwood/smtp4dev:3.5.0";
    private static final int PORT_SMTP = 25;

    private GenericContainer<?> smtpContainer;

    @Override
    public Map<String, String> start() {
        // Start the ActiveMQ Testcontainer
        smtpContainer = new GenericContainer<>(IMAGE)
                .withExposedPorts(PORT_SMTP);

        smtpContainer.start();

        // Return configuration properties
        return Map.of(
                "smtp.config.port", smtpContainer.getMappedPort(PORT_SMTP) + "",
                "smtp.config.host", smtpContainer.getHost()
        );
    }

    @Override
    public void stop() {
        if (smtpContainer != null) {
            smtpContainer.stop();
        }
    }

}
