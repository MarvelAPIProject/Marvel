import org.apache.http.HttpEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.json.JSONObject;
import org.json.XML;

import java.io.FileWriter;
import java.io.IOException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public class MarvelApiToXml {
    
    public static void main(String[] args) {
        String publicKey = "TU_PUBLIC_KEY";
        String privateKey = "TU_PRIVATE_KEY";
        String ts = String.valueOf(System.currentTimeMillis());
        String hash = generateMD5(ts + privateKey + publicKey);
        
        String url = "https://gateway.marvel.com/v1/public/characters" +
                     "?ts=" + ts +
                     "&apikey=" + publicKey +
                     "&hash=" + hash +
                     "&limit=100"; // Limita los resultados
        
        try {
            // 1. Obtener datos de la API
            String jsonResponse = getApiData(url);
            
            // 2. Convertir JSON a XML
            String xml = convertJsonToXml(jsonResponse);
            
            // 3. Guardar XML en archivo
            saveXmlToFile(xml, "marvel_data.xml");
            
            System.out.println("Datos convertidos y guardados correctamente en marvel_data.xml");
            
        } catch (IOException e) {
            System.err.println("Error al procesar la API: " + e.getMessage());
        }
    }
    
    private static String getApiData(String url) throws IOException {
        CloseableHttpClient httpClient = HttpClients.createDefault();
        HttpGet request = new HttpGet(url);
        
        try (CloseableHttpResponse response = httpClient.execute(request)) {
            HttpEntity entity = response.getEntity();
            if (entity != null) {
                return EntityUtils.toString(entity);
            }
        }
        return null;
    }
    
    private static String convertJsonToXml(String jsonString) {
        JSONObject jsonObject = new JSONObject(jsonString);
        // Convertir JSON a XML con indentación de 4 espacios
        return XML.toString(jsonObject, "marvelData", 4);
    }
    
    private static void saveXmlToFile(String xml, String filename) throws IOException {
        try (FileWriter fileWriter = new FileWriter(filename)) {
            fileWriter.write(xml);
        }
    }
    
    private static String generateMD5(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] messageDigest = md.digest(input.getBytes());
            
            StringBuilder hexString = new StringBuilder();
            for (byte b : messageDigest) {
                hexString.append(String.format("%02x", b));
            }
            return hexString.toString();
            
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error generando MD5", e);
        }
    }
}