package de.equipli;

import io.quarkus.scheduler.Scheduled;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.GET;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.io.IOException;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;


//Clear QR-Code-Folder in Prod-Mode each day at 23:00 Local Time or 00:00 Server Time
@jakarta.ws.rs.Path("/qr/clear")
@ApplicationScoped
public class ClearQRCodeFolder {

    @ConfigProperty(name = "qrservice.prod.png.path")
    String prodPngPath;

    @ConfigProperty(name = "qrservice.prod.pdf.path")
    String prodPdfPath;

    @Scheduled(cron = "0 0 23 * * ?") //clearing at 23:00 Local Time or 00:00 Server Time
    @GET
    public void clearQRCodes() throws IOException {
        clearDirectory(Paths.get(prodPngPath));
        clearDirectory(Paths.get(prodPdfPath));
    }

    private void clearDirectory(Path path) throws IOException {
        if (Files.exists(path) && Files.isDirectory(path)) {
            try (DirectoryStream<Path> directoryStream = Files.newDirectoryStream(path)) {
                for (Path filePath : directoryStream) {
                    Files.delete(filePath);
                }
            }
        }
    }
}
