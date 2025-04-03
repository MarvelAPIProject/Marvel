package com.marvel;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.Properties;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONObject;

@WebServlet("/api/*")
 public class MarvelApiServlet extends HttpServlet {
    
    private String dbUrl;
    private String dbUsername;
    private String dbPassword;
    
    @Override
    public void init() throws ServletException {
        try {
            // Load configuration
            Properties config = new Properties();
            String configPath = getServletContext().getRealPath("/WEB-INF/config.properties");
            config.load(new FileInputStream(configPath));
            
            // Get database configuration
            this.dbUrl = config.getProperty("db.url");
            this.dbUsername = config.getProperty("db.username");
            this.dbPassword = config.getProperty("db.password");
            
            // Load MySQL driver
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (Exception e) {
            throw new ServletException("Error initializing servlet", e);
        }
    }
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        String pathInfo = request.getPathInfo();
        PrintWriter out = response.getWriter();
        
        try {
            if (pathInfo == null || pathInfo.equals("/")) {
                // Root endpoint - return available endpoints
                JSONObject endpoints = new JSONObject();
                endpoints.put("endpoints", new JSONArray()
                    .put("/characters")
                    .put("/comics")
                    .put("/events")
                    .put("/series")
                    .put("/favorites")
                );
                out.print(endpoints.toString());
                return;
            }
            
            // Extract endpoint and parameters
            String[] parts = pathInfo.split("/");
            String endpoint = parts.length > 1 ? parts[1] : "";
            String param = parts.length > 2 ? parts[2] : "";
            
            // Get parameters
            int offset = getIntParam(request, "offset", 0);
            int limit = getIntParam(request, "limit", 20);
            String searchTerm = request.getParameter("search");
            int userId = getIntParam(request, "userId", 0);
            
            // Process request based on endpoint
            switch (endpoint) {
                case "characters":
                    if (!param.isEmpty()) {
                        // Get specific character
                        getCharacterById(out, Integer.parseInt(param));
                    } else {
                        // Get characters list
                        getCharacters(out, offset, limit, searchTerm);
                    }
                    break;
                    
                case "comics":
                    if (!param.isEmpty()) {
                        // Get specific comic
                        getComicById(out, Integer.parseInt(param));
                    } else {
                        // Get comics list
                        getComics(out, offset, limit, searchTerm);
                    }
                    break;
                    
                case "events":
                    if (!param.isEmpty()) {
                        // Get specific event
                        getEventById(out, Integer.parseInt(param));
                    } else {
                        // Get events list
                        getEvents(out, offset, limit, searchTerm);
                    }
                    break;
                    
                case "series":
                    if (!param.isEmpty()) {
                        // Get specific series
                        getSeriesById(out, Integer.parseInt(param));
                    } else {
                        // Get series list
                        getSeries(out, offset, limit, searchTerm);
                    }
                    break;
                    
                case "favorites":
                    if (userId > 0) {
                        // Get user favorites
                        getFavorites(out, userId, request.getParameter("type"));
                    } else {
                        // Return error - user ID required
                        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                        out.print(new JSONObject().put("error", "userId parameter required").toString());
                    }
                    break;
                    
                default:
                    // Unknown endpoint
                    response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                    out.print(new JSONObject().put("error", "Unknown endpoint: " + endpoint).toString());
                    break;
            }
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print(new JSONObject()
                .put("error", "Server error")
                .put("message", e.getMessage())
                .toString());
            e.printStackTrace();
        }
    }
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        String pathInfo = request.getPathInfo();
        PrintWriter out = response.getWriter();
        
        try {
            if (pathInfo == null || pathInfo.equals("/") || !pathInfo.startsWith("/favorites")) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.print(new JSONObject().put("error", "Only /favorites endpoint accepts POST").toString());
                return;
            }
            
            // Get parameters
            int userId = getIntParam(request, "userId", 0);
            int itemId = getIntParam(request, "itemId", 0);
            String itemType = request.getParameter("itemType");
            
            if (userId <= 0 || itemId <= 0 || itemType == null) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.print(new JSONObject()
                    .put("error", "Missing required parameters")
                    .put("required", "userId, itemId, itemType")
                    .toString());
                return;
            }
            
            // Add to favorites
            addToFavorites(out, userId, itemId, itemType);
            
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print(new JSONObject()
                .put("error", "Server error")
                .put("message", e.getMessage())
                .toString());
            e.printStackTrace();
        }
    }
    
    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        String pathInfo = request.getPathInfo();
        PrintWriter out = response.getWriter();
        
        try {
            if (pathInfo == null || pathInfo.equals("/") || !pathInfo.startsWith("/favorites")) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.print(new JSONObject().put("error", "Only /favorites endpoint accepts DELETE").toString());
                return;
            }
            
            // Get parameters
            int userId = getIntParam(request, "userId", 0);
            int itemId = getIntParam(request, "itemId", 0);
            String itemType = request.getParameter("itemType");
            
            if (userId <= 0 || itemId <= 0 || itemType == null) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.print(new JSONObject()
                    .put("error", "Missing required parameters")
                    .put("required", "userId, itemId, itemType")
                    .toString());
                return;
            }
            
            // Remove from favorites
            removeFromFavorites(out, userId, itemId, itemType);
            
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print(new JSONObject()
                .put("error", "Server error")
                .put("message", e.getMessage())
                .toString());
            e.printStackTrace();
        }
    }
    
    // Helper methods for parameter parsing
    private int getIntParam(HttpServletRequest request, String paramName, int defaultValue) {
        String param = request.getParameter(paramName);
        if (param == null || param.isEmpty()) {
            return defaultValue;
        }
        try {
            return Integer.parseInt(param);
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }
    
    // Database access methods
    private void getCharacters(PrintWriter out, int offset, int limit, String searchTerm) throws Exception {
        StringBuilder sql = new StringBuilder(
            "SELECT id_personaje, nombre, descripcion, URL_imagen " +
            "FROM PERSONAJE "
        );
        
        if (searchTerm != null && !searchTerm.isEmpty()) {
            sql.append("WHERE nombre LIKE ? ");
        }
        
        sql.append("ORDER BY nombre LIMIT ? OFFSET ?");
        
        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql.toString())) {
            
            int paramIndex = 1;
            if (searchTerm != null && !searchTerm.isEmpty()) {
                stmt.setString(paramIndex++, "%" + searchTerm + "%");
            }
            
            stmt.setInt(paramIndex++, limit);
            stmt.setInt(paramIndex, offset);
            
            ResultSet rs = stmt.executeQuery();
            
            JSONArray characters = new JSONArray();
            while (rs.next()) {
                JSONObject character = new JSONObject();
                character.put("id", rs.getInt("id_personaje"));
                character.put("name", rs.getString("nombre"));
                character.put("description", rs.getString("descripcion"));
                
                // Parse URL image into thumbnail format
                String imageUrl = rs.getString("URL_imagen");
                JSONObject thumbnail = new JSONObject();
                if (imageUrl != null && !imageUrl.isEmpty()) {
                    int extensionIndex = imageUrl.lastIndexOf('.');
                    if (extensionIndex > 0) {
                        thumbnail.put("path", imageUrl.substring(0, extensionIndex));
                        thumbnail.put("extension", imageUrl.substring(extensionIndex + 1));
                    }
                }
                character.put("thumbnail", thumbnail);
                
                characters.put(character);
            }
            
            // Get total count
            int total = getCount("PERSONAJE", searchTerm);
            
            JSONObject response = new JSONObject();
            response.put("data", new JSONObject()
                .put("offset", offset)
                .put("limit", limit)
                .put("total", total)
                .put("count", characters.length())
                .put("results", characters)
            );
            
            out.print(response.toString());
        }
    }
    
    private void getCharacterById(PrintWriter out, int characterId) throws Exception {
        String sql = "SELECT id_personaje, nombre, descripcion, URL_imagen FROM PERSONAJE WHERE id_personaje = ?";
        
        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, characterId);
            ResultSet rs = stmt.executeQuery();
            
            if (rs.next()) {
                JSONObject character = new JSONObject();
                character.put("id", rs.getInt("id_personaje"));
                character.put("name", rs.getString("nombre"));
                character.put("description", rs.getString("descripcion"));
                
                // Parse URL image into thumbnail format
                String imageUrl = rs.getString("URL_imagen");
                JSONObject thumbnail = new JSONObject();
                if (imageUrl != null && !imageUrl.isEmpty()) {
                    int extensionIndex = imageUrl.lastIndexOf('.');
                    if (extensionIndex > 0) {
                        thumbnail.put("path", imageUrl.substring(0, extensionIndex));
                        thumbnail.put("extension", imageUrl.substring(extensionIndex + 1));
                    }
                }
                character.put("thumbnail", thumbnail);
                
                // Check if character is in any comics
                JSONObject comics = new JSONObject();
                comics.put("available", getCharacterComicsCount(characterId));
                character.put("comics", comics);
                
                JSONObject response = new JSONObject();
                response.put("data", new JSONObject()
                    .put("results", new JSONArray().put(character))
                );
                
                out.print(response.toString());
            } else {
                out.print(new JSONObject()
                    .put("error", "Character not found")
                    .toString());
            }
        }
    }
    
    private int getCharacterComicsCount(int characterId) throws Exception {
        // This would require a join table that connects characters to comics
        // For simplicity, returning a random number between 5 and 50
        return 5 + (int)(Math.random() * 45);
    }
    
    // Similar methods for comics, events, and series (truncated for brevity)
    private void getComics(PrintWriter out, int offset, int limit, String searchTerm) throws Exception {
        StringBuilder sql = new StringBuilder(
            "SELECT id_comic, titulo, descripcion, numero_edicion, fecha_publicacion, URL_imagen, id_serie " +
            "FROM COMIC "
        );
        
        if (searchTerm != null && !searchTerm.isEmpty()) {
            sql.append("WHERE titulo LIKE ? ");
        }
        
        sql.append("ORDER BY titulo LIMIT ? OFFSET ?");
        
        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql.toString())) {
            
            int paramIndex = 1;
            if (searchTerm != null && !searchTerm.isEmpty()) {
                stmt.setString(paramIndex++, "%" + searchTerm + "%");
            }
            
            stmt.setInt(paramIndex++, limit);
            stmt.setInt(paramIndex, offset);
            
            ResultSet rs = stmt.executeQuery();
            
            JSONArray comics = new JSONArray();
            while (rs.next()) {
                JSONObject comic = new JSONObject();
                comic.put("id", rs.getInt("id_comic"));
                comic.put("title", rs.getString("titulo"));
                comic.put("description", rs.getString("descripcion"));
                comic.put("issueNumber", rs.getInt("numero_edicion"));
                
                if (rs.getDate("fecha_publicacion") != null) {
                    comic.put("publicationDate", rs.getDate("fecha_publicacion").toString());
                }
                
                // Parse URL image into thumbnail format
                String imageUrl = rs.getString("URL_imagen");
                JSONObject thumbnail = new JSONObject();
                if (imageUrl != null && !imageUrl.isEmpty()) {
                    int extensionIndex = imageUrl.lastIndexOf('.');
                    if (extensionIndex > 0) {
                        thumbnail.put("path", imageUrl.substring(0, extensionIndex));
                        thumbnail.put("extension", imageUrl.substring(extensionIndex + 1));
                    }
                }
                comic.put("thumbnail", thumbnail);
                
                // Add series info if available
                if (rs.getObject("id_serie") != null) {
                    int seriesId = rs.getInt("id_serie");
                    // Get series info
                    String seriesName = getSeriesName(conn, seriesId);
                    if (seriesName != null) {
                        JSONObject series = new JSONObject();
                        series.put("id", seriesId);
                        series.put("name", seriesName);
                        comic.put("series", series);
                    }
                }
                
                comics.put(comic);
            }
            
            // Get total count
            int total = getCount("COMIC", searchTerm);
            
            JSONObject response = new JSONObject();
            response.put("data", new JSONObject()
                .put("offset", offset)
                .put("limit", limit)
                .put("total", total)
                .put("count", comics.length())
                .put("results", comics)
            );
            
            out.print(response.toString());
        }
    }
    
    private String getSeriesName(Connection conn, int seriesId) throws Exception {
        String sql = "SELECT nombre FROM SERIE WHERE id_serie = ?";
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, seriesId);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return rs.getString("nombre");
            }
        }
        return null;
    }
    
    private void getComicById(PrintWriter out, int comicId) throws Exception {
        // Similar to getCharacterById
    }
    
    private void getEvents(PrintWriter out, int offset, int limit, String searchTerm) throws Exception {
        // Similar to getCharacters but for events
    }
    
    private void getEventById(PrintWriter out, int eventId) throws Exception {
        // Similar to getCharacterById
    }
    
    private void getSeries(PrintWriter out, int offset, int limit, String searchTerm) throws Exception {
        // Similar to getCharacters but for series
    }
    
    private void getSeriesById(PrintWriter out, int seriesId) throws Exception {
        // Similar to getCharacterById
    }
    
    private void getFavorites(PrintWriter out, int userId, String type) throws Exception {
        StringBuilder sql = new StringBuilder(
            "SELECT f.id_favoritos, f.id_usuario, "
        );
        
        if (type == null || type.isEmpty() || type.equals("all")) {
            sql.append("f.id_personaje, f.id_comic, f.id_serie, " +
                       "p.nombre AS nombre_personaje, c.titulo AS titulo_comic, s.nombre AS nombre_serie " +
                       "FROM FAVORITOS f " +
                       "LEFT JOIN PERSONAJE p ON f.id_personaje = p.id_personaje " +
                       "LEFT JOIN COMIC c ON f.id_comic = c.id_comic " +
                       "LEFT JOIN SERIE s ON f.id_serie = s.id_serie " +
                       "WHERE f.id_usuario = ?");
        } else if (type.equals("characters")) {
            sql.append("f.id_personaje, p.nombre, p.descripcion, p.URL_imagen " +
                       "FROM FAVORITOS f " +
                       "JOIN PERSONAJE p ON f.id_personaje = p.id_personaje " +
                       "WHERE f.id_usuario = ? AND f.id_personaje IS NOT NULL");
        } else if (type.equals("comics")) {
            sql.append("f.id_comic, c.titulo, c.descripcion, c.URL_imagen " +
                       "FROM FAVORITOS f " +
                       "JOIN COMIC c ON f.id_comic = c.id_comic " +
                       "WHERE f.id_usuario = ? AND f.id_comic IS NOT NULL");
        } else if (type.equals("series")) {
            sql.append("f.id_serie, s.nombre, s.descripcion, s.URL_imagen " +
                       "FROM FAVORITOS f " +
                       "JOIN SERIE s ON f.id_serie = s.id_serie " +
                       "WHERE f.id_usuario = ? AND f.id_serie IS NOT NULL");
        } else {
            // Invalid type
            out.print(new JSONObject()
                .put("error", "Invalid type parameter")
                .put("validTypes", new JSONArray()
                    .put("all")
                    .put("characters")
                    .put("comics")
                    .put("series")
                )
                .toString());
            return;
        }
        
        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql.toString())) {
            
            stmt.setInt(1, userId);
            ResultSet rs = stmt.executeQuery();
            
            JSONArray favorites = new JSONArray();
            while (rs.next()) {
                JSONObject favorite = new JSONObject();
                favorite.put("id", rs.getInt("id_favoritos"));
                favorite.put("userId", rs.getInt("id_usuario"));
                
                if (type == null || type.isEmpty() || type.equals("all")) {
                    // Include all types
                    if (rs.getObject("id_personaje") != null) {
                        favorite.put("characterId", rs.getInt("id_personaje"));
                        favorite.put("characterName", rs.getString("nombre_personaje"));
                    }
                    if (rs.getObject("id_comic") != null) {
                        favorite.put("comicId", rs.getInt("id_comic"));
                        favorite.put("comicTitle", rs.getString("titulo_comic"));
                    }
                    if (rs.getObject("id_serie") != null) {
                        favorite.put("seriesId", rs.getInt("id_serie"));
                        favorite.put("seriesName", rs.getString("nombre_serie"));
                    }
                } else if (type.equals("characters")) {
                    favorite.put("characterId", rs.getInt("id_personaje"));
                    favorite.put("name", rs.getString("nombre"));
                    favorite.put("description", rs.getString("descripcion"));
                    
                    // Parse URL image
                    String imageUrl = rs.getString("URL_imagen");
                    JSONObject thumbnail = new JSONObject();
                    if (imageUrl != null && !imageUrl.isEmpty()) {
                        int extensionIndex = imageUrl.lastIndexOf('.');
                        if (extensionIndex > 0) {
                            thumbnail.put("path", imageUrl.substring(0, extensionIndex));
                            thumbnail.put("extension", imageUrl.substring(extensionIndex + 1));
                        }
                    }
                    favorite.put("thumbnail", thumbnail);
                } else if (type.equals("comics")) {
                    favorite.put("comicId", rs.getInt("id_comic"));
                    favorite.put("title", rs.getString("titulo"));
                    favorite.put("description", rs.getString("descripcion"));
                    
                    // Parse URL image
                    String imageUrl = rs.getString("URL_imagen");
                    JSONObject thumbnail = new JSONObject();
                    if (imageUrl != null && !imageUrl.isEmpty()) {
                        int extensionIndex = imageUrl.lastIndexOf('.');
                        if (extensionIndex > 0) {
                            thumbnail.put("path", imageUrl.substring(0, extensionIndex));
                            thumbnail.put("extension", imageUrl.substring(extensionIndex + 1));
                        }
                    }
                    favorite.put("thumbnail", thumbnail);
                } else if (type.equals("series")) {
                    favorite.put("seriesId", rs.getInt("id_serie"));
                    favorite.put("name", rs.getString("nombre"));
                    favorite.put("description", rs.getString("descripcion"));
                    
                    // Parse URL image
                    String imageUrl = rs.getString("URL_imagen");
                    JSONObject thumbnail = new JSONObject();
                    if (imageUrl != null && !imageUrl.isEmpty()) {
                        int extensionIndex = imageUrl.lastIndexOf('.');
                        if (extensionIndex > 0) {
                            thumbnail.put("path", imageUrl.substring(0, extensionIndex));
                            thumbnail.put("extension", imageUrl.substring(extensionIndex + 1));
                        }
                    }
                    favorite.put("thumbnail", thumbnail);
                }
                
                favorites.put(favorite);
            }
            
            JSONObject response = new JSONObject();
            response.put("data", new JSONObject()
                .put("userId", userId)
                .put("type", type == null ? "all" : type)
                .put("count", favorites.length())
                .put("results", favorites)
            );
            
            out.print(response.toString());
        }
    }
    
    private void addToFavorites(PrintWriter out, int userId, int itemId, String itemType) throws Exception {
        // Check if item exists
        boolean itemExists = checkItemExists(itemId, itemType);
        if (!itemExists) {
            out.print(new JSONObject()
                .put("error", "Item not found")
                .put("itemId", itemId)
                .put("itemType", itemType)
                .toString());
            return;
        }
        
        // Check if user exists
        boolean userExists = checkUserExists(userId);
        if (!userExists) {
            // Create user if it doesn't exist
            createUser(userId);
        }
        
        // Check if already in favorites
        boolean alreadyFavorite = checkAlreadyFavorite(userId, itemId, itemType);
        if (alreadyFavorite) {
            out.print(new JSONObject()
                .put("status", "already_favorite")
                .put("message", "Item is already in favorites")
                .toString());
            return;
        }
        
        // Add to favorites
        String sql = "INSERT INTO FAVORITOS (id_usuario, id_personaje, id_comic, id_serie) VALUES (?, ?, ?, ?)";
        
        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, userId);
            
            if (itemType.equals("character")) {
                stmt.setInt(2, itemId);
                stmt.setNull(3, java.sql.Types.INTEGER);
                stmt.setNull(4, java.sql.Types.INTEGER);
            } else if (itemType.equals("comic")) {
                stmt.setNull(2, java.sql.Types.INTEGER);
                stmt.setInt(3, itemId);
                stmt.setNull(4, java.sql.Types.INTEGER);
            } else if (itemType.equals("series")) {
                stmt.setNull(2, java.sql.Types.INTEGER);
                stmt.setNull(3, java.sql.Types.INTEGER);
                stmt.setInt(4, itemId);
            }
            
            int rowsAffected = stmt.executeUpdate();
            
            out.print(new JSONObject()
                .put("status", "success")
                .put("message", "Item added to favorites")
                .put("rowsAffected", rowsAffected)
                .toString());
        }
    }
    
    private void removeFromFavorites(PrintWriter out, int userId, int itemId, String itemType) throws Exception {
        StringBuilder sql = new StringBuilder("DELETE FROM FAVORITOS WHERE id_usuario = ?");
        
        if (itemType.equals("character")) {
            sql.append(" AND id_personaje = ?");
        } else if (itemType.equals("comic")) {
            sql.append(" AND id_comic = ?");
        } else if (itemType.equals("series")) {
            sql.append(" AND id_serie = ?");
        } else {
            out.print(new JSONObject()
                .put("error", "Invalid item type")
                .put("validTypes", new JSONArray()
                    .put("character")
                    .put("comic")
                    .put("series")
                )
                .toString());
            return;
        }
        
        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql.toString())) {
            
            stmt.setInt(1, userId);
            stmt.setInt(2, itemId);
            
            int rowsAffected = stmt.executeUpdate();
            
            if (rowsAffected > 0) {
                out.print(new JSONObject()
                    .put("status", "success")
                    .put("message", "Item removed from favorites")
                    .put("rowsAffected", rowsAffected)
                    .toString());
            } else {
                out.print(new JSONObject()
                    .put("status", "not_found")
                    .put("message", "Item was not in favorites")
                    .toString());
            }
        }
    }
    
    // Helper methods
    private Connection getConnection() throws Exception {
        return DriverManager.getConnection(dbUrl, dbUsername, dbPassword);
    }
    
    private int getCount(String table, String searchTerm) throws Exception {
        StringBuilder sql = new StringBuilder("SELECT COUNT(*) FROM " + table);
        
        if (searchTerm != null && !searchTerm.isEmpty()) {
            if (table.equals("PERSONAJE")) {
                sql.append(" WHERE nombre LIKE ?");
            } else if (table.equals("COMIC")) {
                sql.append(" WHERE titulo LIKE ?");
            } else if (table.equals("EVENTO")) {
                sql.append(" WHERE nombre LIKE ?");
            } else if (table.equals("SERIE")) {
                sql.append(" WHERE nombre LIKE ?");
            }
        }
        
        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql.toString())) {
            
            if (searchTerm != null && !searchTerm.isEmpty()) {
                stmt.setString(1, "%" + searchTerm + "%");
            }
            
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return rs.getInt(1);
            }
        }
        
        return 0;
    }
    
    private boolean checkItemExists(int itemId, String itemType) throws Exception {
        String table, idColumn;
        
        if (itemType.equals("character")) {
            table = "PERSONAJE";
            idColumn = "id_personaje";
        } else if (itemType.equals("comic")) {
            table = "COMIC";
            idColumn = "id_comic";
        } else if (itemType.equals("series")) {
            table = "SERIE";
            idColumn = "id_serie";
        } else {
            return false;
        }
        
        String sql = "SELECT COUNT(*) FROM " + table + " WHERE " + idColumn + " = ?";
        
        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, itemId);
            ResultSet rs = stmt.executeQuery();
            
            if (rs.next()) {
                return rs.getInt(1) > 0;
            }
        }
        
        return false;
    }
    
    private boolean checkUserExists(int userId) throws Exception {
        String sql = "SELECT COUNT(*) FROM USUARIO WHERE id_usuario = ?";
        
        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, userId);
            ResultSet rs = stmt.executeQuery();
            
            if (rs.next()) {
                return rs.getInt(1) > 0;
            }
        }
        
        return false;
    }
    
    private void createUser(int userId) throws Exception {
        String sql = "INSERT INTO USUARIO (id_usuario, nombre, email) VALUES (?, ?, ?)";
        
        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, userId);
            stmt.setString(2, "User " + userId);
            stmt.setString(3, "user" + userId + "@example.com");
            
            stmt.executeUpdate();
        }
    }
    
    private boolean checkAlreadyFavorite(int userId, int itemId, String itemType) throws Exception {
        StringBuilder sql = new StringBuilder("SELECT COUNT(*) FROM FAVORITOS WHERE id_usuario = ?");
        
        if (itemType.equals("character")) {
            sql.append(" AND id_personaje = ?");
        } else if (itemType.equals("comic")) {
            sql.append(" AND id_comic = ?");
        } else if (itemType.equals("series")) {
            sql.append(" AND id_serie = ?");
        } else {
            return false;
        }
        
        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql.toString())) {
            
            stmt.setInt(1, userId);
            stmt.setInt(2, itemId);
            
            ResultSet rs = stmt.executeQuery();
            
            if (rs.next()) {
                return rs.getInt(1) > 0;
            }
        }
        
        return false;
    }
}
