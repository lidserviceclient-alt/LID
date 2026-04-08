package com.lifeevent.lid.common.service.impl;

import com.lifeevent.lid.common.dto.ProcessedImageFile;
import com.lifeevent.lid.common.service.ImageProcessingService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageOutputStream;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Iterator;
import java.util.Locale;

@Service
public class ImageProcessingServiceImpl implements ImageProcessingService {

    @Value("${storage.images.max-upload-bytes:10485760}")
    private long maxUploadBytes;

    @Value("${storage.images.max-dimension:1920}")
    private int maxDimension;

    @Value("${storage.images.jpeg-quality:0.82}")
    private float jpegQuality;

    @Override
    public ProcessedImageFile compress(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Fichier image manquant.");
        }
        if (file.getSize() > maxUploadBytes) {
            throw new IllegalArgumentException("Image trop lourde.");
        }

        BufferedImage input = readImage(file);
        BufferedImage resized = resizeIfNeeded(input);
        boolean alpha = resized.getColorModel().hasAlpha();
        String format = alpha ? "png" : "jpg";
        String contentType = alpha ? MediaType.IMAGE_PNG_VALUE : MediaType.IMAGE_JPEG_VALUE;
        byte[] bytes = writeImage(resized, format);
        return new ProcessedImageFile(bytes, withExtension(file.getOriginalFilename(), format), contentType, file.getSize());
    }

    private BufferedImage readImage(MultipartFile file) {
        String contentType = file.getContentType() == null ? "" : file.getContentType().toLowerCase(Locale.ROOT);
        if (!contentType.isBlank() && !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Le fichier doit être une image.");
        }
        try {
            BufferedImage image = ImageIO.read(file.getInputStream());
            if (image == null) {
                throw new IllegalArgumentException("Format d'image non supporté.");
            }
            return image;
        } catch (IOException ex) {
            throw new IllegalArgumentException("Lecture de l'image impossible.", ex);
        }
    }

    private BufferedImage resizeIfNeeded(BufferedImage source) {
        int width = source.getWidth();
        int height = source.getHeight();
        int limit = Math.max(1, maxDimension);
        if (width <= limit && height <= limit) {
            return source;
        }

        double ratio = Math.min((double) limit / width, (double) limit / height);
        int nextWidth = Math.max(1, (int) Math.round(width * ratio));
        int nextHeight = Math.max(1, (int) Math.round(height * ratio));
        BufferedImage target = new BufferedImage(nextWidth, nextHeight,
                source.getColorModel().hasAlpha() ? BufferedImage.TYPE_INT_ARGB : BufferedImage.TYPE_INT_RGB);
        Graphics2D graphics = target.createGraphics();
        try {
            graphics.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
            graphics.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
            graphics.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            graphics.drawImage(source, 0, 0, nextWidth, nextHeight, null);
        } finally {
            graphics.dispose();
        }
        return target;
    }

    private byte[] writeImage(BufferedImage image, String format) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            if ("jpg".equals(format)) {
                writeJpeg(toRgb(image), out);
            } else {
                ImageIO.write(image, format, out);
            }
            return out.toByteArray();
        } catch (IOException ex) {
            throw new IllegalStateException("Compression de l'image impossible.", ex);
        }
    }

    private BufferedImage toRgb(BufferedImage source) {
        if (source.getType() == BufferedImage.TYPE_INT_RGB) {
            return source;
        }
        BufferedImage target = new BufferedImage(source.getWidth(), source.getHeight(), BufferedImage.TYPE_INT_RGB);
        Graphics2D graphics = target.createGraphics();
        try {
            graphics.drawImage(source, 0, 0, null);
        } finally {
            graphics.dispose();
        }
        return target;
    }

    private void writeJpeg(BufferedImage image, ByteArrayOutputStream out) throws IOException {
        Iterator<ImageWriter> writers = ImageIO.getImageWritersByFormatName("jpg");
        if (!writers.hasNext()) {
            ImageIO.write(image, "jpg", out);
            return;
        }
        ImageWriter writer = writers.next();
        try (ImageOutputStream imageOut = ImageIO.createImageOutputStream(out)) {
            writer.setOutput(imageOut);
            ImageWriteParam param = writer.getDefaultWriteParam();
            if (param.canWriteCompressed()) {
                param.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
                param.setCompressionQuality(Math.max(0.1f, Math.min(1f, jpegQuality)));
            }
            writer.write(null, new IIOImage(image, null, null), param);
        } finally {
            writer.dispose();
        }
    }

    private String withExtension(String originalFilename, String extension) {
        String base = originalFilename == null || originalFilename.isBlank() ? "image" : originalFilename.trim();
        int dot = base.lastIndexOf('.');
        if (dot > 0) {
            base = base.substring(0, dot);
        }
        return base + "." + extension;
    }
}
