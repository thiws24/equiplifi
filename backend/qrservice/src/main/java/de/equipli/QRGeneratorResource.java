package de.equipli;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import net.glxn.qrgen.QRCode;
import net.glxn.qrgen.image.ImageType;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.UUID;

@ApplicationScoped
@Path("/qr")
public class QRGeneratorResource {

    @Inject
    @ConfigProperty(name = "quarkus.profile")
    String activeProfile;
    private static final String DEV_PNG_PATH = "src/main/resources/qrCodes/qrCodesPNG";
    private static final String DEV_PDF_PATH = "src/main/resources/qrCodes/qrCodesPDF";
    private static final String PROD_PNG_PATH = "/srv/qrdata/qrCodes/qrCodesPNG";
    private static final String PROD_PDF_PATH = "/srv/qrdata/qrCodes/qrCodesPDF";

    @Consumes(MediaType.APPLICATION_JSON)
    @POST
    @Produces(MediaType.APPLICATION_OCTET_STREAM)
    public Response generateQR(QRInput qrInput) throws IOException {

        //Generate QR-Code
        createDirectoryIfNotExists(DEV_PNG_PATH);
        createDirectoryIfNotExists(DEV_PDF_PATH);
        createDirectoryIfNotExists(PROD_PNG_PATH);
        createDirectoryIfNotExists(PROD_PDF_PATH);

        String basePngPath = isProdProfile() ? PROD_PNG_PATH : DEV_PNG_PATH;
        String basePdfPath = isProdProfile() ? PROD_PDF_PATH : DEV_PDF_PATH;

        String uuid = UUID.randomUUID().toString();
        String qrCodePngFilePath = basePngPath + "/qr_" + uuid + ".png";
        String qrCodePdfFilePath = basePdfPath + "/qr_" + uuid + ".pdf";

        QRCode.from(qrInput.getUrn()).to(ImageType.PNG).writeTo(new FileOutputStream(qrCodePngFilePath));

        //Creating PDF document object
        // Define page dimensions in centimeters
        double widthInMM = 64;
        double heightInMM = 64;
        float widthInPoints = (float) (widthInMM / 25.4 * 72);
        float heightInPoints = (float) (heightInMM / 25.4 * 72);

        // Create a new PDPage with custom dimensions
        PDPage page = new PDPage(new PDRectangle(widthInPoints, heightInPoints));

        // Add the custom page to the document
        PDDocument document = new PDDocument();
        document.addPage(page);

        PDImageXObject pdimage = PDImageXObject.createFromFile(qrCodePngFilePath, document);
        PDPageContentStream contentStream = new PDPageContentStream(document, document.getPage(0));
        contentStream.drawImage(pdimage, 0, 0, widthInPoints, heightInPoints);
        contentStream.close();

        //Saving the document
        File qrFile = new File(qrCodePdfFilePath);
        document.save(qrFile);

        //Closing the document
        document.close();

        FileInputStream fileInputStream = new FileInputStream(qrFile);

        return Response.ok().entity(fileInputStream).build();

    }

    private boolean isProdProfile() {
        return "prod".equals(activeProfile);
    }

    private void createDirectoryIfNotExists(String path) throws IOException {
        File dir = new File(path);
        if (!dir.exists()) {
            boolean dirCreated = dir.mkdirs();
            if (!dirCreated) {
                throw new IOException("Failed to create directory: " + dir.getAbsolutePath());
            }
        }
    }
}