package com.marvel;
import java.net.URI;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Properties;

import org.apache.http.HttpEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.utils.URIBuilder;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.json.JSONObject;

public class MarvelApiClient {

    private final String publicKey;
    private final String privateKey;
    private final String baseUrl;

    public MarvelApiClient(Properties config) {
        this.publicKey = config.getProperty("marvel.api.publicKey");
        this.privateKey = config.getProperty("marvel.api.privateKey");
        this.baseUrl = config.getProperty("marvel.api.baseUrl");
    }

    public JSONObject fetchData(String endpoint, int offset, int limit) throws Exception {
        CloseableHttpClient httpClient = HttpClients.createDefault();
        try {
            long ts = System.currentTimeMillis();
            String hash = generateHash(ts);

            URI uri = new URIBuilder(baseUrl + "/" + endpoint)
                    .addParameter("ts", String.valueOf(ts))
                    .addParameter("apikey", publicKey)
                    .addParameter("hash", hash)
                    .addParameter("offset", String.valueOf(offset))
                    .addParameter("limit", String.valueOf(limit))
                    .build();

            HttpGet request = new HttpGet(uri);
            request.setHeader("Accept", "application/json");
            
            System.out.println("Fetching from " + uri);
            
            CloseableHttpResponse response = httpClient.execute(request);
            try {
                int statusCode = response.getStatusLine().getStatusCode();
                if (statusCode == 200) {
                    HttpEntity entity = response.getEntity();
                    if (entity != null) {
                        String result = EntityUtils.toString(entity);
                        return new JSONObject(result);
                    }
                } else {
                    System.err.println("API request failed with status code: " + statusCode);
                    System.err.println("Response: " + EntityUtils.toString(response.getEntity()));
                }
            } finally {
                response.close();
            }
        } catch (Exception e) {
            System.err.println("Error fetching data from Marvel API:");
            e.printStackTrace();
            throw e;
        } finally {
            httpClient.close();
        }
        return null;
    }

    private String generateHash(long ts) {
        try {
            String input = ts + privateKey + publicKey;
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] digest = md.digest(input.getBytes());
            StringBuilder sb = new StringBuilder();
            for (byte b : digest) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Could not generate MD5 hash", e);
        }
    }
}
