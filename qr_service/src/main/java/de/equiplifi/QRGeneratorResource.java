package de.equiplifi;

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

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;


@Path("/qr")
public class QRGeneratorResource {

    @Consumes(MediaType.APPLICATION_JSON)
    @POST
    @Produces(MediaType.APPLICATION_OCTET_STREAM)
    public Response generateQR(QRInput qrInput) throws IOException {

        //Generate QR-Code
        File qrCodeDir = new File("src/main/resources/qrCodes");
        if (!qrCodeDir.exists()) {
            boolean dirCreated = qrCodeDir.mkdirs();
            if (!dirCreated) {
                throw new IOException("Failed to create directory: " + qrCodeDir.getAbsolutePath());
            }
        }
        QRCode.from(qrInput.getUrn()).to(ImageType.PNG).writeTo(new FileOutputStream("src/main/resources/qrCodes/qr1.png"));

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

        PDImageXObject pdimage = PDImageXObject.createFromFile("src/main/resources/qrCodes/qr1.png", document);
        PDPageContentStream contentStream = new PDPageContentStream(document, document.getPage(0));
        contentStream.drawImage(pdimage, 0, 0, widthInPoints, heightInPoints);
        contentStream.close();

        //Saving the document
        File qrFile = new File("src/main/resources/qrCodes/qr.pdf");
        document.save(qrFile);

        //Closing the document
        document.close();

        FileInputStream fileInputStream = new FileInputStream(qrFile);

        return Response.ok().entity(fileInputStream).build();
    }
}