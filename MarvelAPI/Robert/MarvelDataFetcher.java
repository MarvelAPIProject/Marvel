package com.marvel;

import org.json.JSONObject;
import org.json.JSONArray;
import java.io.FileInputStream;
import java.io.File;
import java.io.FileWriter;
import java.util.Properties;


public class MarvelDataFetcher {

    public static void main(String[] args) {
        try {
            // Load configuration
            Properties config = new Properties();
            config.load(new FileInputStream("config.properties"));
            // Initialize components
            MarvelApiClient apiClient = new MarvelApiClient(config);
            XmlGenerator xmlGenerator = new XmlGenerator(config);
            DatabaseLoader dbLoader = new DatabaseLoader(config);

            // Create output directory if it doesn't exist
            File outputDir = new File(config.getProperty("xml.outputDir"));
            if (!outputDir.exists()) {
                outputDir.mkdirs();
            }

            System.out.println("Starting Marvel data fetching process...");
            
            // Fetch, convert to XML, and load characters
            fetchAndProcessData(apiClient, xmlGenerator, dbLoader, "characters", 100);
            
            // Fetch, convert to XML, and load comics
            fetchAndProcessData(apiClient, xmlGenerator, dbLoader, "comics", 100);
            
            // Fetch, convert to XML, and load events
            fetchAndProcessData(apiClient, xmlGenerator, dbLoader, "events", 100);
            
            // Fetch, convert to XML, and load series
            fetchAndProcessData(apiClient, xmlGenerator, dbLoader, "series", 100);

            System.out.println("Data fetching, XML generation, and database loading completed successfully!");

        } catch (Exception e) {
            System.err.println("Error in Marvel data fetching process:");
            e.printStackTrace();
        }
    }
    
    private static void fetchAndProcessData(MarvelApiClient apiClient, XmlGenerator xmlGenerator, 
                                           DatabaseLoader dbLoader, String dataType, int limit) throws Exception {
        System.out.println("Processing " + dataType + "...");
        int offset = 0;
        boolean hasMore = true;
        int total = 0;
        int processed = 0;

        while (hasMore) {
            JSONObject data = apiClient.fetchData(dataType, offset, limit);
            if (data != null && data.has("data")) {
                JSONObject dataObj = data.getJSONObject("data");
                total = dataObj.getInt("total");
                
                // Generate XML for this batch
                String xmlFilePath = xmlGenerator.generateXml(data, dataType, offset);
                System.out.println("Generated XML for " + dataType + " batch at offset " + offset);
                
                // Load this batch into database
                dbLoader.loadData(xmlFilePath, dataType);
                System.out.println("Loaded " + dataType + " batch into database");
                
                processed += dataObj.getJSONArray("results").length();
                System.out.println("Processed " + processed + " of " + total + " " + dataType);
                
                offset += limit;
                hasMore = offset < total;
                
                // Add a small delay to avoid rate limiting
                Thread.sleep(1000);
            } else {
                System.out.println("No data received for " + dataType + " at offset " + offset);
                hasMore = false;
            }
        }
        
        System.out.println("Completed processing " + dataType + ": " + processed + " records");
    }
}
