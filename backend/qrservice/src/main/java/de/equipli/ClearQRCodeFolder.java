package de.equipli;

import io.quarkus.scheduler.Scheduled;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.GET;

import java.io.IOException;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;


//Clear QR-Code-Folder in Prod-Mode each day
@jakarta.ws.rs.Path("/clear")
@ApplicationScoped
public class ClearQRCodeFolder {

    private static final String PROD_PNG_PATH = "/srv/qrdata/qrCodes/qrCodesPNG";
    private static final String PROD_PDF_PATH = "/srv/qrdata/qrCodes/qrCodesPDF";

    //@Scheduled(cron = "0 0 0 * * ?") //public weg
    @GET
    public void clearQRCodes() throws IOException {
        clearDirectory(Paths.get(PROD_PNG_PATH));
        clearDirectory(Paths.get(PROD_PDF_PATH));
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
