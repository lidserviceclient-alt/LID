package com.lifeevent.lid.backoffice.log.service.impl;

import com.lifeevent.lid.backoffice.log.dto.BackOfficeLogEntryDto;
import com.lifeevent.lid.backoffice.log.dto.BackOfficeLogPageDto;
import com.lifeevent.lid.backoffice.log.dto.BackOfficeLogPurgeResultDto;
import com.lifeevent.lid.backoffice.log.service.BackOfficeLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.RandomAccessFile;
import java.nio.charset.StandardCharsets;
import java.nio.file.AtomicMoveNotSupportedException;
import java.nio.file.FileVisitOption;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.nio.file.StandardOpenOption;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
@Slf4j
@RequiredArgsConstructor
public class BackOfficeLogServiceImpl implements BackOfficeLogService {

    @Value("${config.logs.admin.file-path:${logging.file.name:logs/lid.log}}")
    private String logFilePath;

    @Value("${config.logs.admin.max-read-bytes:2097152}")
    private long maxReadBytes;

    @Value("${config.logs.admin.include-archives-read:false}")
    private boolean includeArchivesRead;

    @Value("${config.logs.admin.max-raw-chars:2000}")
    private int maxRawChars;

    private final Object ioLock = new Object();

    @Override
    public BackOfficeLogPageDto list(int page, int size, String from, String to, String level, String logger, String q) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.max(1, Math.min(size, 500));
        int requested = safePage * safeSize;
        int wanted = Math.min(Integer.MAX_VALUE - 1, requested + safeSize + 1); // +1 to detect hasMore

        LocalDateTime fromDt = parseDateTime(from);
        LocalDateTime toDt = parseDateTime(to);
        String levelNorm = normalize(level);
        String loggerNorm = normalize(logger);
        String qNorm = normalize(q);

        List<BackOfficeLogEntryDto> matched = new ArrayList<>(Math.min(wanted, 1024));

        synchronized (ioLock) {
            for (Path file : resolveReadFiles(resolveMainLogPath())) {
                try {
                    TailChunk tail = readTailChunk(file, maxReadBytes);
                    collectMatchesFromTail(tail, fromDt, toDt, levelNorm, loggerNorm, qNorm, matched, wanted);
                    if (matched.size() >= wanted) {
                        break;
                    }
                } catch (Exception ex) {
                    log.warn("Failed to read log file {}: {}", file, ex.getMessage());
                }
            }
        }

        boolean hasMore = matched.size() > requested + safeSize - 1;
        int end = Math.min(matched.size(), requested + safeSize);
        List<BackOfficeLogEntryDto> pageItems = requested >= matched.size()
                ? List.of()
                : List.copyOf(matched.subList(requested, end));

        return BackOfficeLogPageDto.builder()
                .page(safePage)
                .size(safeSize)
                .total(matched.size())
                .hasMore(hasMore)
                .items(pageItems)
                .build();
    }

    @Override
    public BackOfficeLogPurgeResultDto purge(String before) {
        LocalDateTime cutoff = parseDateTime(before);
        synchronized (ioLock) {
            if (cutoff == null) {
                return purgeAll();
            }
            return purgeBefore(cutoff);
        }
    }

    private void collectMatchesFromTail(
            TailChunk tail,
            LocalDateTime fromDt,
            LocalDateTime toDt,
            String levelNorm,
            String loggerNorm,
            String qNorm,
            List<BackOfficeLogEntryDto> out,
            int wanted
    ) {
        if (tail == null || tail.bytes == null || tail.bytes.length == 0 || wanted <= 0) {
            return;
        }
        List<String> blockReversed = new ArrayList<>(32);

        byte[] data = tail.bytes;
        int min = Math.max(0, tail.validStartIndex);
        int lineEnd = data.length - 1;

        for (int i = data.length - 1; i >= min; i--) {
            if (data[i] != '\n') {
                continue;
            }

            if (lineEnd >= i + 1) {
                String line = decodeLine(data, i + 1, lineEnd);
                if (line != null) {
                    blockReversed.add(line);
                    if (isLikelyHeaderLine(line)) {
                        if (emitIfMatched(blockReversed, fromDt, toDt, levelNorm, loggerNorm, qNorm, out, wanted)) {
                            return;
                        }
                        blockReversed.clear();
                    }
                }
            }
            lineEnd = i - 1;
        }

        if (lineEnd >= min) {
            String line = decodeLine(data, min, lineEnd);
            if (line != null) {
                blockReversed.add(line);
                if (isLikelyHeaderLine(line)) {
                    emitIfMatched(blockReversed, fromDt, toDt, levelNorm, loggerNorm, qNorm, out, wanted);
                }
            }
        }
    }

    private boolean emitIfMatched(
            List<String> blockReversed,
            LocalDateTime fromDt,
            LocalDateTime toDt,
            String levelNorm,
            String loggerNorm,
            String qNorm,
            List<BackOfficeLogEntryDto> out,
            int wanted
    ) {
        ParsedLogEntry entry = parseReversedBlock(blockReversed);
        if (entry == null) {
            return false;
        }
        if (!matches(entry, fromDt, toDt, levelNorm, loggerNorm, qNorm)) {
            return false;
        }
        out.add(entry.toDto(maxRawChars));
        return out.size() >= wanted;
    }

    private boolean matches(
            ParsedLogEntry entry,
            LocalDateTime fromDt,
            LocalDateTime toDt,
            String levelNorm,
            String loggerNorm,
            String qNorm
    ) {
        if (entry.timestamp == null) {
            return false;
        }
        if (fromDt != null && entry.timestamp.isBefore(fromDt)) {
            return false;
        }
        if (toDt != null && entry.timestamp.isAfter(toDt)) {
            return false;
        }
        if (levelNorm != null && !levelNorm.equalsIgnoreCase(entry.level)) {
            return false;
        }
        if (loggerNorm != null && !containsIgnoreCase(entry.logger, loggerNorm) && !containsIgnoreCase(entry.raw, loggerNorm)) {
            return false;
        }
        return qNorm == null || containsIgnoreCase(entry.message, qNorm) || containsIgnoreCase(entry.raw, qNorm);
    }

    private BackOfficeLogPurgeResultDto purgeAll() {
        Path main = resolveMainLogPath();
        List<Path> managedFiles = resolveManagedFiles(main);

        long freedBytes = 0;
        long filesDeleted = 0;
        long filesTouched = 0;

        for (Path file : managedFiles) {
            try {
                long size = safeSize(file);
                if (file.equals(main)) {
                    filesTouched++;
                    ensureParentDir(file);
                    Files.writeString(file, "", StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING, StandardOpenOption.WRITE);
                    freedBytes += size;
                } else {
                    filesTouched++;
                    Files.deleteIfExists(file);
                    filesDeleted++;
                    freedBytes += size;
                }
            } catch (Exception ex) {
                log.warn("Log purge all failed for file={}: {}", file, ex.getMessage());
            }
        }

        return BackOfficeLogPurgeResultDto.builder()
                .mode("all")
                .filesTouched(filesTouched)
                .filesDeleted(filesDeleted)
                .freedBytes(freedBytes)
                .remainingBytes(safeSize(main))
                .build();
    }

    private BackOfficeLogPurgeResultDto purgeBefore(LocalDateTime cutoff) {
        Path main = resolveMainLogPath();
        List<Path> managedFiles = resolveManagedFiles(main);

        long freedBytes = 0;
        long filesDeleted = 0;
        long filesTouched = 0;

        for (Path file : managedFiles) {
            try {
                if (file.toString().endsWith(".gz")) {
                    if (toLocalDateTime(Files.getLastModifiedTime(file).toInstant()).isBefore(cutoff)) {
                        long size = safeSize(file);
                        Files.deleteIfExists(file);
                        filesDeleted++;
                        filesTouched++;
                        freedBytes += size;
                    }
                    continue;
                }

                long beforeSize = safeSize(file);
                filesTouched++;
                rewriteTextLogKeepingOnlyRecent(file, cutoff);
                long afterSize = safeSize(file);
                freedBytes += Math.max(0, beforeSize - afterSize);
            } catch (Exception ex) {
                log.warn("Log purge before failed for file={}: {}", file, ex.getMessage());
            }
        }

        return BackOfficeLogPurgeResultDto.builder()
                .mode("before")
                .filesTouched(filesTouched)
                .filesDeleted(filesDeleted)
                .freedBytes(freedBytes)
                .remainingBytes(safeSize(main))
                .build();
    }

    private void rewriteTextLogKeepingOnlyRecent(Path file, LocalDateTime cutoff) throws IOException {
        ensureParentDir(file);
        if (!Files.exists(file)) {
            Files.writeString(file, "", StandardOpenOption.CREATE, StandardOpenOption.WRITE);
            return;
        }

        Path tmp = file.resolveSibling(file.getFileName() + ".tmp");
        try (BufferedReader reader = Files.newBufferedReader(file, StandardCharsets.UTF_8);
             BufferedWriter writer = Files.newBufferedWriter(
                     tmp,
                     StandardCharsets.UTF_8,
                     StandardOpenOption.CREATE,
                     StandardOpenOption.TRUNCATE_EXISTING,
                     StandardOpenOption.WRITE
             )) {

            List<String> currentBlock = new ArrayList<>(32);
            LocalDateTime blockTs = null;
            String line;

            while ((line = reader.readLine()) != null) {
                if (isLikelyHeaderLine(line)) {
                    flushBlock(writer, currentBlock, blockTs, cutoff);
                    currentBlock.clear();
                    currentBlock.add(line);
                    HeaderParts hp = parseHeader(line);
                    blockTs = hp == null ? null : hp.timestamp;
                    continue;
                }

                if (currentBlock.isEmpty()) {
                    writer.write(line);
                    writer.newLine();
                } else {
                    currentBlock.add(line);
                }
            }
            flushBlock(writer, currentBlock, blockTs, cutoff);
        }

        moveReplace(tmp, file);
    }

    private void flushBlock(BufferedWriter writer, List<String> block, LocalDateTime ts, LocalDateTime cutoff) throws IOException {
        if (block.isEmpty()) {
            return;
        }
        boolean keep = ts == null || !ts.isBefore(cutoff);
        if (!keep) {
            return;
        }
        for (String l : block) {
            writer.write(l);
            writer.newLine();
        }
    }

    private void moveReplace(Path source, Path target) throws IOException {
        try {
            Files.move(source, target, StandardCopyOption.REPLACE_EXISTING, StandardCopyOption.ATOMIC_MOVE);
        } catch (AtomicMoveNotSupportedException ex) {
            Files.move(source, target, StandardCopyOption.REPLACE_EXISTING);
        }
    }

    private TailChunk readTailChunk(Path file, long maxBytes) throws IOException {
        if (file == null || !Files.exists(file) || !Files.isRegularFile(file)) {
            return new TailChunk(new byte[0], 0);
        }
        long length = Files.size(file);
        if (length <= 0) {
            return new TailChunk(new byte[0], 0);
        }

        long safeMax = Math.max(8_192, Math.min(maxBytes, 16L * 1024L * 1024L));
        int bytesToRead = (int) Math.min(length, safeMax);
        long start = length - bytesToRead;

        byte[] buffer = new byte[bytesToRead];
        try (RandomAccessFile raf = new RandomAccessFile(file.toFile(), "r")) {
            raf.seek(start);
            raf.readFully(buffer);
        }

        int validStart = 0;
        if (start > 0) {
            for (int i = 0; i < buffer.length; i++) {
                if (buffer[i] == '\n') {
                    validStart = i + 1;
                    break;
                }
            }
        }
        return new TailChunk(buffer, validStart);
    }

    private ParsedLogEntry parseReversedBlock(List<String> blockReversed) {
        if (blockReversed == null || blockReversed.isEmpty()) {
            return null;
        }

        String header = blockReversed.get(blockReversed.size() - 1);
        HeaderParts parts = parseHeader(header);
        if (parts == null || parts.timestamp == null || parts.level == null) {
            return null;
        }

        StringBuilder raw = new StringBuilder(Math.min(4_096, Math.max(256, blockReversed.size() * 64)));
        for (int i = blockReversed.size() - 1; i >= 0; i--) {
            raw.append(blockReversed.get(i));
            if (i > 0) {
                raw.append(System.lineSeparator());
            }
        }

        String msg = extractMessage(header);
        return new ParsedLogEntry(parts.timestamp, parts.level, parts.logger, msg, raw.toString());
    }

    private HeaderParts parseHeader(String line) {
        if (!isLikelyHeaderLine(line)) {
            return null;
        }

        int firstSpace = line.indexOf(' ');
        if (firstSpace <= 0 || firstSpace + 1 >= line.length()) {
            return null;
        }

        String tsRaw = line.substring(0, firstSpace).trim();
        LocalDateTime ts = parseDateTime(tsRaw);
        if (ts == null) {
            return null;
        }

        int secondSpace = line.indexOf(' ', firstSpace + 1);
        if (secondSpace <= firstSpace + 1) {
            return null;
        }

        String level = line.substring(firstSpace + 1, secondSpace).trim().toUpperCase(Locale.ROOT);
        if (!isKnownLevel(level)) {
            return null;
        }

        String trailing = secondSpace + 1 < line.length() ? line.substring(secondSpace + 1).trim() : "";
        String logger = extractLogger(trailing);
        return new HeaderParts(ts, level, logger);
    }

    private boolean isLikelyHeaderLine(String line) {
        if (line == null || line.length() < 30) {
            return false;
        }
        if (line.charAt(0) != '2') {
            return false;
        }
        if (!Character.isDigit(line.charAt(1)) || !Character.isDigit(line.charAt(2)) || !Character.isDigit(line.charAt(3))) {
            return false;
        }
        return line.charAt(4) == '-' && line.charAt(7) == '-' && line.indexOf('T') > 9;
    }

    private boolean isKnownLevel(String level) {
        return "TRACE".equals(level)
                || "DEBUG".equals(level)
                || "INFO".equals(level)
                || "WARN".equals(level)
                || "ERROR".equals(level);
    }

    private String extractLogger(String trailing) {
        if (trailing == null || trailing.isBlank()) {
            return "unknown";
        }
        int idx = trailing.indexOf(':');
        if (idx <= 0) {
            return "unknown";
        }
        String before = trailing.substring(0, idx).trim();
        int spaceIdx = before.lastIndexOf(' ');
        if (spaceIdx >= 0 && spaceIdx + 1 < before.length()) {
            return before.substring(spaceIdx + 1).trim();
        }
        return before;
    }

    private String extractMessage(String firstLine) {
        if (firstLine == null || firstLine.isBlank()) {
            return "";
        }
        int idx = firstLine.indexOf(" : ");
        if (idx >= 0 && idx + 3 < firstLine.length()) {
            return firstLine.substring(idx + 3).trim();
        }
        return firstLine;
    }

    private String decodeLine(byte[] data, int fromInclusive, int toInclusive) {
        if (fromInclusive > toInclusive) {
            return "";
        }
        int len = (toInclusive - fromInclusive) + 1;
        String line = new String(data, fromInclusive, len, StandardCharsets.UTF_8);
        int end = line.length();
        while (end > 0 && (line.charAt(end - 1) == '\r' || line.charAt(end - 1) == '\n')) {
            end--;
        }
        if (end == line.length()) {
            return line;
        }
        return end <= 0 ? "" : line.substring(0, end);
    }

    private List<Path> resolveReadFiles(Path main) {
        if (!includeArchivesRead) {
            return List.of(main);
        }
        return resolveManagedFiles(main);
    }

    private List<Path> resolveManagedFiles(Path main) {
        List<Path> files = new ArrayList<>();
        files.add(main);

        Path parent = main.getParent() == null ? Paths.get(".") : main.getParent();
        String base = main.getFileName().toString();
        String prefix = base + ".";

        if (!Files.exists(parent) || !Files.isDirectory(parent)) {
            return files;
        }

        try (var walk = Files.walk(parent, 1, FileVisitOption.FOLLOW_LINKS)) {
            walk.filter(Files::isRegularFile)
                    .filter(p -> {
                        String fn = p.getFileName().toString();
                        return fn.equals(base) || fn.startsWith(prefix);
                    })
                    .sorted((a, b) -> b.getFileName().toString().compareTo(a.getFileName().toString()))
                    .forEach(files::add);
        } catch (Exception ex) {
            log.warn("Unable to discover managed log files under {}: {}", parent, ex.getMessage());
        }

        return files.stream().distinct().toList();
    }

    private Path resolveMainLogPath() {
        if (logFilePath == null || logFilePath.isBlank()) {
            return Paths.get("logs", "lid.log");
        }
        return Paths.get(logFilePath);
    }

    private void ensureParentDir(Path file) throws IOException {
        Path parent = file.getParent();
        if (parent != null && !Files.exists(parent)) {
            Files.createDirectories(parent);
        }
    }

    private long safeSize(Path file) {
        try {
            return Files.exists(file) ? Files.size(file) : 0L;
        } catch (Exception ex) {
            return 0L;
        }
    }

    private boolean containsIgnoreCase(String value, String token) {
        if (token == null) {
            return true;
        }
        return value != null && value.toLowerCase(Locale.ROOT).contains(token);
    }

    private String normalize(String value) {
        if (value == null) {
            return null;
        }
        String out = value.trim().toLowerCase(Locale.ROOT);
        return out.isEmpty() ? null : out;
    }

    private LocalDateTime parseDateTime(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        String raw = value.trim();
        try {
            return OffsetDateTime.parse(raw).toLocalDateTime();
        } catch (Exception ignored) {
        }
        try {
            return LocalDateTime.parse(raw);
        } catch (Exception ignored) {
        }
        try {
            Instant instant = Instant.parse(raw);
            return LocalDateTime.ofInstant(instant, ZoneId.systemDefault());
        } catch (Exception ignored) {
        }
        try {
            return LocalDateTime.parse(raw, DateTimeFormatter.ISO_DATE_TIME);
        } catch (Exception ignored) {
        }
        return null;
    }

    private LocalDateTime toLocalDateTime(Instant instant) {
        return LocalDateTime.ofInstant(instant, ZoneId.systemDefault());
    }

    private record HeaderParts(LocalDateTime timestamp, String level, String logger) {
    }

    private record ParsedLogEntry(
            LocalDateTime timestamp,
            String level,
            String logger,
            String message,
            String raw
    ) {
        BackOfficeLogEntryDto toDto(int maxRawChars) {
            String safeRaw = raw;
            if (safeRaw != null && maxRawChars > 0 && safeRaw.length() > maxRawChars) {
                safeRaw = safeRaw.substring(0, maxRawChars) + "...[truncated]";
            }
            return BackOfficeLogEntryDto.builder()
                    .timestamp(timestamp)
                    .level(level)
                    .logger(logger)
                    .message(message)
                    .raw(safeRaw)
                    .build();
        }
    }

    private record TailChunk(byte[] bytes, int validStartIndex) {
    }
}
