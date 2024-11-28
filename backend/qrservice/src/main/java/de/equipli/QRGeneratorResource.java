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

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.*;
import java.nio.file.Files;
import java.nio.file.Paths;

@ApplicationScoped
@Path("/qr")
public class QRGeneratorResource {
    // Define 800 dpi and 62mm label size
    private static final float DPI = 800;
    private static final float labelSizeInMM = 62.0f;

    @GET
    @Produces(MediaType.APPLICATION_OCTET_STREAM)
    public Response generateQR(
            @QueryParam("name") String name,
            @QueryParam("id") String id,
            @HeaderParam("Output-Format") String outputFormat)
    {

        if (name == null || id == null || outputFormat == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Es fehlen benötigte Parameter: Name, ID, oder Output-Format")
                    .build();
        }

        //Create URN
        try {
            String urn = "urn:" + name + ":" + id;

            // Create QR-Code and combine with text
            BufferedImage finalImage = generateQrCodeImage(urn, name);

            //PNG-Format
            if ("PNG".equalsIgnoreCase(outputFormat)) {
                byte[] pngData = writePng(finalImage);
                return Response.ok(pngData)
                        .header("Content-Disposition", "attachment; filename=\"qrcode.png\"")
                        .build();
            }
            // PDF-Format
            else if ("PDF".equalsIgnoreCase(outputFormat)) {
                byte[] pdfData = writePdf(finalImage);
                return Response.ok(pdfData)
                        .header("Content-Disposition", "attachment; filename=\"qrcode.pdf\"")
                        .build();
            } else {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity("Unpassendes Output-Format. Verwende PNG oder PDF.")
                        .build();
            }
        } catch (Exception e) {
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Während der QR-Code-Generierung ist ein Fehler aufgetreten.")
                    .build();
        }
    }

    private BufferedImage generateQrCodeImage(String urn, String text) throws IOException {
        // Define End-File size in pixels
        int imageSizeInPixels = (int) (labelSizeInMM / 25.4f * DPI);
        // Define QR-Code size in pixels at 70% of the total image size
        int qrSize = (int)(imageSizeInPixels * 0.7);

        try {
            ByteArrayOutputStream qrStream = QRCode.from(urn).withSize(qrSize, qrSize).stream();
            BufferedImage qrImage = ImageIO.read(new ByteArrayInputStream(qrStream.toByteArray()));

            int qrWidth = qrImage.getWidth();
            int qrHeight = qrImage.getHeight();
            System.out.println("QR-Code Size: " + qrSize + "QR-Code Width: " + qrWidth + " QR-Code Height: " + qrHeight);

            Graphics2D g = qrImage.createGraphics();
            g.setFont(new Font("Arial", Font.PLAIN, imageSizeInPixels / 20)); // Font size depending on image size
            FontMetrics metrics = g.getFontMetrics();
            int textHeight = metrics.getHeight(); // Height of the text in pixels
            g.dispose();

            int totalHeight = qrHeight + textHeight;
            int imageWidth = imageSizeInPixels;
            int imageHeight = totalHeight;
            System.out.println("Image Width: " + imageWidth + " Image Height: " + imageHeight);

            BufferedImage combinedImage = new BufferedImage(imageWidth, imageHeight, BufferedImage.TYPE_INT_RGB);
            g = combinedImage.createGraphics();

            // set the background
            g.setColor(Color.WHITE);
            g.fillRect(0, 0, imageWidth, imageHeight);

            // draw QR-Code
            int qrX = (imageWidth - qrWidth) / 2; // center QR-Code
            int qrY = 0; // QR-Code on top
            g.drawImage(qrImage, qrX, qrY, null);

            // write Text
            g.setFont(new Font("Arial", Font.PLAIN, imageSizeInPixels / 20)); // Font size depending on image size
            g.setColor(Color.BLACK);
            int textWidth = metrics.stringWidth(text);
            int textX = (imageWidth - textWidth) / 2; // center Text
            int textY = qrHeight + (textHeight / 2); // center Text
            g.drawString(text, textX, textY);

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
        // noch zu löschen
        Files.write(Paths.get("src/main/resources/qrCodes/qr.png"), pngStream.toByteArray());
        return pngStream.toByteArray();
    }

    //Create PDF as a byte array
    private byte[] writePdf(BufferedImage image) throws IOException {
        PDDocument document = new PDDocument();
        float widthInPoints = labelSizeInMM / 25.4f * DPI * 72;
        float heightInPoints = widthInPoints; // Square PDF
        PDPage page = new PDPage(new PDRectangle(widthInPoints, heightInPoints));
        document.addPage(page);

        PDPageContentStream contentStream = new PDPageContentStream(document, page);
        contentStream.drawImage(
                //Lossless image
                LosslessFactory.createFromImage(document, image),
                0,
                0,
                widthInPoints,
                heightInPoints
        );

        contentStream.close();
        ByteArrayOutputStream pdfStream = new ByteArrayOutputStream();
        document.save(pdfStream);
        document.close();

        // noch zu löschen
        Files.write(Paths.get("src/main/resources/qrCodes/qr.pdf"), pdfStream.toByteArray());
        return pdfStream.toByteArray();
    }

}
