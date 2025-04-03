package com.marvel;

import java.io.File;
import java.util.Properties;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;

import org.json.JSONArray;
import org.json.JSONObject;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

public class XmlGenerator {

    private final String outputDir;

    public XmlGenerator(Properties config) {
        this.outputDir = config.getProperty("xml.outputDir");
    }

    public String generateXml(JSONObject jsonData, String dataType, int offset) throws Exception {
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        DocumentBuilder builder = factory.newDocumentBuilder();
        Document doc = builder.newDocument();

        // Create root element
        Element rootElement = doc.createElement(dataType);
        doc.appendChild(rootElement);

        // Process results array
        JSONArray results = jsonData.getJSONObject("data").getJSONArray("results");
        for (int i = 0; i < results.length(); i++) {
            JSONObject item = results.getJSONObject(i);
            
            // Create element for each item
            Element itemElement = doc.createElement(dataType.substring(0, dataType.length() - 1)); // singular form
            rootElement.appendChild(itemElement);
            
            // Process common fields
            addElement(doc, itemElement, "id", item.getInt("id"));
            
            // Process type-specific fields
            switch (dataType) {
                case "characters":
                    processCharacter(doc, itemElement, item);
                    break;
                case "comics":
                    processComic(doc, itemElement, item);
                    break;
                case "events":
                    processEvent(doc, itemElement, item);
                    break;
                case "series":
                    processSeries(doc, itemElement, item);
                    break;
            }
        }

        // Write to file
        String fileName = dataType + "_" + offset + ".xml";
        String filePath = outputDir + "/" + fileName;
        TransformerFactory transformerFactory = TransformerFactory.newInstance();
        Transformer transformer = transformerFactory.newTransformer();
        DOMSource source = new DOMSource(doc);
        StreamResult result = new StreamResult(new File(filePath));
        transformer.transform(source, result);
        
        return filePath;
    }
    
    private void processCharacter(Document doc, Element element, JSONObject character) {
        addElement(doc, element, "name", character.getString("name"));
        
        // Handle description (might be empty)
        String description = character.has("description") && !character.isNull("description") ? 
                character.getString("description") : "";
        addElement(doc, element, "description", description);
        
        // Process thumbnail
        JSONObject thumbnail = character.getJSONObject("thumbnail");
        String thumbnailPath = thumbnail.getString("path");
        String thumbnailExtension = thumbnail.getString("extension");
        addElement(doc, element, "thumbnailPath", thumbnailPath);
        addElement(doc, element, "thumbnailExtension", thumbnailExtension);
        addElement(doc, element, "thumbnailUrl", thumbnailPath + "." + thumbnailExtension);
        
        // Process comics
        if (character.has("comics") && !character.isNull("comics")) {
            JSONObject comics = character.getJSONObject("comics");
            addElement(doc, element, "comicsAvailable", comics.getInt("available"));
        }
    }
    
    private void processComic(Document doc, Element element, JSONObject comic) {
        addElement(doc, element, "title", comic.getString("title"));
        
        // Handle description (might be empty)
        String description = comic.has("description") && !comic.isNull("description") ? 
                comic.getString("description") : "";
        addElement(doc, element, "description", description);
        
        // Handle issue number
        if (comic.has("issueNumber")) {
            addElement(doc, element, "issueNumber", comic.getInt("issueNumber"));
        }
        
        // Handle dates
        if (comic.has("dates") && comic.getJSONArray("dates").length() > 0) {
            JSONArray dates = comic.getJSONArray("dates");
            for (int i = 0; i < dates.length(); i++) {
                JSONObject date = dates.getJSONObject(i);
                if (date.getString("type").equals("onsaleDate")) {
                    addElement(doc, element, "onsaleDate", date.getString("date"));
                    break;
                }
            }
        }
        
        // Process thumbnail
        if (comic.has("thumbnail") && !comic.isNull("thumbnail")) {
            JSONObject thumbnail = comic.getJSONObject("thumbnail");
            String thumbnailPath = thumbnail.getString("path");
            String thumbnailExtension = thumbnail.getString("extension");
            addElement(doc, element, "thumbnailPath", thumbnailPath);
            addElement(doc, element, "thumbnailExtension", thumbnailExtension);
            addElement(doc, element, "thumbnailUrl", thumbnailPath + "." + thumbnailExtension);
        }
        
        // Process series
        if (comic.has("series") && !comic.isNull("series")) {
            JSONObject series = comic.getJSONObject("series");
            if (series.has("resourceURI") && series.has("name")) {
                String seriesId = extractIdFromResourceURI(series.getString("resourceURI"));
                addElement(doc, element, "seriesId", seriesId);
                addElement(doc, element, "seriesName", series.getString("name"));
            }
        }
    }
    
    private void processEvent(Document doc, Element element, JSONObject event) {
        addElement(doc, element, "title", event.getString("title"));
        
        // Handle description (might be empty)
        String description = event.has("description") && !event.isNull("description") ? 
                event.getString("description") : "";
        addElement(doc, element, "description", description);
        
        // Handle start/end dates
        if (event.has("start") && !event.isNull("start")) {
            addElement(doc, element, "startDate", event.getString("start"));
        }
        if (event.has("end") && !event.isNull("end")) {
            addElement(doc, element, "endDate", event.getString("end"));
        }
        
        // Process thumbnail
        if (event.has("thumbnail") && !event.isNull("thumbnail")) {
            JSONObject thumbnail = event.getJSONObject("thumbnail");
            String thumbnailPath = thumbnail.getString("path");
            String thumbnailExtension = thumbnail.getString("extension");
            addElement(doc, element, "thumbnailPath", thumbnailPath);
            addElement(doc, element, "thumbnailExtension", thumbnailExtension);
            addElement(doc, element, "thumbnailUrl", thumbnailPath + "." + thumbnailExtension);
        }
    }
    
    private void processSeries(Document doc, Element element, JSONObject series) {
        addElement(doc, element, "title", series.getString("title"));
        
        // Handle description (might be empty)
        String description = series.has("description") && !series.isNull("description") ? 
                series.getString("description") : "";
        addElement(doc, element, "description", description);
        
        // Handle start/end years
        if (series.has("startYear")) {
            addElement(doc, element, "startYear", series.getInt("startYear"));
        }
        if (series.has("endYear")) {
            addElement(doc, element, "endYear", series.getInt("endYear"));
        }
        
        // Process thumbnail
        if (series.has("thumbnail") && !series.isNull("thumbnail")) {
            JSONObject thumbnail = series.getJSONObject("thumbnail");
            String thumbnailPath = thumbnail.getString("path");
            String thumbnailExtension = thumbnail.getString("extension");
            addElement(doc, element, "thumbnailPath", thumbnailPath);
            addElement(doc, element, "thumbnailExtension", thumbnailExtension);
            addElement(doc, element, "thumbnailUrl", thumbnailPath + "." + thumbnailExtension);
        }
    }
    
    private void addElement(Document doc, Element parent, String name, String value) {
        Element element = doc.createElement(name);
        element.appendChild(doc.createTextNode(value));
        parent.appendChild(element);
    }
    
    private void addElement(Document doc, Element parent, String name, int value) {
        addElement(doc, parent, name, String.valueOf(value));
    }
    
    private String extractIdFromResourceURI(String uri) {
        // Extract ID from URIs like "http://gateway.marvel.com/v1/public/series/12345"
        String[] parts = uri.split("/");
        return parts[parts.length - 1];
    }
}
