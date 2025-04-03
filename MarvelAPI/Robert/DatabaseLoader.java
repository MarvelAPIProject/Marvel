package com.marvel;
import java.io.File;
import java.sql.Connection;
import java.sql.Date;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.text.SimpleDateFormat;
import java.util.Properties;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;

public class DatabaseLoader {

    private final String dbUrl;
    private final String dbUsername;
    private final String dbPassword;

    public DatabaseLoader(Properties config) {
        this.dbUrl = config.getProperty("db.url");
        this.dbUsername = config.getProperty("db.username");
        this.dbPassword = config.getProperty("db.password");
    }

    public void loadData(String xmlFilePath, String dataType) throws Exception {
        File xmlFile = new File(xmlFilePath);
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        DocumentBuilder builder = factory.newDocumentBuilder();
        Document doc = builder.parse(xmlFile);
        doc.getDocumentElement().normalize();

        String elementName = dataType.substring(0, dataType.length() - 1); // singular form
        NodeList itemNodes = doc.getElementsByTagName(elementName);

        try (Connection conn = DriverManager.getConnection(dbUrl, dbUsername, dbPassword)) {
            conn.setAutoCommit(false);
            
            switch (dataType) {
                case "characters":
                    loadCharacters(conn, itemNodes);
                    break;
                case "comics":
                    loadComics(conn, itemNodes);
                    break;
                case "events":
                    loadEvents(conn, itemNodes);
                    break;
                case "series":
                    loadSeries(conn, itemNodes);
                    break;
                default:
                    System.out.println("Unknown data type: " + dataType);
            }
            
            conn.commit();
        } catch (Exception e) {
            System.err.println("Error loading data into database:");
            e.printStackTrace();
            throw e;
        }
    }

    private void loadCharacters(Connection conn, NodeList characterNodes) throws Exception {
        String sql = "INSERT INTO PERSONAJE (id_personaje, nombre, descripcion, URL_imagen) VALUES (?, ?, ?, ?) " +
                     "ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), descripcion = VALUES(descripcion), URL_imagen = VALUES(URL_imagen)";
                     
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            for (int i = 0; i < characterNodes.getLength(); i++) {
                Element character = (Element) characterNodes.item(i);
                
                int id = Integer.parseInt(getElementTextContent(character, "id"));
                String name = getElementTextContent(character, "name");
                String description = getElementTextContent(character, "description");
                String imageUrl = getElementTextContent(character, "thumbnailUrl");

                stmt.setInt(1, id);
                stmt.setString(2, name);
                stmt.setString(3, description);
                stmt.setString(4, imageUrl);
                stmt.addBatch();

                // Execute in batches to improve performance
                if (i % 100 == 0 && i > 0) {
                    stmt.executeBatch();
                }
            }
            stmt.executeBatch();
            System.out.println("Inserted/updated " + characterNodes.getLength() + " characters");
        }
    }

    private void loadComics(Connection conn, NodeList comicNodes) throws Exception {
        String sql = "INSERT INTO COMIC (id_comic, titulo, descripcion, numero_edicion, fecha_publicacion, URL_imagen, id_serie) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?) " +
                     "ON DUPLICATE KEY UPDATE titulo = VALUES(titulo), descripcion = VALUES(descripcion), " +
                     "numero_edicion = VALUES(numero_edicion), fecha_publicacion = VALUES(fecha_publicacion), " +
                     "URL_imagen = VALUES(URL_imagen), id_serie = VALUES(id_serie)";

        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            for (int i = 0; i < comicNodes.getLength(); i++) {
                Element comic = (Element) comicNodes.item(i);
                
                int id = Integer.parseInt(getElementTextContent(comic, "id"));
                String title = getElementTextContent(comic, "title");
                String description = getElementTextContent(comic, "description");
                
                // Handle issue number (may not exist)
                String issueNumberStr = getElementTextContent(comic, "issueNumber");
                int issueNumber = issueNumberStr.isEmpty() ? 0 : Integer.parseInt(issueNumberStr);
                
                // Handle publication date
                String dateStr = getElementTextContent(comic, "onsaleDate");
                Date publicationDate = null;
                if (!dateStr.isEmpty()) {
                    try {
                        SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ssXXX");
                        java.util.Date utilDate = format.parse(dateStr);
                        publicationDate = new Date(utilDate.getTime());
                    } catch (Exception e) {
                        System.err.println("Error parsing date: " + dateStr);
                    }
                }
                
                String imageUrl = getElementTextContent(comic, "thumbnailUrl");
                
                // Handle series ID
                String seriesIdStr = getElementTextContent(comic, "seriesId");
                Integer seriesId = seriesIdStr.isEmpty() ? null : Integer.parseInt(seriesIdStr);

                stmt.setInt(1, id);
                stmt.setString(2, title);
                stmt.setString(3, description);
                stmt.setInt(4, issueNumber);
                
                if (publicationDate != null) {
                    stmt.setDate(5, publicationDate);
                } else {
                    stmt.setNull(5, java.sql.Types.DATE);
                }
                
                stmt.setString(6, imageUrl);
                
                if (seriesId != null) {
                    stmt.setInt(7, seriesId);
                } else {
                    stmt.setNull(7, java.sql.Types.INTEGER);
                }
                
                stmt.addBatch();

                // Execute in batches to improve performance
                if (i % 100 == 0 && i > 0) {
                    stmt.executeBatch();
                }
            }
            stmt.executeBatch();
            System.out.println("Inserted/updated " + comicNodes.getLength() + " comics");
        }
    }

    private void loadEvents(Connection conn, NodeList eventNodes) throws Exception {
        String sql = "INSERT INTO EVENTO (id_evento, nombre, descripcion, fecha_inicio, fecha_fin) " +
                     "VALUES (?, ?, ?, ?, ?) " +
                     "ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), descripcion = VALUES(descripcion), " +
                     "fecha_inicio = VALUES(fecha_inicio), fecha_fin = VALUES(fecha_fin)";

        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            for (int i = 0; i < eventNodes.getLength(); i++) {
                Element event = (Element) eventNodes.item(i);
                
                int id = Integer.parseInt(getElementTextContent(event, "id"));
                String title = getElementTextContent(event, "title");
                String description = getElementTextContent(event, "description");
                
                // Handle start date
                String startDateStr = getElementTextContent(event, "startDate");
                Date startDate = null;
                if (!startDateStr.isEmpty()) {
                    try {
                        SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd");
                        java.util.Date utilDate = format.parse(startDateStr);
                        startDate = new Date(utilDate.getTime());
                    } catch (Exception e) {
                        System.err.println("Error parsing start date: " + startDateStr);
                    }
                }
                
                // Handle end date
                String endDateStr = getElementTextContent(event, "endDate");
                Date endDate = null;
                if (!endDateStr.isEmpty()) {
                    try {
                        SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd");
                        java.util.Date utilDate = format.parse(endDateStr);
                        endDate = new Date(utilDate.getTime());
                    } catch (Exception e) {
                        System.err.println("Error parsing end date: " + endDateStr);
                    }
                }

                stmt.setInt(1, id);
                stmt.setString(2, title);
                stmt.setString(3, description);
                
                if (startDate != null) {
                    stmt.setDate(4, startDate);
                } else {
                    stmt.setNull(4, java.sql.Types.DATE);
                }
                
                if (endDate != null) {
                    stmt.setDate(5, endDate);
                } else {
                    stmt.setNull(5, java.sql.Types.DATE);
                }
                
                stmt.addBatch();

                // Execute in batches to improve performance
                if (i % 100 == 0 && i > 0) {
                    stmt.executeBatch();
                }
            }
            stmt.executeBatch();
            System.out.println("Inserted/updated " + eventNodes.getLength() + " events");
        }
    }

    private void loadSeries(Connection conn, NodeList seriesNodes) throws Exception {
        String sql = "INSERT INTO SERIE (id_serie, nombre, descripcion, fecha_inicio, fecha_fin, URL_imagen) " +
                     "VALUES (?, ?, ?, ?, ?, ?) " +
                     "ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), descripcion = VALUES(descripcion), " +
                     "fecha_inicio = VALUES(fecha_inicio), fecha_fin = VALUES(fecha_fin), URL_imagen = VALUES(URL_imagen)";

        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            for (int i = 0; i < seriesNodes.getLength(); i++) {
                Element series = (Element) seriesNodes.item(i);
                
                int id = Integer.parseInt(getElementTextContent(series, "id"));
                String title = getElementTextContent(series, "title");
                String description = getElementTextContent(series, "description");
                
                // Handle start year
                String startYearStr = getElementTextContent(series, "startYear");
                Date startDate = null;
                if (!startYearStr.isEmpty()) {
                    try {
                        int startYear = Integer.parseInt(startYearStr);
                        startDate = Date.valueOf(startYear + "-01-01");
                    } catch (Exception e) {
                        System.err.println("Error parsing start year: " + startYearStr);
                    }
                }
                
                // Handle end year
                String endYearStr = getElementTextContent(series, "endYear");
                Date endDate = null;
                if (!endYearStr.isEmpty()) {
                    try {
                        int endYear = Integer.parseInt(endYearStr);
                        endDate = Date.valueOf(endYear + "-12-31");
                    } catch (Exception e) {
                        System.err.println("Error parsing end year: " + endYearStr);
                    }
                }
                
                String imageUrl = getElementTextContent(series, "thumbnailUrl");

                stmt.setInt(1, id);
                stmt.setString(2, title);
                stmt.setString(3, description);
                
                if (startDate != null) {
                    stmt.setDate(4, startDate);
                } else {
                    stmt.setNull(4, java.sql.Types.DATE);
                }
                
                if (endDate != null) {
                    stmt.setDate(5, endDate);
                } else {
                    stmt.setNull(5, java.sql.Types.DATE);
                }
                
                stmt.setString(6, imageUrl);
                
                stmt.addBatch();

                // Execute in batches to improve performance
                if (i % 100 == 0 && i > 0) {
                    stmt.executeBatch();
                }
            }
            stmt.executeBatch();
            System.out.println("Inserted/updated " + seriesNodes.getLength() + " series");
        }
    }

    private String getElementTextContent(Element parent, String elementName) {
        NodeList nodeList = parent.getElementsByTagName(elementName);
        if (nodeList.getLength() > 0) {
            return nodeList.item(0).getTextContent();
        }
        return "";
    }
}
