import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.Headers;

import java.io.IOException;
import java.io.OutputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.BufferedReader;
import java.sql.*;
import java.net.URI;
import java.util.HashMap;
import java.util.Map;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;
import java.util.regex.Matcher;

public class ServidorMarvel {
    public static void main(String[] args) throws Exception {
        // Crear servidor en el puerto 8080
        HttpServer server = HttpServer.create(new java.net.InetSocketAddress(8080), 0);
        
        // Endpoints REST
        server.createContext("/api/characters", new CharactersHandler());
        server.createContext("/api/comics", new ComicsHandler());
        server.createContext("/api/series", new SeriesHandler());
        server.createContext("/api/events", new EventsHandler());
        server.createContext("/api/favorites", new FavoritesHandler());
        
        // Endpoint para verificar si la API está funcionando
        server.createContext("/api", new ApiStatusHandler());
        
        // Endpoint para acceso a archivos estáticos (opcional)
        server.createContext("/", new StaticFileHandler());
        
        server.start();
        System.out.println("🚀 Servidor Marvel API iniciado en http://localhost:8080");
        System.out.println("✅ Endpoints disponibles:");
        System.out.println("   - /api/characters - Obtener personajes");
        System.out.println("   - /api/comics - Obtener cómics");
        System.out.println("   - /api/series - Obtener series");
        System.out.println("   - /api/events - Obtener eventos");
        System.out.println("   - /api/favorites - Gestionar favoritos");
    }

    // Clase auxiliar para verificar el estado de la API
    static class ApiStatusHandler extends BaseHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("GET".equals(exchange.getRequestMethod())) {
                String jsonResponse = "{\"message\":\"API de Marvel conectada correctamente\"}";
                sendJsonResponse(exchange, jsonResponse);
            } else if ("OPTIONS".equals(exchange.getRequestMethod())) {
                handleOptionsRequest(exchange);
            } else {
                sendError(exchange, 405, "Método no permitido");
            }
        }
    }

    // Clase base para todos los handlers
    static abstract class BaseHandler implements HttpHandler {
        // Método para analizar parámetros de consulta
        protected Map<String, String> parseQueryParams(String query) {
            Map<String, String> result = new HashMap<>();
            if (query == null) return result;
            
            String[] pairs = query.split("&");
            for (String pair : pairs) {
                int idx = pair.indexOf("=");
                if (idx > 0) {
                    result.put(pair.substring(0, idx), pair.substring(idx + 1));
                }
            }
            return result;
        }
        
        // Leer cuerpo de la solicitud como String
        protected String readRequestBody(HttpExchange exchange) throws IOException {
            InputStream is = exchange.getRequestBody();
            BufferedReader br = new BufferedReader(new InputStreamReader(is));
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = br.readLine()) != null) {
                sb.append(line);
            }
            return sb.toString();
        }
        
        // Parsear cuerpo JSON simple (solución básica para JSON simple)
        protected Map<String, String> parseSimpleJson(String json) {
            Map<String, String> result = new HashMap<>();
            // Eliminar llaves exteriores
            json = json.trim();
            if (json.startsWith("{")) json = json.substring(1);
            if (json.endsWith("}")) json = json.substring(0, json.length() - 1);
            
            // Dividir por comas, respetando comillas
            String[] pairs = json.split(",");
            for (String pair : pairs) {
                // Dividir por :, el primer : encontrado
                int colonIdx = pair.indexOf(":");
                if (colonIdx > 0) {
                    String key = pair.substring(0, colonIdx).trim();
                    String value = pair.substring(colonIdx + 1).trim();
                    
                    // Eliminar comillas
                    if (key.startsWith("\"") && key.endsWith("\"")) {
                        key = key.substring(1, key.length() - 1);
                    }
                    if (value.startsWith("\"") && value.endsWith("\"")) {
                        value = value.substring(1, value.length() - 1);
                    }
                    
                    result.put(key, value);
                }
            }
            return result;
        }
        
        // Manejar solicitudes CORS OPTIONS
        protected void handleOptionsRequest(HttpExchange exchange) throws IOException {
            Headers headers = exchange.getResponseHeaders();
            headers.set("Access-Control-Allow-Origin", "*");
            headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            headers.set("Access-Control-Allow-Headers", "Content-Type");
            headers.set("Access-Control-Max-Age", "86400");
            exchange.sendResponseHeaders(204, -1);
        }
        
        // Enviar respuesta JSON
        protected void sendJsonResponse(HttpExchange exchange, String json) throws IOException {
            Headers headers = exchange.getResponseHeaders();
            headers.set("Content-Type", "application/json; charset=UTF-8");
            headers.set("Access-Control-Allow-Origin", "*");
            exchange.sendResponseHeaders(200, json.getBytes().length);
            OutputStream os = exchange.getResponseBody();
            os.write(json.getBytes());
            os.close();
        }
        
        // Enviar error
        protected void sendError(HttpExchange exchange, int code, String message) throws IOException {
            String json = "{\"error\":\"" + message + "\"}";
            Headers headers = exchange.getResponseHeaders();
            headers.set("Content-Type", "application/json; charset=UTF-8");
            headers.set("Access-Control-Allow-Origin", "*");
            exchange.sendResponseHeaders(code, json.getBytes().length);
            OutputStream os = exchange.getResponseBody();
            os.write(json.getBytes());
            os.close();
        }
        
        // Asignar un universo basado en el ID
        protected String assignUniverse(int id) {
            int universeId = id % 6;
            switch(universeId) {
                case 0: return "616";    // Universo principal
                case 1: return "1610";   // Ultimate
                case 2: return "199999"; // MCU
                case 3: return "10005";  // X-Men
                case 4: return "1048";   // Spider-Verse
                case 5: return "90214";  // Noir
                default: return "616";
            }
        }
        
        // Convierte una URL de imagen al formato esperado por el frontend
        protected String formatImageUrl(String url) {
            if (url == null || url.isEmpty()) {
                return null;
            }
            
            // Si la URL ya tiene formato http/https, devolverla como está
            if (url.startsWith("http")) {
                return url;
            }
            
            // Si no, puede ser una ruta local o un nombre de archivo
            return url;
        }
    }

    // Handler para el endpoint /api/characters
    static class CharactersHandler extends BaseHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            try {
                if ("GET".equals(exchange.getRequestMethod())) {
                    // Obtener parámetros de consulta
                    URI uri = exchange.getRequestURI();
                    Map<String, String> params = parseQueryParams(uri.getQuery());
                    
                    // Extraer parámetros o usar valores predeterminados
                    int page = Integer.parseInt(params.getOrDefault("page", "1"));
                    int limit = Integer.parseInt(params.getOrDefault("limit", "12"));
                    String searchTerm = params.getOrDefault("searchTerm", "");
                    String universe = params.getOrDefault("universe", "all");
                    
                    // Calcular offset para paginación
                    int offset = (page - 1) * limit;
                    
                    // Construir JSON con los resultados
                    StringBuilder jsonBuilder = new StringBuilder();
                    jsonBuilder.append("{\"data\":{\"results\":[");
                    
                    try (Connection conn = ConexionBD.getConnection()) {
                        // Consulta SQL para personajes
                        String sql = "SELECT id_personaje, nombre, descripcion, URL_imagen FROM PERSONAJE";
                        if (!searchTerm.isEmpty()) {
                            sql += " WHERE nombre LIKE ?";
                        }
                        sql += " LIMIT ? OFFSET ?";
                        
                        PreparedStatement stmt = conn.prepareStatement(sql);
                        int paramIndex = 1;
                        if (!searchTerm.isEmpty()) {
                            stmt.setString(paramIndex++, "%" + searchTerm + "%");
                        }
                        stmt.setInt(paramIndex++, limit);
                        stmt.setInt(paramIndex, offset);
                        
                        ResultSet rs = stmt.executeQuery();
                        
                        boolean first = true;
                        while (rs.next()) {
                            int id = rs.getInt("id_personaje");
                            String name = rs.getString("nombre");
                            String description = rs.getString("descripcion");
                            String imageUrl = rs.getString("URL_imagen");
                            
                            // Filtrar por universo si es necesario
                            if (!"all".equals(universe) && !universe.equals(assignUniverse(id))) {
                                continue;
                            }
                            
                            if (!first) {
                                jsonBuilder.append(",");
                            }
                            first = false;
                            
                            // Construir objeto JSON para un personaje
                            jsonBuilder.append("{");
                            jsonBuilder.append("\"id\":").append(id).append(",");
                            jsonBuilder.append("\"name\":\"").append(name.replace("\"", "\\\"")).append("\",");
                            jsonBuilder.append("\"description\":\"").append(description != null ? description.replace("\"", "\\\"") : "").append("\",");
                            
                            // Thumbnail
                            String imagePath = formatImageUrl(imageUrl);
                            jsonBuilder.append("\"thumbnail\":{");
                            if (imagePath != null) {
                                // Dividir en path y extension
                                int dotIndex = imagePath.lastIndexOf('.');
                                String path = dotIndex > 0 ? imagePath.substring(0, dotIndex) : imagePath;
                                String extension = dotIndex > 0 ? imagePath.substring(dotIndex + 1) : "jpg";
                                
                                jsonBuilder.append("\"path\":\"").append(path).append("\",");
                                jsonBuilder.append("\"extension\":\"").append(extension).append("\"");
                            } else {
                                jsonBuilder.append("\"path\":\"https://via.placeholder.com/300x400\",");
                                jsonBuilder.append("\"extension\":\"jpg\"");
                            }
                            jsonBuilder.append("},");
                            
                            // Añadir información de cómics (obtenida de la base de datos)
                            int comicsCount = getComicsCountForCharacter(conn, id);
                            jsonBuilder.append("\"comics\":{\"available\":").append(comicsCount).append("},");
                            
                            // Universo
                            jsonBuilder.append("\"universe\":\"").append(assignUniverse(id)).append("\"");
                            
                            jsonBuilder.append("}");
                        }
                        
                        // Obtener el total de personajes para la paginación
                        String countSql = "SELECT COUNT(*) as total FROM PERSONAJE";
                        if (!searchTerm.isEmpty()) {
                            countSql += " WHERE nombre LIKE ?";
                        }
                        
                        PreparedStatement countStmt = conn.prepareStatement(countSql);
                        if (!searchTerm.isEmpty()) {
                            countStmt.setString(1, "%" + searchTerm + "%");
                        }
                        
                        ResultSet countRs = countStmt.executeQuery();
                        int total = countRs.next() ? countRs.getInt("total") : 0;
                        
                        jsonBuilder.append("],");
                        jsonBuilder.append("\"total\":").append(total).append(",");
                        jsonBuilder.append("\"count\":").append(limit).append(",");
                        jsonBuilder.append("\"limit\":").append(limit).append(",");
                        jsonBuilder.append("\"offset\":").append(offset);
                        jsonBuilder.append("}}");
                        
                        sendJsonResponse(exchange, jsonBuilder.toString());
                    } catch (SQLException e) {
                        sendError(exchange, 500, "Error de base de datos: " + e.getMessage());
                    }
                } else if ("OPTIONS".equals(exchange.getRequestMethod())) {
                    handleOptionsRequest(exchange);
                } else {
                    sendError(exchange, 405, "Método no permitido");
                }
            } catch (Exception e) {
                sendError(exchange, 500, "Error interno del servidor: " + e.getMessage());
            }
        }
        
        // Obtener el número de cómics de un personaje
        private int getComicsCountForCharacter(Connection conn, int characterId) {
            try {
                String sql = "SELECT COUNT(*) as count FROM COMIC_PERSONAJE WHERE id_personaje = ?";
                PreparedStatement stmt = conn.prepareStatement(sql);
                stmt.setInt(1, characterId);
                ResultSet rs = stmt.executeQuery();
                
                if (rs.next()) {
                    return rs.getInt("count");
                }
            } catch (SQLException e) {
                System.err.println("Error al obtener el número de cómics: " + e.getMessage());
            }
            return 0;
        }
    }

    // Handler para el endpoint /api/comics
    static class ComicsHandler extends BaseHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            try {
                if ("GET".equals(exchange.getRequestMethod())) {
                    // Obtener parámetros de consulta
                    URI uri = exchange.getRequestURI();
                    Map<String, String> params = parseQueryParams(uri.getQuery());
                    
                    // Extraer parámetros o usar valores predeterminados
                    int page = Integer.parseInt(params.getOrDefault("page", "1"));
                    int limit = Integer.parseInt(params.getOrDefault("limit", "12"));
                    String searchTerm = params.getOrDefault("searchTerm", "");
                    
                    // Calcular offset para paginación
                    int offset = (page - 1) * limit;
                    
                    // Construir JSON con los resultados
                    StringBuilder jsonBuilder = new StringBuilder();
                    jsonBuilder.append("{\"data\":{\"results\":[");
                    
                    try (Connection conn = ConexionBD.getConnection()) {
                        // Consulta SQL para cómics
                        String sql = "SELECT c.id_comic, c.titulo, c.descripcion, c.numero_edicion, c.URL_imagen, s.nombre as serie_nombre " +
                                     "FROM COMIC c LEFT JOIN SERIE s ON c.id_serie = s.id_serie";
                        if (!searchTerm.isEmpty()) {
                            sql += " WHERE c.titulo LIKE ?";
                        }
                        sql += " LIMIT ? OFFSET ?";
                        
                        PreparedStatement stmt = conn.prepareStatement(sql);
                        int paramIndex = 1;
                        if (!searchTerm.isEmpty()) {
                            stmt.setString(paramIndex++, "%" + searchTerm + "%");
                        }
                        stmt.setInt(paramIndex++, limit);
                        stmt.setInt(paramIndex, offset);
                        
                        ResultSet rs = stmt.executeQuery();
                        
                        boolean first = true;
                        while (rs.next()) {
                            int id = rs.getInt("id_comic");
                            String title = rs.getString("titulo");
                            String description = rs.getString("descripcion");
                            int issueNumber = rs.getInt("numero_edicion");
                            String imageUrl = rs.getString("URL_imagen");
                            String serieName = rs.getString("serie_nombre");
                            
                            if (!first) {
                                jsonBuilder.append(",");
                            }
                            first = false;
                            
                            // Construir objeto JSON para un cómic
                            jsonBuilder.append("{");
                            jsonBuilder.append("\"id\":").append(id).append(",");
                            jsonBuilder.append("\"title\":\"").append(title.replace("\"", "\\\"")).append("\",");
                            jsonBuilder.append("\"description\":\"").append(description != null ? description.replace("\"", "\\\"") : "").append("\",");
                            jsonBuilder.append("\"issueNumber\":").append(issueNumber).append(",");
                            
                            // Thumbnail
                            String imagePath = formatImageUrl(imageUrl);
                            jsonBuilder.append("\"thumbnail\":{");
                            if (imagePath != null) {
                                // Dividir en path y extension
                                int dotIndex = imagePath.lastIndexOf('.');
                                String path = dotIndex > 0 ? imagePath.substring(0, dotIndex) : imagePath;
                                String extension = dotIndex > 0 ? imagePath.substring(dotIndex + 1) : "jpg";
                                
                                jsonBuilder.append("\"path\":\"").append(path).append("\",");
                                jsonBuilder.append("\"extension\":\"").append(extension).append("\"");
                            } else {
                                jsonBuilder.append("\"path\":\"https://via.placeholder.com/300x400\",");
                                jsonBuilder.append("\"extension\":\"jpg\"");
                            }
                            jsonBuilder.append("},");
                            
                            // Serie
                            jsonBuilder.append("\"series\":{\"name\":\"").append(serieName != null ? serieName.replace("\"", "\\\"") : "").append("\"},");
                            
                            // Universo
                            jsonBuilder.append("\"universe\":\"").append(assignUniverse(id)).append("\"");
                            
                            jsonBuilder.append("}");
                        }
                        
                        // Obtener el total de cómics para la paginación
                        String countSql = "SELECT COUNT(*) as total FROM COMIC";
                        if (!searchTerm.isEmpty()) {
                            countSql += " WHERE titulo LIKE ?";
                        }
                        
                        PreparedStatement countStmt = conn.prepareStatement(countSql);
                        if (!searchTerm.isEmpty()) {
                            countStmt.setString(1, "%" + searchTerm + "%");
                        }
                        
                        ResultSet countRs = countStmt.executeQuery();
                        int total = countRs.next() ? countRs.getInt("total") : 0;
                        
                        jsonBuilder.append("],");
                        jsonBuilder.append("\"total\":").append(total).append(",");
                        jsonBuilder.append("\"count\":").append(limit).append(",");
                        jsonBuilder.append("\"limit\":").append(limit).append(",");
                        jsonBuilder.append("\"offset\":").append(offset);
                        jsonBuilder.append("}}");
                        
                        sendJsonResponse(exchange, jsonBuilder.toString());
                    } catch (SQLException e) {
                        sendError(exchange, 500, "Error de base de datos: " + e.getMessage());
                    }
                } else if ("OPTIONS".equals(exchange.getRequestMethod())) {
                    handleOptionsRequest(exchange);
                } else {
                    sendError(exchange, 405, "Método no permitido");
                }
            } catch (Exception e) {
                sendError(exchange, 500, "Error interno del servidor: " + e.getMessage());
            }
        }
    }

    // Handler para el endpoint /api/series
    static class SeriesHandler extends BaseHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            try {
                if ("GET".equals(exchange.getRequestMethod())) {
                    // Implementación similar a CharactersHandler y ComicsHandler
                    URI uri = exchange.getRequestURI();
                    Map<String, String> params = parseQueryParams(uri.getQuery());
                    
                    // Extraer parámetros
                    int page = Integer.parseInt(params.getOrDefault("page", "1"));
                    int limit = Integer.parseInt(params.getOrDefault("limit", "12"));
                    String searchTerm = params.getOrDefault("searchTerm", "");
                    
                    int offset = (page - 1) * limit;
                    
                    // Construir JSON de respuesta para series
                    StringBuilder jsonBuilder = new StringBuilder();
                    jsonBuilder.append("{\"data\":{\"results\":[");
                    
                    try (Connection conn = ConexionBD.getConnection()) {
                        String sql = "SELECT id_serie, nombre, descripcion, fecha_inicio, fecha_fin, URL_imagen FROM SERIE";
                        if (!searchTerm.isEmpty()) {
                            sql += " WHERE nombre LIKE ?";
                        }
                        sql += " LIMIT ? OFFSET ?";
                        
                        PreparedStatement stmt = conn.prepareStatement(sql);
                        int paramIndex = 1;
                        if (!searchTerm.isEmpty()) {
                            stmt.setString(paramIndex++, "%" + searchTerm + "%");
                        }
                        stmt.setInt(paramIndex++, limit);
                        stmt.setInt(paramIndex, offset);
                        
                        ResultSet rs = stmt.executeQuery();
                        
                        boolean first = true;
                        while (rs.next()) {
                            int id = rs.getInt("id_serie");
                            String name = rs.getString("nombre");
                            String description = rs.getString("descripcion");
                            Date startDate = rs.getDate("fecha_inicio");
                            Date endDate = rs.getDate("fecha_fin");
                            String imageUrl = rs.getString("URL_imagen");
                            
                            if (!first) {
                                jsonBuilder.append(",");
                            }
                            first = false;
                            
                            jsonBuilder.append("{");
                            jsonBuilder.append("\"id\":").append(id).append(",");
                            jsonBuilder.append("\"title\":\"").append(name.replace("\"", "\\\"")).append("\",");
                            jsonBuilder.append("\"name\":\"").append(name.replace("\"", "\\\"")).append("\",");
                            jsonBuilder.append("\"description\":\"").append(description != null ? description.replace("\"", "\\\"") : "").append("\",");
                            
                            // Fechas
                            if (startDate != null) {
                                java.util.Calendar cal = java.util.Calendar.getInstance();
                                cal.setTime(startDate);
                                jsonBuilder.append("\"startYear\":").append(cal.get(java.util.Calendar.YEAR)).append(",");
                            } else {
                                jsonBuilder.append("\"startYear\":null,");
                            }
                            
                            if (endDate != null) {
                                java.util.Calendar cal = java.util.Calendar.getInstance();
                                cal.setTime(endDate);
                                jsonBuilder.append("\"endYear\":").append(cal.get(java.util.Calendar.YEAR)).append(",");
                            } else {
                                jsonBuilder.append("\"endYear\":null,");
                            }
                            
                            // Thumbnail
                            String imagePath = formatImageUrl(imageUrl);
                            jsonBuilder.append("\"thumbnail\":{");
                            if (imagePath != null) {
                                int dotIndex = imagePath.lastIndexOf('.');
                                String path = dotIndex > 0 ? imagePath.substring(0, dotIndex) : imagePath;
                                String extension = dotIndex > 0 ? imagePath.substring(dotIndex + 1) : "jpg";
                                
                                jsonBuilder.append("\"path\":\"").append(path).append("\",");
                                jsonBuilder.append("\"extension\":\"").append(extension).append("\"");
                            } else {
                                jsonBuilder.append("\"path\":\"https://via.placeholder.com/300x400\",");
                                jsonBuilder.append("\"extension\":\"jpg\"");
                            }
                            jsonBuilder.append("},");
                            
                            // Universo
                            jsonBuilder.append("\"universe\":\"").append(assignUniverse(id)).append("\"");
                            
                            jsonBuilder.append("}");
                        }
                        
                        // Contar total de series
                        String countSql = "SELECT COUNT(*) as total FROM SERIE";
                        if (!searchTerm.isEmpty()) {
                            countSql += " WHERE nombre LIKE ?";
                        }
                        
                        PreparedStatement countStmt = conn.prepareStatement(countSql);
                        if (!searchTerm.isEmpty()) {
                            countStmt.setString(1, "%" + searchTerm + "%");
                        }
                        
                        ResultSet countRs = countStmt.executeQuery();
                        int total = countRs.next() ? countRs.getInt("total") : 0;
                        
                        jsonBuilder.append("],");
                        jsonBuilder.append("\"total\":").append(total).append(",");
                        jsonBuilder.append("\"count\":").append(limit).append(",");
                        jsonBuilder.append("\"limit\":").append(limit).append(",");
                        jsonBuilder.append("\"offset\":").append(offset);
                        jsonBuilder.append("}}");
                        
                        sendJsonResponse(exchange, jsonBuilder.toString());
                    } catch (SQLException e) {
                        sendError(exchange, 500, "Error de base de datos: " + e.getMessage());
                    }
                } else if ("OPTIONS".equals(exchange.getRequestMethod())) {
                    handleOptionsRequest(exchange);
                } else {
                    sendError(exchange, 405, "Método no permitido");
                }
            } catch (Exception e) {
                sendError(exchange, 500, "Error interno del servidor: " + e.getMessage());
            }
        }
    }

    // Handler para el endpoint /api/events
    static class EventsHandler extends BaseHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            try {
                if ("GET".equals(exchange.getRequestMethod())) {
                    // Similar a los handlers anteriores
                    URI uri = exchange.getRequestURI();
                    Map<String, String> params = parseQueryParams(uri.getQuery());
                    
                    int page = Integer.parseInt(params.getOrDefault("page", "1"));
                    int limit = Integer.parseInt(params.getOrDefault("limit", "12"));
                    String searchTerm = params.getOrDefault("searchTerm", "");
                    
                    int offset = (page - 1) * limit;
                    
                    StringBuilder jsonBuilder = new StringBuilder();
                    jsonBuilder.append("{\"data\":{\"results\":[");
                    
                    try (Connection conn = ConexionBD.getConnection()) {
                        String sql = "SELECT id_evento, nombre, descripcion, fecha_inicio, fecha_fin FROM EVENTO";
                        if (!searchTerm.isEmpty()) {
                            sql += " WHERE nombre LIKE ?";
                        }
                        sql += " LIMIT ? OFFSET ?";
                        
                        PreparedStatement stmt = conn.prepareStatement(sql);
                        int paramIndex = 1;
                        if (!searchTerm.isEmpty()) {
                            stmt.setString(paramIndex++, "%" + searchTerm + "%");
                        }
                        stmt.setInt(paramIndex++, limit);
                        stmt.setInt(paramIndex, offset);
                        
                        ResultSet rs = stmt.executeQuery();
                        
                        boolean first = true;
                        while (rs.next()) {
                            int id = rs.getInt("id_evento");
                            String name = rs.getString("nombre");
                            String description = rs.getString("descripcion");
                            Date startDate = rs.getDate("fecha_inicio");
                            Date endDate = rs.getDate("fecha_fin");
                            
                            if (!first) {
                                jsonBuilder.append(",");
                            }
                            first = false;
                            
                            jsonBuilder.append("{");
                            jsonBuilder.append("\"id\":").append(id).append(",");
                            jsonBuilder.append("\"title\":\"").append(name.replace("\"", "\\\"")).append("\",");
                            jsonBuilder.append("\"name\":\"").append(name.replace("\"", "\\\"")).append("\",");
                            jsonBuilder.append("\"description\":\"").append(description != null ? description.replace("\"", "\\\"") : "").append("\",");
                            
                            // Fechas
                            if (startDate != null) {
                                jsonBuilder.append("\"start\":\"").append(startDate.toString()).append("\",");
                            } else {
                                jsonBuilder.append("\"start\":null,");
                            }
                            
                            if (endDate != null) {
                                jsonBuilder.append("\"end\":\"").append(endDate.toString()).append("\",");
                            } else {
                                jsonBuilder.append("\"end\":null,");
                            }
                            
                            // En esta tabla no hay URL_imagen, así que usamos un placeholder
                            jsonBuilder.append("\"thumbnail\":{");
                            jsonBuilder.append("\"path\":\"https://via.placeholder.com/300x400?text=Event\",");
                            jsonBuilder.append("\"extension\":\"jpg\"");
                            jsonBuilder.append("},");
                            
                            // Universo
                            jsonBuilder.append("\"universe\":\"").append(assignUniverse(id)).append("\"");
                            
                            jsonBuilder.append("}");
                        }
                        
                        // Contar total de eventos
                        String countSql = "SELECT COUNT(*) as total FROM EVENTO";
                        if (!searchTerm.isEmpty()) {
                            countSql += " WHERE nombre LIKE ?";
                        }
                        
                        PreparedStatement countStmt = conn.prepareStatement(countSql);
                        if (!searchTerm.isEmpty()) {
                            countStmt.setString(1, "%" + searchTerm + "%");
                        }
                        
                        ResultSet countRs = countStmt.executeQuery();
                        int total = countRs.next() ? countRs.getInt("total") : 0;
                        
                        jsonBuilder.append("],");
                        jsonBuilder.append("\"total\":").append(total).append(",");
                        jsonBuilder.append("\"count\":").append(limit).append(",");
                        jsonBuilder.append("\"limit\":").append(limit).append(",");
                        jsonBuilder.append("\"offset\":").append(offset);
                        jsonBuilder.append("}}");
                        
                        sendJsonResponse(exchange, jsonBuilder.toString());
                    } catch (SQLException e) {
                        sendError(exchange, 500, "Error de base de datos: " + e.getMessage());
                    }
                } else if ("OPTIONS".equals(exchange.getRequestMethod())) {
                    handleOptionsRequest(exchange);
                } else {
                    sendError(exchange, 405, "Método no permitido");
                }
            } catch (Exception e) {
                sendError(exchange, 500, "Error interno del servidor: " + e.getMessage());
            }
        }
    }

    // Handler para el endpoint /api/favorites
    static class FavoritesHandler extends BaseHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            try {
                String method = exchange.getRequestMethod();
                
                if ("OPTIONS".equals(method)) {
                    handleOptionsRequest(exchange);
                    return;
                }
                
                URI uri = exchange.getRequestURI();
                Map<String, String> params = parseQueryParams(uri.getQuery());
                
                // Parámetros obligatorios
                int userId = Integer.parseInt(params.getOrDefault("userId", "1")); // Usuario por defecto si no se especifica
                
                if ("GET".equals(method)) {
                    // Obtener favoritos
                    String type = params.getOrDefault("type", "characters");
                    getFavorites(exchange, userId, type);
                } else if ("POST".equals(method)) {
                    // Añadir favorito
                    String requestBody = readRequestBody(exchange);
                    Map<String, String> bodyParams = parseSimpleJson(requestBody);
                    
                    int itemId = Integer.parseInt(bodyParams.getOrDefault("itemId", "0"));
                    String type = bodyParams.getOrDefault("type", "characters");
                    
                    if (itemId <= 0) {
                        sendError(exchange, 400, "Se requiere itemId válido");
                        return;
                    }
                    
                    addFavorite(exchange, userId, itemId, type);
                } else if ("DELETE".equals(method)) {
                    // Eliminar favorito
                    String requestBody = readRequestBody(exchange);
                    Map<String, String> bodyParams = parseSimpleJson(requestBody);
                    
                    int itemId = Integer.parseInt(bodyParams.getOrDefault("itemId", "0"));
                    String type = bodyParams.getOrDefault("type", "characters");
                    
                    if (itemId <= 0) {
                        sendError(exchange, 400, "Se requiere itemId válido");
                        return;
                    }
                    
                    removeFavorite(exchange, userId, itemId, type);
                } else {
                    sendError(exchange, 405, "Método no permitido");
                }
            } catch (Exception e) {
                sendError(exchange, 500, "Error interno del servidor: " + e.getMessage());
            }
        }
        
        // Obtener favoritos de un usuario
        private void getFavorites(HttpExchange exchange, int userId, String type) throws IOException {
            StringBuilder jsonBuilder = new StringBuilder();
            jsonBuilder.append("{\"data\":{\"results\":[");
            
            try (Connection conn = ConexionBD.getConnection()) {
                String sql = "";
                String idField = "";
                
                if ("characters".equals(type)) {
                    sql = "SELECT p.id_personaje as id, p.nombre as name, p.descripcion as description, " +
                          "p.URL_imagen as image_url FROM FAVORITOS f " +
                          "JOIN PERSONAJE p ON f.id_personaje = p.id_personaje " +
                          "WHERE f.id_usuario = ? AND f.id_personaje IS NOT NULL";
                    idField = "id_personaje";
                } else if ("comics".equals(type)) {
                    sql = "SELECT c.id_comic as id, c.titulo as title, c.descripcion as description, " +
                          "c.URL_imagen as image_url FROM FAVORITOS f " +
                          "JOIN COMIC c ON f.id_comic = c.id_comic " +
                          "WHERE f.id_usuario = ? AND f.id_comic IS NOT NULL";
                    idField = "id_comic";
                } else if ("series".equals(type)) {
                    sql = "SELECT s.id_serie as id, s.nombre as name, s.descripcion as description, " +
                          "s.URL_imagen as image_url FROM FAVORITOS f " +
                          "JOIN SERIE s ON f.id_serie = s.id_serie " +
                          "WHERE f.id_usuario = ? AND f.id_serie IS NOT NULL";
                    idField = "id_serie";
                } else {
                    sendError(exchange, 400, "Tipo no válido: " + type);
                    return;
                }
                
                PreparedStatement stmt = conn.prepareStatement(sql);
                stmt.setInt(1, userId);
                
                ResultSet rs = stmt.executeQuery();
                
                boolean first = true;
                while (rs.next()) {
                    int id = rs.getInt("id");
                    String imageUrl = rs.getString("image_url");
                    
                    if (!first) {
                        jsonBuilder.append(",");
                    }
                    first = false;
                    
                    jsonBuilder.append("{");
                    jsonBuilder.append("\"id\":").append(id).append(",");
                    
                    if ("characters".equals(type)) {
                        String name = rs.getString("name");
                        String description = rs.getString("description");
                        
                        jsonBuilder.append("\"name\":\"").append(name != null ? name.replace("\"", "\\\"") : "").append("\",");
                        jsonBuilder.append("\"description\":\"").append(description != null ? description.replace("\"", "\\\"") : "").append("\",");
                        
                        // Añadir información de cómics
                        int comicsCount = getComicsCountForCharacter(conn, id);
                        jsonBuilder.append("\"comics\":{\"available\":").append(comicsCount).append("},");
                    } else if ("comics".equals(type) || "series".equals(type)) {
                        String title = rs.getString("title");
                        if (title == null) title = rs.getString("name");
                        String description = rs.getString("description");
                        
                        jsonBuilder.append("\"title\":\"").append(title != null ? title.replace("\"", "\\\"") : "").append("\",");
                        if ("series".equals(type)) {
                            jsonBuilder.append("\"name\":\"").append(title != null ? title.replace("\"", "\\\"") : "").append("\",");
                        }
                        jsonBuilder.append("\"description\":\"").append(description != null ? description.replace("\"", "\\\"") : "").append("\",");
                    }
                    
                    // Thumbnail
                    String imagePath = formatImageUrl(imageUrl);
                    jsonBuilder.append("\"thumbnail\":{");
                    if (imagePath != null) {
                        int dotIndex = imagePath.lastIndexOf('.');
                        String path = dotIndex > 0 ? imagePath.substring(0, dotIndex) : imagePath;
                        String extension = dotIndex > 0 ? imagePath.substring(dotIndex + 1) : "jpg";
                        
                        jsonBuilder.append("\"path\":\"").append(path).append("\",");
                        jsonBuilder.append("\"extension\":\"").append(extension).append("\"");
                    } else {
                        jsonBuilder.append("\"path\":\"https://via.placeholder.com/300x400\",");
                        jsonBuilder.append("\"extension\":\"jpg\"");
                    }
                    jsonBuilder.append("},");
                    
                    // Universo
                    jsonBuilder.append("\"universe\":\"").append(assignUniverse(id)).append("\"");
                    
                    jsonBuilder.append("}");
                }
                
                // Contar total de favoritos
                String countSql = "SELECT COUNT(*) as total FROM FAVORITOS " +
                                 "WHERE id_usuario = ? AND " + idField + " IS NOT NULL";
                
                PreparedStatement countStmt = conn.prepareStatement(countSql);
                countStmt.setInt(1, userId);
                
                ResultSet countRs = countStmt.executeQuery();
                int total = countRs.next() ? countRs.getInt("total") : 0;
                
                jsonBuilder.append("],");
                jsonBuilder.append("\"total\":").append(total).append(",");
                jsonBuilder.append("\"count\":").append(total);
                jsonBuilder.append("}}");
                
                sendJsonResponse(exchange, jsonBuilder.toString());
            } catch (SQLException e) {
                sendError(exchange, 500, "Error de base de datos: " + e.getMessage());
            }
        }
        
        // Añadir un favorito
        private void addFavorite(HttpExchange exchange, int userId, int itemId, String type) throws IOException {
            try (Connection conn = ConexionBD.getConnection()) {
                // Verificar si ya existe el favorito
                String checkSql = "SELECT id_favoritos FROM FAVORITOS WHERE id_usuario = ?";
                String idField = "";
                
                if ("characters".equals(type)) {
                    checkSql += " AND id_personaje = ?";
                    idField = "id_personaje";
                } else if ("comics".equals(type)) {
                    checkSql += " AND id_comic = ?";
                    idField = "id_comic";
                } else if ("series".equals(type)) {
                    checkSql += " AND id_serie = ?";
                    idField = "id_serie";
                } else {
                    sendError(exchange, 400, "Tipo no válido: " + type);
                    return;
                }
                
                PreparedStatement checkStmt = conn.prepareStatement(checkSql);
                checkStmt.setInt(1, userId);
                checkStmt.setInt(2, itemId);
                
                ResultSet checkRs = checkStmt.executeQuery();
                if (checkRs.next()) {
                    // Ya existe, devolver éxito
                    sendJsonResponse(exchange, "{\"result\":\"success\",\"message\":\"Ya existe en favoritos\"}");
                    return;
                }
                
                // No existe, insertar nuevo favorito
                String insertSql = "INSERT INTO FAVORITOS (id_usuario";
                if ("characters".equals(type)) {
                    insertSql += ", id_personaje, id_comic, id_serie) VALUES (?, ?, NULL, NULL)";
                } else if ("comics".equals(type)) {
                    insertSql += ", id_personaje, id_comic, id_serie) VALUES (?, NULL, ?, NULL)";
                } else if ("series".equals(type)) {
                    insertSql += ", id_personaje, id_comic, id_serie) VALUES (?, NULL, NULL, ?)";
                }
                
                PreparedStatement insertStmt = conn.prepareStatement(insertSql);
                insertStmt.setInt(1, userId);
                insertStmt.setInt(2, itemId);
                
                int affectedRows = insertStmt.executeUpdate();
                
                if (affectedRows > 0) {
                    sendJsonResponse(exchange, "{\"result\":\"success\",\"message\":\"Añadido a favoritos\"}");
                } else {
                    sendError(exchange, 500, "No se pudo añadir a favoritos");
                }
            } catch (SQLException e) {
                sendError(exchange, 500, "Error de base de datos: " + e.getMessage());
            }
        }
        
        // Eliminar un favorito
        private void removeFavorite(HttpExchange exchange, int userId, int itemId, String type) throws IOException {
            try (Connection conn = ConexionBD.getConnection()) {
                String deleteSql = "DELETE FROM FAVORITOS WHERE id_usuario = ?";
                
                if ("characters".equals(type)) {
                    deleteSql += " AND id_personaje = ?";
                } else if ("comics".equals(type)) {
                    deleteSql += " AND id_comic = ?";
                } else if ("series".equals(type)) {
                    deleteSql += " AND id_serie = ?";
                } else {
                    sendError(exchange, 400, "Tipo no válido: " + type);
                    return;
                }
                
                PreparedStatement deleteStmt = conn.prepareStatement(deleteSql);
                deleteStmt.setInt(1, userId);
                deleteStmt.setInt(2, itemId);
                
                int affectedRows = deleteStmt.executeUpdate();
                
                if (affectedRows > 0) {
                    sendJsonResponse(exchange, "{\"result\":\"success\",\"message\":\"Eliminado de favoritos\"}");
                } else {
                    sendError(exchange, 404, "No se encontró en favoritos");
                }
            } catch (SQLException e) {
                sendError(exchange, 500, "Error de base de datos: " + e.getMessage());
            }
        }
        
        // Obtener el número de cómics de un personaje
        private int getComicsCountForCharacter(Connection conn, int characterId) {
            try {
                String sql = "SELECT COUNT(*) as count FROM COMIC_PERSONAJE WHERE id_personaje = ?";
                PreparedStatement stmt = conn.prepareStatement(sql);
                stmt.setInt(1, characterId);
                ResultSet rs = stmt.executeQuery();
                
                if (rs.next()) {
                    return rs.getInt("count");
                }
            } catch (SQLException e) {
                System.err.println("Error al obtener el número de cómics: " + e.getMessage());
            }
            return 0;
        }
    }

    // Handler opcional para servir archivos estáticos (HTML, CSS, JS)
    static class StaticFileHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            // Implementación para servir archivos estáticos si es necesario
            // (Por simplicidad, no se implementa completamente aquí)
            String path = exchange.getRequestURI().getPath();
            
            // Por ahora, solo responde con un mensaje genérico
            if (path.equals("/") || path.equals("/index.html")) {
                String response = 
                    "<!DOCTYPE html>" +
                    "<html lang=\"es\">" +
                    "<head>" +
                    "    <meta charset=\"UTF-8\">" +
                    "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">" +
                    "    <title>Marvel API Server</title>" +
                    "    <style>" +
                    "        body {" +
                    "            font-family: Arial, sans-serif;" +
                    "            background-color: #151515;" +
                    "            color: #f0f0f0;" +
                    "            margin: 0;" +
                    "            padding: 20px;" +
                    "        }" +
                    "        h1 {" +
                    "            color: #e62429;" +
                    "        }" +
                    "        ul {" +
                    "            list-style-type: none;" +
                    "            padding: 0;" +
                    "        }" +
                    "        li {" +
                    "            margin-bottom: 10px;" +
                    "            padding: 10px;" +
                    "            background-color: #202020;" +
                    "            border-radius: 5px;" +
                    "        }" +
                    "        a {" +
                    "            color: #e62429;" +
                    "            text-decoration: none;" +
                    "        }" +
                    "        a:hover {" +
                    "            text-decoration: underline;" +
                    "        }" +
                    "    </style>" +
                    "</head>" +
                    "<body>" +
                    "    <h1>Marvel API Server</h1>" +
                    "    <p>El servidor está ejecutándose correctamente. Utiliza los siguientes endpoints:</p>" +
                    "    <ul>" +
                    "        <li><a href=\"/api/characters\">/api/characters</a> - Obtener personajes</li>" +
                    "        <li><a href=\"/api/comics\">/api/comics</a> - Obtener cómics</li>" +
                    "        <li><a href=\"/api/series\">/api/series</a> - Obtener series</li>" +
                    "        <li><a href=\"/api/events\">/api/events</a> - Obtener eventos</li>" +
                    "        <li><a href=\"/api/favorites?userId=1&type=characters\">/api/favorites</a> - Gestionar favoritos</li>" +
                    "    </ul>" +
                    "</body>" +
                    "</html>";
                
                exchange.getResponseHeaders().set("Content-Type", "text/html; charset=UTF-8");
                exchange.sendResponseHeaders(200, response.getBytes().length);
                OutputStream os = exchange.getResponseBody();
                os.write(response.getBytes());
                os.close();
            } else {
                exchange.sendResponseHeaders(404, -1);
            }
        }
    }
}