package de.equipli.test;

import io.quarkus.test.common.QuarkusTestResourceLifecycleManager;
import org.testcontainers.containers.GenericContainer;
import java.util.Map;

public class ActiveMQTestResource implements QuarkusTestResourceLifecycleManager {

    private static final String ACTIVEMQ_IMAGE = "apache/activemq-classic:5.18.3";
    private static final int ACTIVEMQ_PORT = 61616;

    private GenericContainer<?> activeMQContainer;

    @Override
    public Map<String, String> start() {
        // Start the ActiveMQ Testcontainer
        activeMQContainer = new GenericContainer<>(ACTIVEMQ_IMAGE)
                .withExposedPorts(ACTIVEMQ_PORT);

        activeMQContainer.start();

        // Return configuration properties
        return Map.of(
                "camel.component.activemq.brokerURL", "tcp://" + activeMQContainer.getHost() + ":" + activeMQContainer.getMappedPort(ACTIVEMQ_PORT)
        );
    }

    @Override
    public void stop() {
        if (activeMQContainer != null) {
            activeMQContainer.stop();
        }
    }
}

