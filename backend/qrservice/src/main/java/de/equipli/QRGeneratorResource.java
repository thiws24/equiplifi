package de.equipli;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import net.glxn.qrgen.QRCode;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.graphics.image.LosslessFactory;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.*;
import java.util.logging.Level;
import java.util.logging.Logger;


@ApplicationScoped
@Path("/qr")
public class QRGeneratorResource {
    // Define 1400 dpi and 62mm label size
    private static final float DPI = 1400;
    private static final float LABEL_SIZE_IN_MM = 62.0f;

    private static final Logger LOGGER = Logger.getLogger(QRGeneratorResource.class.getName());

    @ConfigProperty(name = "quarkus.fontPath")
    String fontPath;

    @GET
    @Produces({MediaType.APPLICATION_OCTET_STREAM, "application/pdf", "image/png"})
    public Response generateQR(
            @QueryParam("name") String name,
            @QueryParam("id") String id,
            @HeaderParam("Accept") String acceptHeader)
    {

        if (name == null || id == null || acceptHeader == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Es fehlen benötigte Parameter: Name, ID, oder Accept-Header")
                    .build();
        }

        //Create URN
        try {
            String urn = "urn:de.equipli:item:" + id;
            // Create QR-Code and combine with text
            BufferedImage finalImage = generateQrCodeImage(urn, name);

            //PNG-Format
            if (acceptHeader.contains(MediaType.APPLICATION_OCTET_STREAM) || acceptHeader.contains("image/png")) {
                byte[] pngData = writePng(finalImage);
                return Response.ok(pngData)
                        .header("Content-Disposition", "attachment; filename=\"qrcode.png\"")
                        .header("Cache-Control", "public, max-age=300")
                        .build();
            }
            // PDF-Format
            else if (acceptHeader.contains("application/pdf")) {
                byte[] pdfData = writePdf(finalImage);
                return Response.ok(pdfData)
                        .header("Content-Disposition", "attachment; filename=\"qrcode.pdf\"")
                        .header("Cache-Control", "public, max-age=300")
                        .build();
            } else {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity("Unpassendes Accept-Header. Verwende application/octet-stream, image/png oder application/pdf.")
                        .build();
            }
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Fehler bei der QR-Code-Generierung", e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Während der QR-Code-Generierung ist ein Fehler aufgetreten.")
                    .build();
        }
    }

    private BufferedImage generateQrCodeImage(String urn, String text) throws IOException {
        // Define End-File size in pixels
        int imageSizeInPixels = (int) (LABEL_SIZE_IN_MM / 25.4f * DPI);
        // Define QR-Code size in pixels at % of the total image size
        int qrSize = (int)(imageSizeInPixels * 0.9);
        // Define Font-Size
        int fontSize = imageSizeInPixels / 10;

        try {
            ByteArrayOutputStream qrStream = QRCode.from(urn).withSize(qrSize, qrSize).stream();
            BufferedImage qrImage = ImageIO.read(new ByteArrayInputStream(qrStream.toByteArray()));

            BufferedImage combinedImage = new BufferedImage(imageSizeInPixels, imageSizeInPixels, BufferedImage.TYPE_INT_RGB);
            Graphics2D g = combinedImage.createGraphics();

            // set the background
            g.setColor(Color.WHITE);
            g.fillRect(0, 0, imageSizeInPixels, imageSizeInPixels);

            // draw QR-Code
            int qrX = (imageSizeInPixels - qrSize) / 2; // center QR-Code
            int qrY = 0; // QR-Code on top
            g.drawImage(qrImage, qrX, qrY, null);

            // write Text
            g.setFont(loadFont(fontSize));
            g.setColor(Color.BLACK);
            int textWidth = g.getFontMetrics().stringWidth(text);
            int textX = (imageSizeInPixels - textWidth) / 2; // center Text
            if (textWidth>imageSizeInPixels){ // Text to long for Label --> do not center it to see Text from beginning
                textX = 0;
            }
            g.drawString(text, textX, qrSize);
            g.dispose();
            return combinedImage;

        } catch (IOException e) {
            throw new IOException("Fehler beim Generieren des QR-Codes", e);
        }
    }

    //Create PNG as a byte array
    private byte[] writePng(BufferedImage image) throws IOException {
        ByteArrayOutputStream pngStream = new ByteArrayOutputStream();
        javax.imageio.ImageIO.write(image, "png", pngStream);
        return pngStream.toByteArray();
    }

    //Create PDF as a byte array
    private byte[] writePdf(BufferedImage image) throws IOException {
        PDDocument document = new PDDocument();
        float sizeInPoints = LABEL_SIZE_IN_MM * 2.835f;
        PDPage page = new PDPage(new PDRectangle(sizeInPoints, sizeInPoints));
        document.addPage(page);

        // no additional close needed, because of try-with-resources
        try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
            PDImageXObject pdImage = LosslessFactory.createFromImage(document, image);
            contentStream.drawImage(pdImage, 0, 0, sizeInPoints, sizeInPoints);
        }

        ByteArrayOutputStream pdfStream = new ByteArrayOutputStream();
        document.save(pdfStream);
        document.close();
        return pdfStream.toByteArray();
    }

    // Use PublicSans-SemiBold font
    private Font loadFont(int fontSize) {
        try {
            return Font.createFont(Font.TRUETYPE_FONT, new File(fontPath + "/PublicSans-SemiBold.ttf"))
                    .deriveFont(Font.PLAIN, fontSize); // Font size depending on image size
        } catch (FontFormatException | IOException e) {
            LOGGER.log(Level.SEVERE, "Fehler beim Laden der Schrift", e);
            return new Font("Arial", Font.PLAIN, fontSize);
        }
    }

}
