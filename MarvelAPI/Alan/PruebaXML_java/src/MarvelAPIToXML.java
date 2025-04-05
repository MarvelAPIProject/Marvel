import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

public class MarvelAPIToXML {

    private static final String PUBLIC_KEY = "dd0b4fdacdd0b53c744fb36389d154db";
    private static final String PRIVATE_KEY = "360fa86fb66f723c45b84fb38e08c7477fbf29f2";

    public static void main(String[] args) {
        try {
            int offset = 0;
            int limit = 100; // Máximo permitido por la API
            int totalCharacters = 0;
            int totalAvailable = 0;
            
            // Usamos ID como identificador único (más preciso que solo nombre)
            Set<String> uniqueCharacterIds = new HashSet<>();
            StringBuilder xmlBuilder = new StringBuilder();

            // Encabezado XML
            xmlBuilder.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
            xmlBuilder.append("<marvel>\n");
            xmlBuilder.append("  <characters>\n");

            boolean hasMoreResults = true;
            
            while (hasMoreResults && totalCharacters < 5000) {
                String json = fetchMarvelJSON(offset, limit);
                System.out.println("Obteniendo personajes del offset: " + offset);
                
                // Extraer el total disponible desde la respuesta de la API
                if (totalAvailable == 0) {
                    String totalPattern = "\"total\"\\s*:\\s*(\\d+)";
                    java.util.regex.Pattern pattern = java.util.regex.Pattern.compile(totalPattern);
                    java.util.regex.Matcher matcher = pattern.matcher(json);
                    if (matcher.find()) {
                        totalAvailable = Integer.parseInt(matcher.group(1));
                        System.out.println("Total de personajes disponibles según la API: " + totalAvailable);
                    }
                }

                // Procesamos la página actual
                int charactersInPage = processPage(json, xmlBuilder, uniqueCharacterIds);
                totalCharacters += charactersInPage;

                System.out.println("Personajes obtenidos en esta página: " + charactersInPage);
                System.out.println("Total acumulado: " + totalCharacters);

                // Si no obtenemos más personajes o llegamos al final, salimos del bucle
                if (charactersInPage == 0 || offset + limit >= totalAvailable) {
                    hasMoreResults = false;
                    System.out.println("No hay más resultados disponibles o se ha alcanzado el límite de la API.");
                } else {
                    // Incrementamos el offset
                    offset += limit;
                    
                    // Pausa para evitar superar límites de rate de la API
                    Thread.sleep(1000);
                }
            }

            xmlBuilder.append("  </characters>\n");
            xmlBuilder.append("</marvel>");

            // Guardar XML
            String filePath = "marvel_characters.xml";
            saveXMLToFile(xmlBuilder.toString(), filePath);
            System.out.println("Archivo XML generado con " + totalCharacters + " personajes en: " + filePath);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private static String fetchMarvelJSON(int offset, int limit) throws Exception {
        long ts = Instant.now().getEpochSecond();
        String hash = md5(ts + PRIVATE_KEY + PUBLIC_KEY);
        String urlString = String.format(
            "https://gateway.marvel.com/v1/public/characters?ts=%d&apikey=%s&hash=%s&offset=%d&limit=%d",
            ts, PUBLIC_KEY, hash, offset, limit);

        URL url = new URL(urlString);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setRequestMethod("GET");
        connection.setRequestProperty("Accept", "application/json");
        
        // Aumentar timeout para conexiones lentas
        connection.setConnectTimeout(10000);
        connection.setReadTimeout(10000);

        int responseCode = connection.getResponseCode();
        if (responseCode != 200) {
            throw new RuntimeException("Error HTTP: " + responseCode + " - " + connection.getResponseMessage());
        }

        StringBuilder response = new StringBuilder();
        try (BufferedReader br = new BufferedReader(new InputStreamReader(connection.getInputStream()))) {
            String line;
            while ((line = br.readLine()) != null) {
                response.append(line);
            }
        }

        return response.toString();
    }

    private static int processPage(String json, StringBuilder xmlBuilder, Set<String> uniqueCharacterIds) {
        int count = 0;
        int resultsStart = json.indexOf("\"results\":[");
        
        if (resultsStart > 0) {
            int arrayStart = json.indexOf("[", resultsStart);
            int arrayEnd = findMatchingBracket(json, arrayStart);
            
            if (arrayStart > 0 && arrayEnd > arrayStart) {
                String arrayContent = json.substring(arrayStart + 1, arrayEnd);
                int pos = 0;
                
                while (pos < arrayContent.length()) {
                    int objStart = arrayContent.indexOf("{", pos);
                    if (objStart < 0) break;
                    
                    int objEnd = findMatchingBracket(arrayContent, objStart);
                    if (objEnd < 0) break;
                    
                    String characterJson = arrayContent.substring(objStart, objEnd + 1);
                    String id = extractField(characterJson, "id");
                    
                    // Solo usamos ID como identificador único
                    if (id != null && uniqueCharacterIds.add(id)) {
                        // Convertir el objeto JSON del personaje a XML
                        xmlBuilder.append(convertCharacterToXML(characterJson));
                        count++;
                    }
                    
                    pos = objEnd + 1;
                }
            }
        }
        return count;
    }

    private static String convertCharacterToXML(String characterJson) {
        StringBuilder characterXml = new StringBuilder();
        characterXml.append("    <character>\n");
        
        // Campos básicos
        appendField(characterXml, characterJson, "id", "      ");
        appendField(characterXml, characterJson, "name", "      ");
        appendField(characterXml, characterJson, "description", "      ");
        
        // Thumbnail
        String thumbnail = extractThumbnail(characterJson);
        if (thumbnail != null) {
            characterXml.append("      <thumbnail>").append(escapeXml(thumbnail)).append("</thumbnail>\n");
        }
        
        // Comics
        String comics = extractItems(characterJson, "comics");
        if (comics != null) {
            characterXml.append("      <comics>\n").append(comics).append("      </comics>\n");
        }
        
        // Series
        String series = extractItems(characterJson, "series");
        if (series != null) {
            characterXml.append("      <series>\n").append(series).append("      </series>\n");
        }
        
        // Stories
        String stories = extractItems(characterJson, "stories");
        if (stories != null) {
            characterXml.append("      <stories>\n").append(stories).append("      </stories>\n");
        }
        
        // Events
        String events = extractItems(characterJson, "events");
        if (events != null) {
            characterXml.append("      <events>\n").append(events).append("      </events>\n");
        }
        
        // URLs
        String urls = extractUrls(characterJson);
        if (urls != null) {
            characterXml.append("      <urls>\n").append(urls).append("      </urls>\n");
        }
        
        characterXml.append("    </character>\n");
        return characterXml.toString();
    }

    private static void appendField(StringBuilder xml, String json, String fieldName, String indent) {
        String value = extractField(json, fieldName);
        if (value != null) {
            xml.append(indent).append("<").append(fieldName).append(">")
               .append(escapeXml(value))
               .append("</").append(fieldName).append(">\n");
        }
    }

    private static String extractThumbnail(String json) {
        String thumbnailPattern = "\"thumbnail\"\\s*:\\s*\\{([^}]*)\\}";
        java.util.regex.Pattern r = java.util.regex.Pattern.compile(thumbnailPattern);
        java.util.regex.Matcher m = r.matcher(json);
        
        if (m.find()) {
            String thumbnailObj = m.group(1);
            String path = extractField(thumbnailObj, "path");
            String extension = extractField(thumbnailObj, "extension");
            
            if (path != null && extension != null) {
                return path + "." + extension;
            }
        }
        return null;
    }

    private static String extractItems(String json, String itemsType) {
        String itemsPattern = "\"" + itemsType + "\"\\s*:\\s*\\{\\s*\"available\"\\s*:\\s*\\d+\\s*,\\s*\"items\"\\s*:\\s*\\[([^\\]]*)\\]";
        java.util.regex.Pattern r = java.util.regex.Pattern.compile(itemsPattern, java.util.regex.Pattern.DOTALL);
        java.util.regex.Matcher m = r.matcher(json);
        
        if (m.find()) {
            String itemsArray = m.group(1);
            StringBuilder itemsXml = new StringBuilder();
            
            int pos = 0;
            while (pos < itemsArray.length()) {
                int objStart = itemsArray.indexOf("{", pos);
                if (objStart < 0) break;
                
                int objEnd = findMatchingBracket(itemsArray, objStart);
                if (objEnd < 0) break;
                
                String itemObj = itemsArray.substring(objStart, objEnd + 1);
                String name = extractField(itemObj, "name");
                String resourceURI = extractField(itemObj, "resourceURI");
                
                if (name != null) {
                    itemsXml.append("        <item>\n");
                    itemsXml.append("          <name>").append(escapeXml(name)).append("</name>\n");
                    if (resourceURI != null) {
                        itemsXml.append("          <resourceURI>").append(escapeXml(resourceURI)).append("</resourceURI>\n");
                    }
                    itemsXml.append("        </item>\n");
                }
                
                pos = objEnd + 1;
            }
            
            return itemsXml.toString();
        }
        return null;
    }

    private static String extractUrls(String json) {
        String urlsPattern = "\"urls\"\\s*:\\s*\\[([^\\]]*)\\]";
        java.util.regex.Pattern r = java.util.regex.Pattern.compile(urlsPattern);
        java.util.regex.Matcher m = r.matcher(json);
        
        if (m.find()) {
            String urlsArray = m.group(1);
            StringBuilder urlsXml = new StringBuilder();
            
            int pos = 0;
            while (pos < urlsArray.length()) {
                int objStart = urlsArray.indexOf("{", pos);
                if (objStart < 0) break;
                
                int objEnd = findMatchingBracket(urlsArray, objStart);
                if (objEnd < 0) break;
                
                String urlObj = urlsArray.substring(objStart, objEnd + 1);
                String type = extractField(urlObj, "type");
                String url = extractField(urlObj, "url");
                
                if (type != null && url != null) {
                    urlsXml.append("        <url type=\"").append(escapeXml(type)).append("\">")
                          .append(escapeXml(url)).append("</url>\n");
                }
                
                pos = objEnd + 1;
            }
            
            return urlsXml.toString();
        }
        return null;
    }

    private static String extractField(String json, String fieldName) {
        // Primero intentamos extraer strings
        String stringPattern = "\"" + fieldName + "\"\\s*:\\s*\"([^\"]*)\"";
        java.util.regex.Pattern r = java.util.regex.Pattern.compile(stringPattern);
        java.util.regex.Matcher m = r.matcher(json);
        
        if (m.find()) {
            return m.group(1);
        }
        
        // Si no es string, intentamos con números
        String numberPattern = "\"" + fieldName + "\"\\s*:\\s*(\\d+)";
        r = java.util.regex.Pattern.compile(numberPattern);
        m = r.matcher(json);
        
        if (m.find()) {
            return m.group(1);
        }
        
        return null;
    }

    private static int findMatchingBracket(String text, int openPos) {
        char openChar = text.charAt(openPos);
        char closeChar = (openChar == '{') ? '}' : (openChar == '[') ? ']' : ')';
        
        int count = 1;
        for (int i = openPos + 1; i < text.length(); i++) {
            char c = text.charAt(i);
            if (c == openChar) count++;
            else if (c == closeChar) count--;
            
            if (count == 0) return i;
        }
        return -1;
    }

    private static String escapeXml(String input) {
        if (input == null) return "";
        return input.replace("&", "&amp;")
                   .replace("<", "&lt;")
                   .replace(">", "&gt;")
                   .replace("\"", "&quot;")
                   .replace("'", "&apos;");
    }

    private static void saveXMLToFile(String xml, String filePath) throws IOException {
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(filePath))) {
            writer.write(xml);
        }
    }

    private static String md5(String input) throws Exception {
        MessageDigest md = MessageDigest.getInstance("MD5");
        byte[] hashBytes = md.digest(input.getBytes());
        StringBuilder hexString = new StringBuilder();
        for (byte b : hashBytes) {
            hexString.append(String.format("%02x", b));
        }
        return hexString.toString();
    }
}